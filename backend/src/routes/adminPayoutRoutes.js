import { Router } from "express";
import { z } from "zod";
import { firestore } from "../lib/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function nowIso() {
  return new Date().toISOString();
}

async function listCollectionDocs(collectionName, queryBuilder = (q) => q) {
  const snapshot = await queryBuilder(firestore.collection(collectionName)).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

router.get("/private-bookings", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const bookings = await listCollectionDocs("privateBookingRequests", (q) =>
      q.orderBy("updatedAt", "desc")
    );
    const payouts = await listCollectionDocs("payouts", (q) =>
      q.where("payoutType", "==", "PRIVATE_BOOKING").orderBy("updatedAt", "desc")
    );

    return res.json({ bookings, payouts });
  } catch (err) {
    return next(err);
  }
});

router.post("/private-bookings/:sessionId/approve-payout", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const body = z.object({
      note: z.string().optional(),
    }).parse(req.body || {});

    const sessionId = req.params.sessionId;
    const sessionRef = firestore.collection("sessionRequests").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found." });
    }

    const session = sessionDoc.data();
    const mentorId = session.mentorId;
    const payment = session.payment || {};
    const baseAmount = Number(payment.baseAmount || payment.amount || 0);
    const mentorFee = Number(payment.mentorFee || (baseAmount * 0.05).toFixed(2));
    const mentorPayout = Number(payment.mentorPayout || (baseAmount - mentorFee).toFixed(2));

    const payoutRef = firestore.collection("payouts").doc();
    const payout = {
      provider: "opay",
      payoutType: "PRIVATE_BOOKING",
      sessionId,
      mentorId,
      currency: payment.currency || "NGN",
      amount: mentorPayout,
      feeBreakdown: payment.feeBreakdown || {
        baseAmount,
        mentorFee,
        mentorPayout,
      },
      status: "approved",
      approvalNote: body.note || null,
      requestedBy: req.user.uid,
      approvedBy: req.user.uid,
      verification: {
        status: "verified",
        verifiedAt: nowIso(),
        verifiedBy: req.user.uid,
        note: body.note || "Payout approved after admin verification",
      },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    await payoutRef.set(payout);

    await sessionRef.set(
      {
        payoutId: payoutRef.id,
        payoutStatus: "approved",
        payoutApprovedAt: nowIso(),
        privateBooking: true,
        updatedAt: nowIso(),
      },
      { merge: true },
    );

    await firestore.collection("privateBookingRequests").doc(sessionId).set(
      {
        sessionId,
        payoutId: payoutRef.id,
        payoutStatus: "approved",
        status: "approved",
        updatedAt: nowIso(),
      },
      { merge: true },
    );

    return res.status(201).json({ payoutId: payoutRef.id, payout });
  } catch (err) {
    return next(err);
  }
});

router.get("/mentor/history", requireAuth, requireRole("MENTOR"), async (req, res, next) => {
  try {
    const payouts = await listCollectionDocs("payouts", (q) =>
      q.where("mentorId", "==", req.user.uid).orderBy("updatedAt", "desc")
    );

    return res.json({ payouts });
  } catch (err) {
    return next(err);
  }
});

export default router;