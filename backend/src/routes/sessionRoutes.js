import { Router } from "express";
import { z } from "zod";
import { firestore } from "../lib/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import process from "node:process";
import { createCalendarEvent, sendEmail, updateCalendarEvent } from "../lib/calendarEmail.js";

const router = Router();

const SESSION_DURATION_MINUTES = Number(
  process.env.SESSION_DURATION_MINUTES || 60,
);

// -------------------------
// HELPERS
// -------------------------

function log(...args) {
  console.log("[sessions]", ...args);
}

function warn(...args) {
  console.warn("[sessions]", ...args);
}

function errorLog(...args) {
  console.error("[sessions]", ...args);
}

function getZodError(error) {
  try {
    if (error instanceof z.ZodError) {
      return (
        error.issues?.[0]?.message ||
        error.errors?.[0]?.message ||
        "Invalid request data."
      );
    }

    return null;
  } catch (err) {
    console.error("[sessions] getZodError failed:", err);

    return "Validation failed.";
  }
}

async function parseSessionISO(sessionDate, sessionTime, timezone = "UTC") {
  try {
    if (!sessionDate || !sessionTime) return null;

    if (timezone) {
      try {
        const { DateTime } = await import("luxon");

        const dt = DateTime.fromISO(`${sessionDate}T${sessionTime}`, {
          zone: timezone,
        });

        if (dt.isValid) {
          return {
            startISO: dt.toISO(),
            endISO: dt.plus({ minutes: SESSION_DURATION_MINUTES }).toISO(),
            timezone,
          };
        }
      } catch (err) {
        warn("Luxon timezone parse failed, falling back to UTC:", err?.message);
      }
    }

    const formattedTime =
      sessionTime.length === 5 ? `${sessionTime}:00` : sessionTime;

    const startDate = new Date(`${sessionDate}T${formattedTime}Z`);

    if (isNaN(startDate.getTime())) {
      return null;
    }

    const endDate = new Date(
      startDate.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
    );

    return {
      startISO: startDate.toISOString(),
      endISO: endDate.toISOString(),
      timezone: "UTC",
    };
  } catch (err) {
    errorLog("parseSessionISO failed:", err);
    return null;
  }
}

function makeMeetCode(id) {
  const clean = String(id).replace(/[^a-z0-9]/gi, "");

  const a = clean.slice(0, 3) || Math.random().toString(36).slice(2, 5);

  const b = clean.slice(3, 7) || Math.random().toString(36).slice(2, 6);

  const c = clean.slice(7, 10) || Math.random().toString(36).slice(2, 5);

  return `${a}-${b}-${c}`.toLowerCase();
}

function mapSessionDoc(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
  };
}

async function createCalendarForSession(session) {
  try {
    const parsed = await parseSessionISO(
      session.sessionDate,
      session.sessionTime,
      session.timezone,
    );

    if (!parsed) {
      warn("Invalid session date/time");
      return null;
    }

    // -------------------------
    // PREVENT PAST DATES
    // -------------------------

    const startDate = new Date(parsed.startISO);
    const now = new Date();

    if (startDate.getTime() <= now.getTime()) {
      throw new Error("Session date/time must be in the future.");
    }

    // Optional:
    // Prevent bookings too close to current time
    // Example: minimum 15 minutes ahead

    const MIN_ADVANCE_MINUTES = 15;

    const minAllowed = new Date(
      now.getTime() + MIN_ADVANCE_MINUTES * 60 * 1000,
    );

    if (startDate.getTime() < minAllowed.getTime()) {
      throw new Error(
        `Sessions must be booked at least ${MIN_ADVANCE_MINUTES} minutes ahead.`,
      );
    }

    const event = await createCalendarEvent({
      summary: `Mentor Session: ${session.topic}`,

      description: `Session between ${
        session.mentee?.name || "Mentee"
      } and ${session.mentor?.name || "Mentor"}`,

      startDate: parsed.startISO,
      endDate: parsed.endISO,

      attendees: [session.mentee?.email, session.mentor?.email].filter(Boolean),
    });

    return event || null;
  } catch (err) {
    errorLog("Calendar event creation failed:", err);

    // IMPORTANT:
    // rethrow validation errors
    throw err;
  }
}

async function sendSessionEmails({ to, subject, text }) {
  try {
    if (!to) return;

    await sendEmail({
      to,
      subject,
      text,
    });

    log("Email sent to:", to);
  } catch (err) {
    warn("Failed sending email:", err?.message);
  }
}

// -------------------------
// GET ALL SESSIONS
// -------------------------

router.get("/", requireAuth, async (req, res, next) => {
  try {
    log("Fetching sessions for:", req.user.uid);

    const field = req.user.role === "MENTOR" ? "mentorId" : "menteeId";

    const snapshot = await firestore
      .collection("sessionRequests")
      .where(field, "==", req.user.uid)
      .get();

    const sessionRequests = snapshot.docs.map(mapSessionDoc).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({ sessionRequests });
  } catch (err) {
    errorLog("GET /sessions failed:", err);
    return next(err);
  }
});

// -------------------------
// CREATE SESSION
// -------------------------

router.post("/", requireAuth, requireRole("MENTEE"), async (req, res, next) => {
  try {
    log("Creating session request");

    const body = z
      .object({
        mentorId: z.string().min(1),
        topic: z.string().min(2),
        sessionDate: z.string().min(4),
        sessionTime: z.string().min(1),
        notes: z.string().optional(),
        timezone: z.string().optional(),
      })
      .parse(req.body);

    // -------------------------
    // CHECK MENTOR EXISTS
    // -------------------------

    const mentorDoc = await firestore
      .collection("users")
      .doc(body.mentorId)
      .get();

    if (!mentorDoc.exists || mentorDoc.data()?.role !== "MENTOR") {
      return res.status(404).json({
        error: "Mentor not found.",
      });
    }

    // -------------------------
    // BLOCK DUPLICATE ACTIVE SESSION
    // -------------------------

    const existingSessionsSnapshot = await firestore
      .collection("sessionRequests")
      .where("menteeId", "==", req.user.uid)
      .where("mentorId", "==", body.mentorId)
      .get();

    const hasActiveSession = existingSessionsSnapshot.docs.some((doc) => {
      const session = doc.data();

      return !["COMPLETED", "CANCELLED", "DECLINED"].includes(session.status);
    });

    if (hasActiveSession) {
      return res.status(400).json({
        error:
          "You already have an active session with this mentor. Complete or cancel it before booking another.",
      });
    }

    // -------------------------
    // GET MENTOR + MENTEE DATA
    // -------------------------

    const mentor = mentorDoc.data();

    const menteeProfileDoc = await firestore
      .collection("menteeProfiles")
      .doc(req.user.uid)
      .get();

    const menteeProfile = menteeProfileDoc.exists
      ? menteeProfileDoc.data()
      : null;

    const now = new Date().toISOString();

    const sessionRef = firestore.collection("sessionRequests").doc();

    const sessionRequest = {
      id: sessionRef.id,

      menteeId: req.user.uid,
      mentorId: body.mentorId,

      topic: body.topic,

      sessionDate: body.sessionDate,
      sessionTime: body.sessionTime,

      notes: body.notes || null,

      timezone: body.timezone || "UTC",

      status: "PENDING",

      meetLink: null,

      mentee: {
        id: req.user.uid,
        name: req.user.name,
        email: req.user.email,
        menteeProfile,
      },

      mentor: {
        id: mentorDoc.id,
        name: mentor.name,
        email: mentor.email,
      },

      createdAt: now,
      updatedAt: now,
    };

    // -------------------------
    // CREATE CALENDAR EVENT
    // -------------------------

    const calendarEvent = await createCalendarForSession(sessionRequest);

    if (calendarEvent) {
      sessionRequest.calendarEventId = calendarEvent.id || null;

      if (calendarEvent?.meetLink) {
        sessionRequest.meetLink = calendarEvent.meetLink;

        console.log("✅ REAL GOOGLE MEET LINK SAVED:", calendarEvent.meetLink);
      } else {
        console.log("❌ No real Meet link returned from Google");

        console.dir(calendarEvent, {
          depth: null,
        });
      }
    } else {
      console.log("❌ Calendar event creation returned null");
    }
    // -------------------------
    // SAVE SESSION
    // -------------------------

    await sessionRef.set(sessionRequest);

    // -------------------------
    // SEND EMAILS
    // -------------------------

    await sendSessionEmails({
      to: sessionRequest.mentor.email,
      subject: `New Session Request: ${sessionRequest.topic}`,
      text: `A new mentoring session has been requested for ${sessionRequest.sessionDate} at ${sessionRequest.sessionTime}.`,
    });

    await sendSessionEmails({
      to: sessionRequest.mentee.email,
      subject: `Session Request Created`,
      text: `Your mentoring session request has been created successfully.`,
    });

    log("Session created:", sessionRef.id);

    return res.status(201).json({
      sessionRequest,
    });
  } catch (err) {
    errorLog("POST /sessions failed:", err);

    const zodError = getZodError(err);

    if (zodError) {
      return res.status(400).json({
        error: zodError,
      });
    }

    return next(err);
  }
});

// -------------------------
// UPDATE SESSION STATUS
// -------------------------

router.patch(
  "/:sessionId/status",
  requireAuth,
  requireRole("MENTOR"),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          status: z.enum(["CONFIRMED", "DECLINED", "COMPLETED", "CANCELLED"]),
        })
        .parse(req.body);

      const sessionId = req.params.sessionId;

      const sessionRef = firestore.collection("sessionRequests").doc(sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: "Session not found.",
        });
      }

      const session = sessionDoc.data();

      if (session.mentorId !== req.user.uid) {
        return res.status(403).json({
          error: "You can only update your own sessions.",
        });
      }

      const updates = {
        status: body.status,
        updatedAt: new Date().toISOString(),
      };

      await sessionRef.set(updates, {
        merge: true,
      });

      log(`Session ${sessionId} updated to ${body.status}`);

      await sendSessionEmails({
        to: session.mentee?.email,
        subject: `Session ${body.status}`,
        text: `Your session "${session.topic}" is now ${body.status}.`,
      });

      const updatedDoc = await sessionRef.get();

      return res.json({
        sessionRequest: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      });
    } catch (err) {
      errorLog("PATCH /status failed:", err);

      const zodError = getZodError(err);

      if (zodError) {
        return res.status(400).json({
          error: zodError,
        });
      }

      return next(err);
    }
  },
);

// -------------------------
// COMPLETE SESSION
// -------------------------

router.patch(
  "/:sessionId/complete",
  requireAuth,
  requireRole("MENTOR"),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          proof: z.string().min(5),
        })
        .parse(req.body);

      const sessionRef = firestore
        .collection("sessionRequests")
        .doc(req.params.sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: "Session not found.",
        });
      }

      const session = sessionDoc.data();

      if (session.mentorId !== req.user.uid) {
        return res.status(403).json({
          error: "You can only complete your own sessions.",
        });
      }

      await sessionRef.set(
        {
          status: "COMPLETED",
          proof: body.proof,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      log("Session completed:", req.params.sessionId);

      return res.json({
        success: true,
      });
    } catch (err) {
      errorLog("PATCH /complete failed:", err);

      const zodError = getZodError(err);

      if (zodError) {
        return res.status(400).json({
          error: zodError,
        });
      }

      return next(err);
    }
  },
);

// -------------------------
// RATE SESSION
// -------------------------

router.post(
  "/:sessionId/rate",
  requireAuth,
  requireRole("MENTEE"),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          rating: z.number().min(1).max(5),
          feedback: z.string().optional(),
        })
        .parse(req.body);

      const sessionRef = firestore
        .collection("sessionRequests")
        .doc(req.params.sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: "Session not found.",
        });
      }

      const session = sessionDoc.data();

      // Security check
      if (session.menteeId !== req.user.uid) {
        return res.status(403).json({
          error: "You can only rate your own sessions.",
        });
      }

      // Only completed sessions can be rated
      if (session.status !== "COMPLETED") {
        return res.status(400).json({
          error: "Only completed sessions can be rated.",
        });
      }

      const ratings = Array.isArray(session.ratings) ? session.ratings : [];

      // Prevent duplicate rating
      const alreadyRated = ratings.some((r) => r.raterId === req.user.uid);

      if (alreadyRated) {
        return res.status(400).json({
          error: "You already rated this session.",
        });
      }

      // Create rating object
      const ratingObj = {
        id: `rating-${Date.now()}`,
        rating: body.rating,
        feedback: body.feedback || null,
        raterId: req.user.uid,
        createdAt: new Date().toISOString(),
      };

      // Add rating to session
      ratings.push(ratingObj);

      // SAVE ratings into session document
      await sessionRef.set(
        {
          ratings,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // -------------------------
      // UPDATE MENTOR OVERALL RATING
      // -------------------------

      const mentorRef = firestore.collection("users").doc(session.mentorId);

      const mentorDoc = await mentorRef.get();

      const mentorData = mentorDoc.data() || {};

      const currentTotal = mentorData.ratingTotal || 0;
      const currentCount = mentorData.ratingCount || 0;

      const newTotal = currentTotal + body.rating;
      const newCount = currentCount + 1;

      const newAverage = newTotal / newCount;

      await mentorRef.set(
        {
          rating: Number(newAverage.toFixed(1)),
          ratingTotal: newTotal,
          ratingCount: newCount,
          reviews: newCount,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // ADD THIS NEW BLOCK: Update the mentorProfiles collection so the MentorCard can see it!
      const mentorProfileRef = firestore
        .collection("mentorProfiles")
        .doc(session.mentorId);
      await mentorProfileRef.set(
        {
          rating: Number(newAverage.toFixed(1)),
          reviews: newCount,
        },
        { merge: true },
      );

      // -------------------------
      // OPTIONAL EMAIL TO MENTOR
      // -------------------------

      if (session.mentor?.email) {
        await sendSessionEmails({
          to: session.mentor.email,
          subject: "You received a new mentor rating",
          text: `
${session.mentee?.name || "A mentee"} rated your session.

Rating: ${body.rating}/5

Feedback:
${body.feedback || "No feedback"}

Topic:
${session.topic}
`,
        });
      }

      log("Session rated:", req.params.sessionId);

      return res.json({
        success: true,
        rating: ratingObj,
      });
    } catch (err) {
      errorLog("POST /rate failed:", err);

      const zodError = getZodError(err);

      if (zodError) {
        return res.status(400).json({
          error: zodError,
        });
      }

      return next(err);
    }
  },
);

// -------------------------
// CANCEL SESSION
// -------------------------

router.patch("/:sessionId/cancel", requireAuth, async (req, res, next) => {
  try {
    const sessionRef = firestore
      .collection("sessionRequests")
      .doc(req.params.sessionId);

    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        error: "Session not found.",
      });
    }

    const session = sessionDoc.data();

    const allowed =
      session.menteeId === req.user.uid || session.mentorId === req.user.uid;

    if (!allowed) {
      return res.status(403).json({
        error: "You can only cancel your own sessions.",
      });
    }

    await sessionRef.set(
      {
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    log("Session cancelled:", req.params.sessionId);

    return res.json({
      success: true,
    });
  } catch (err) {
    errorLog("PATCH /cancel failed:", err);

    const zodError = getZodError(err);

    if (zodError) {
      return res.status(400).json({
        error: zodError,
      });
    }

    return next(err);
  }
});

// -------------------------
// RESCHEDULE SESSION
// -------------------------

router.patch(
  "/:sessionId/reschedule",
  requireAuth,
  requireRole("MENTOR"),
  async (req, res, next) => {
    try {
      log("📅 Reschedule route hit");

      const body = z
        .object({
          sessionDate: z.string().min(4),
          sessionTime: z.string().min(1),
          timezone: z.string().optional(),
        })
        .parse(req.body);

      const sessionId = req.params.sessionId;

      const sessionRef = firestore
        .collection("sessionRequests")
        .doc(sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: "Session not found.",
        });
      }

      const session = sessionDoc.data();

      // Security
      if (session.mentorId !== req.user.uid) {
        return res.status(403).json({
          error:
            "You can only reschedule your own sessions.",
        });
      }

      // -------------------------
      // PARSE DATE/TIME
      // -------------------------

      const timezone =
        body.timezone ||
        session.timezone ||
        "UTC";

      const parsed = await parseSessionISO(
        body.sessionDate,
        body.sessionTime,
        timezone
      );

      if (!parsed) {
        return res.status(400).json({
          error: "Invalid date/time.",
        });
      }

      // Current UTC timestamp
const now = Date.now();

// Parsed session timestamp
const sessionTimestamp =
  new Date(parsed.startISO).getTime();

console.log("Current:", new Date(now));
console.log(
  "Requested:",
  new Date(sessionTimestamp)
);

if (
  isNaN(sessionTimestamp) ||
  sessionTimestamp <= now
) {
  return res.status(400).json({
    error:
      "Cannot select a past date or time.",
  });
}

      // -------------------------
      // UPDATE GOOGLE EVENT
      // -------------------------

      let calendarUpdated = false;

      if (session.calendarEventId) {
        try {
          console.log(
            "📅 Updating Google event:",
            session.calendarEventId
          );

          const result =
            await updateCalendarEvent({
              eventId:
                session.calendarEventId,

              startDate:
                parsed.startISO,

              endDate:
                parsed.endISO,

              summary:
                `Mentor Session: ${session.topic}`,

              description:
                `Session between ${
                  session.mentee?.name ||
                  "Mentee"
                } and ${
                  session.mentor?.name ||
                  "Mentor"
                }`,
            });

          if (result) {
            calendarUpdated = true;

            console.log(
              "✅ Google event updated"
            );
          }
        } catch (err) {
          console.log(
            "⚠️ Calendar update failed:"
          );

          console.dir(
            err?.response?.data || err,
            { depth: null }
          );

          // Continue anyway
        }
      }

      // -------------------------
      // UPDATE FIRESTORE
      // -------------------------

      const updates = {
        sessionDate: body.sessionDate,
        sessionTime: body.sessionTime,
        timezone,
        status: "CONFIRMED",
        updatedAt:
          new Date().toISOString(),
      };

      await sessionRef.set(
        updates,
        { merge: true }
      );

      const updatedDoc =
        await sessionRef.get();

      const updatedSession =
        updatedDoc.data();

      console.log(
        "✅ Session rescheduled:",
        updatedDoc.id
      );

      // -------------------------
      // EMAIL
      // -------------------------

      await sendSessionEmails({
        to: session.mentee?.email,

        subject:
          "Session Rescheduled",

        text: `
Your session has been rescheduled.

Topic:
${updatedSession.topic}

New Date:
${updatedSession.sessionDate}

New Time:
${updatedSession.sessionTime}

Timezone:
${updatedSession.timezone}

Meet Link:
${updatedSession.meetLink || "Available in dashboard"}
`,
      });

      return res.json({
        success: true,

        calendarUpdated,

        sessionRequest: {
          id: updatedDoc.id,
          ...updatedSession,
        },
      });

    } catch (err) {
      errorLog(
        "PATCH /reschedule failed:",
        err
      );

      const zodError =
        getZodError(err);

      if (zodError) {
        return res.status(400).json({
          error: zodError,
        });
      }

      return next(err);
    }
  }
);

// -------------------------
// PROPOSE NEW TIME (MENTEE)
// -------------------------
router.post(
  "/:sessionId/propose",
  requireAuth,
  requireRole("MENTEE"),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          sessionDate: z.string().min(4),
          sessionTime: z.string().min(1),
          notes: z.string().optional(),
        })
        .parse(req.body);

      const sessionRef = firestore
        .collection("sessionRequests")
        .doc(req.params.sessionId);

      const doc = await sessionRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Session not found" });
      }

      const session = doc.data();

      if (session.menteeId !== req.user.uid) {
        return res.status(403).json({
          error: "Not your session",
        });
      }

      if (session.status !== "CONFIRMED") {
        return res.status(400).json({
          error: "You can only propose a new time for confirmed sessions.",
        });
      }
      const proposal = {
        id: `prop_${Date.now()}`,
        sessionDate: body.sessionDate,
        sessionTime: body.sessionTime,
        notes: body.notes || "",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      const proposals = Array.isArray(session.proposals)
        ? session.proposals
        : [];

      proposals.push(proposal);

      await sessionRef.set(
        {
          proposals,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // -------------------------
      // EMAIL TO MENTOR
      // -------------------------

      if (session.mentor?.email) {
        await sendSessionEmails({
          to: session.mentor.email,
          subject: "New session time proposal",

          text: `
${session.mentee?.name || "A mentee"} proposed a new session time.

New proposed schedule:
${proposal.sessionDate} at ${proposal.sessionTime}

Topic:
${session.topic}

Notes:
${proposal.notes || "No notes"}
`,
        });
      }

      return res.json({
        success: true,
        proposal,
      });
    } catch (err) {
      return next(err);
    }
  },
);

// -------------------------
// MENTOR RESPOND TO PROPOSAL
// -------------------------
router.patch(
  "/:sessionId/proposals/:proposalId/status",
  requireAuth,
  requireRole("MENTOR"),
  async (req, res, next) => {
    try {
      const { sessionId, proposalId } = req.params;

      const body = z
        .object({
          status: z.enum(["ACCEPTED", "DECLINED"]),
        })
        .parse(req.body);

      const sessionRef = firestore.collection("sessionRequests").doc(sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: "Session not found",
        });
      }

      const session = sessionDoc.data();

      // Security check
      if (session.mentorId !== req.user.uid) {
        return res.status(403).json({
          error: "Not your session",
        });
      }

      // Only confirmed sessions support proposal responses
      if (session.status !== "CONFIRMED") {
        return res.status(400).json({
          error: "Only confirmed sessions can process proposals.",
        });
      }
      const proposals = Array.isArray(session.proposals)
        ? session.proposals
        : [];

      let targetProposal = null;

      const existingProposal = proposals.find((p) => p.id === proposalId);

      if (!existingProposal) {
        return res.status(404).json({
          error: "Proposal not found",
        });
      }

      if (existingProposal.status !== "PENDING") {
        return res.status(400).json({
          error: "Proposal already processed",
        });
      }

      const updatedProposals = proposals.map((p) => {
        // Target proposal
        if (p.id === proposalId) {
          targetProposal = {
            ...p,
            status: body.status,
            respondedAt: new Date().toISOString(),
          };

          return targetProposal;
        }

        // Auto decline other pending proposals
        if (
          body.status === "ACCEPTED" &&
          (!p.status || p.status === "PENDING")
        ) {
          return {
            ...p,
            status: "DECLINED",
            respondedAt: new Date().toISOString(),
          };
        }

        return p;
      });

      // Optional:
      // If accepted, automatically update session time
      // Optional:
// If accepted, automatically update session + calendar

let sessionUpdates = {};

if (body.status === "ACCEPTED" && targetProposal) {

  const timezone =
    targetProposal.timezone ||
    session.timezone ||
    "UTC";

  const parsed = await parseSessionISO(
    targetProposal.sessionDate,
    targetProposal.sessionTime,
    timezone
  );

  if (!parsed) {
    return res.status(400).json({
      error: "Invalid proposal date/time",
    });
  }

  const proposedStart = new Date(
    parsed.startISO
  );

  if (proposedStart <= new Date()) {
    return res.status(400).json({
      error:
        "Cannot accept a proposal in the past",
    });
  }

  if (session.calendarEventId) {
    try {
      await updateCalendarEvent({
        eventId: session.calendarEventId,
        startDate: parsed.startISO,
        endDate: parsed.endISO,
        summary: `Mentor Session: ${session.topic}`,
        description: `Session between ${
          session.mentee?.name || "Mentee"
        } and ${
          session.mentor?.name || "Mentor"
        }`,
      });

    } catch (err) {
      return res.status(500).json({
        error:
          "Failed to update calendar event",
      });
    }
  }

  sessionUpdates = {
    sessionDate:
      targetProposal.sessionDate,

    sessionTime:
      targetProposal.sessionTime,

    timezone,

    status: "CONFIRMED",
  };
}


// =====================
// SAVE TO FIRESTORE
// =====================

await sessionRef.set(
  {
    proposals: updatedProposals,
    ...sessionUpdates,
    updatedAt:
      new Date().toISOString(),
  },
  {
    merge: true,
  }
);


// Get fresh version
const updatedDoc =
  await sessionRef.get();

const updatedSession =
  updatedDoc.data();

console.log(
  "✅ Saved proposal response:",
  updatedSession.proposals
);

      // -------------------------
      // EMAIL TO MENTEE
      // -------------------------

      if (session.mentee?.email) {
        await sendSessionEmails({
          to: session.mentee.email,
          subject:
            body.status === "ACCEPTED"
              ? "Your proposed session time was accepted"
              : "Your proposed session time was declined",

          text:
            body.status === "ACCEPTED"
              ? `Your mentor accepted your proposed session time.

New session:
${targetProposal.sessionDate} at ${targetProposal.sessionTime}

Topic: ${session.topic}
`
              : `Your mentor declined your proposed session time.

Topic: ${session.topic}
`,
        });
      }

      return res.json({
        success: true,
        proposal: targetProposal,
      });
    } catch (err) {
      return next(err);
    }
  },
);
export default router;
