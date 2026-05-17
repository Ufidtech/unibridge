import { Router } from "express";
import { z } from "zod";
import { firebaseAuth, firebaseAdmin, firestore } from "../lib/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  selectedVibes: z.array(z.string()).optional(),
});

function getZodError(error) {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message || "Invalid form data.";
  }

  return null;
}

function handleServerError(res, error, routeName = "") {
  console.error(`❌ ${routeName} error:`, error);

  const zodError = getZodError(error);

  if (zodError) {
    return res.status(400).json({
      error: zodError,
    });
  }

  if (error?.code === "auth/id-token-expired") {
    return res.status(401).json({
      error: "Session expired. Please login again.",
    });
  }

  return res.status(500).json({
    error: "Something went wrong. Please try again.",
  });
}

/* =========================================================
   REGISTER MENTOR
========================================================= */

router.post("/register/mentor", async (req, res) => {
  try {
    console.log("/register/mentor called:", {
      email: req.body.email,
      role: "MENTOR",
    });

    const body = registerBaseSchema
      .extend({
        university: z.string().optional(),
        universityName: z.string().optional(),
        universityAbbr: z.string().optional(),
        level: z.string().optional(),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional(),
        rating: z.number().optional(),
        reviews: z.number().int().optional(),
        responseTime: z.string().optional(),
      })
      .parse(req.body);

    const email = body.email.toLowerCase().trim();

    const existingUser = await firebaseAuth
      .getUserByEmail(email)
      .catch(() => null);

    if (existingUser) {
      const userRef = firestore.collection("users").doc(existingUser.uid);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const now = new Date().toISOString();

        const userPayload = {
          uid: existingUser.uid,
          name: existingUser.displayName || body.name,
          email: existingUser.email,
          role: "MENTOR",
          createdAt: now,
          updatedAt: now,
        };

        const mentorProfile = {
          userId: existingUser.uid,
          university: body.university ?? null,
          universityName: body.universityName ?? null,
          universityAbbr: body.universityAbbr ?? null,
          level: body.level ?? null,
          bio: body.bio ?? null,
          skills: body.skills ?? [],
          rating: body.rating ?? 0,
          reviews: body.reviews ?? 0,
          selectedVibes: body.selectedVibes ?? [],
          responseTime: body.responseTime ?? null,
          createdAt: now,
          updatedAt: now,
        };

        const batch = firestore.batch();

        batch.set(userRef, userPayload);

        batch.set(
          firestore.collection("mentorProfiles").doc(existingUser.uid),
          mentorProfile,
        );

        await batch.commit();

        const customToken = await firebaseAdmin
          .auth()
          .createCustomToken(existingUser.uid, {
            role: "MENTOR",
          });

        return res.status(201).json({
          user: userPayload,
          customToken,
          alreadyExisted: true,
        });
      }

      return res.status(409).json({
        error: "Email is already in use.",
      });
    }

    let userRecord;

    try {
      userRecord = await firebaseAuth.createUser({
        email,
        password: body.password,
        displayName: body.name,
      });
    } catch (error) {
      console.error("❌ Firebase createUser error:", {
        code: error.code,
        message: error.message,
        email,
      });

      if (error.code === "auth/email-already-exists") {
        return res.status(409).json({
          error: "Email is already in use.",
        });
      }

      if (error.code === "auth/invalid-password") {
        return res.status(400).json({
          error: "Password must be at least 8 characters.",
        });
      }

      throw error;
    }

    await firebaseAuth.setCustomUserClaims(userRecord.uid, {
      role: "MENTOR",
    });

    const now = new Date().toISOString();

    const userPayload = {
      uid: userRecord.uid,
      name: body.name,
      email,
      role: "MENTOR",
      createdAt: now,
      updatedAt: now,
    };

    const mentorProfile = {
      userId: userRecord.uid,
      university: body.university ?? null,
      universityName: body.universityName ?? null,
      universityAbbr: body.universityAbbr ?? null,
      level: body.level ?? null,
      bio: body.bio ?? null,
      skills: body.skills ?? [],
      rating: body.rating ?? 0,
      reviews: body.reviews ?? 0,
      selectedVibes: body.selectedVibes ?? [],
      responseTime: body.responseTime ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const batch = firestore.batch();

    batch.set(
      firestore.collection("users").doc(userRecord.uid),
      userPayload,
    );

    batch.set(
      firestore.collection("mentorProfiles").doc(userRecord.uid),
      mentorProfile,
    );

    await batch.commit();

    const customToken = await firebaseAdmin
      .auth()
      .createCustomToken(userRecord.uid, {
        role: "MENTOR",
      });

    return res.status(201).json({
      user: userPayload,
      customToken,
    });
  } catch (error) {
    return handleServerError(res, error, "/register/mentor");
  }
});

/* =========================================================
   REGISTER MENTEE
========================================================= */

router.post("/register/mentee", async (req, res) => {
  try {
    console.log("/register/mentee called:", {
      email: req.body.email,
      role: "MENTEE",
    });

    const body = registerBaseSchema
      .extend({
        school: z.string().optional(),
        classLevel: z.string().optional(),
        dreamCourse: z.string().optional(),
      })
      .parse(req.body);

    const email = body.email.toLowerCase().trim();

    const existingUser = await firebaseAuth
      .getUserByEmail(email)
      .catch(() => null);

    if (existingUser) {
      const userRef = firestore.collection("users").doc(existingUser.uid);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const now = new Date().toISOString();

        const userPayload = {
          uid: existingUser.uid,
          name: existingUser.displayName || body.name,
          email: existingUser.email,
          role: "MENTEE",
          createdAt: now,
          updatedAt: now,
        };

        const menteeProfile = {
          userId: existingUser.uid,
          school: body.school ?? null,
          classLevel: body.classLevel ?? null,
          dreamCourse: body.dreamCourse ?? null,
          selectedVibes: body.selectedVibes ?? [],
          createdAt: now,
          updatedAt: now,
        };

        const batch = firestore.batch();

        batch.set(userRef, userPayload);

        batch.set(
          firestore.collection("menteeProfiles").doc(existingUser.uid),
          menteeProfile,
        );

        await batch.commit();

        const customToken = await firebaseAdmin
          .auth()
          .createCustomToken(existingUser.uid, {
            role: "MENTEE",
          });

        return res.status(201).json({
          user: userPayload,
          customToken,
          alreadyExisted: true,
        });
      }

      return res.status(409).json({
        error: "Email is already in use.",
      });
    }

    let userRecord;

    try {
      userRecord = await firebaseAuth.createUser({
        email,
        password: body.password,
        displayName: body.name,
      });
    } catch (error) {
      console.error("❌ Firebase createUser error:", {
        code: error.code,
        message: error.message,
        email,
      });

      if (error.code === "auth/email-already-exists") {
        return res.status(409).json({
          error: "Email is already in use.",
        });
      }

      if (error.code === "auth/invalid-password") {
        return res.status(400).json({
          error: "Password must be at least 8 characters.",
        });
      }

      throw error;
    }

    await firebaseAuth.setCustomUserClaims(userRecord.uid, {
      role: "MENTEE",
    });

    const now = new Date().toISOString();

    const userPayload = {
      uid: userRecord.uid,
      name: body.name,
      email,
      role: "MENTEE",
      createdAt: now,
      updatedAt: now,
    };

    const menteeProfile = {
      userId: userRecord.uid,
      school: body.school ?? null,
      classLevel: body.classLevel ?? null,
      dreamCourse: body.dreamCourse ?? null,
      selectedVibes: body.selectedVibes ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const batch = firestore.batch();

    batch.set(
      firestore.collection("users").doc(userRecord.uid),
      userPayload,
    );

    batch.set(
      firestore.collection("menteeProfiles").doc(userRecord.uid),
      menteeProfile,
    );

    await batch.commit();

    const customToken = await firebaseAdmin
      .auth()
      .createCustomToken(userRecord.uid, {
        role: "MENTEE",
      });

    return res.status(201).json({
      user: userPayload,
      customToken,
    });
  } catch (error) {
    return handleServerError(res, error, "/register/mentee");
  }
});

/* =========================================================
   VERIFY TOKEN
========================================================= */

router.post("/verify-token", async (req, res) => {
  try {
    const body = z
      .object({
        idToken: z.string().min(10),
      })
      .parse(req.body);

    const decodedToken = await firebaseAuth.verifyIdToken(body.idToken);

    const userRef = firestore.collection("users").doc(decodedToken.uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const authUser = await firebaseAuth.getUser(decodedToken.uid);

      const role = authUser.customClaims?.role || "MENTEE";

      const now = new Date().toISOString();

      const userPayload = {
        uid: decodedToken.uid,
        name:
          decodedToken.name ||
          decodedToken.email?.split("@")[0] ||
          "Unknown",
        email: decodedToken.email || null,
        role,
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(userPayload);

      return res.json({
        user: userPayload,
      });
    }

    return res.json({
      user: userDoc.data(),
    });
  } catch (error) {
    return handleServerError(res, error, "/verify-token");
  }
});

/* =========================================================
   GET CURRENT USER
========================================================= */

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userDoc = await firestore
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const user = userDoc.data();

    const profileCollection =
      user.role === "MENTOR"
        ? "mentorProfiles"
        : "menteeProfiles";

    const profileDoc = await firestore
      .collection(profileCollection)
      .doc(req.user.uid)
      .get();

      const profileData = profileDoc.exists
      ? profileDoc.data()
      : null;

    // Merge profile + rating safely
    const mergedProfile = profileData
      ? {
          ...profileData,

          // Mentor rating fields
          rating: Number(user.rating || 0),
          reviews: Number(user.reviews || 0),
          ratingCount: Number(user.ratingCount || 0),
        }
      : null;


    return res.json({
      user: {
        ...user,
        [user.role === "MENTOR"
          ? "mentorProfile"
          : "menteeProfile"]:
          mergedProfile,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "/me");
  }
});

/* =========================================================
   UPDATE PROFILE
========================================================= */

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).optional(),

        school: z.string().optional(),
        university: z.string().optional(),
        universityName: z.string().optional(),
        universityAbbr: z.string().optional(),

        classLevel: z.string().optional(),
        level: z.string().optional(),

        dreamCourse: z.string().optional(),

        bio: z.string().optional(),

        skills: z.array(z.string()).optional(),

        responseTime: z.string().optional(),

        selectedVibes: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const userRef = firestore
      .collection("users")
      .doc(req.user.uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const user = userDoc.data();

    if (body.name) {
      await firebaseAuth.updateUser(req.user.uid, {
        displayName: body.name,
      });

      await userRef.set(
        {
          name: body.name,
          updatedAt: new Date().toISOString(),
        },
        {
          merge: true,
        },
      );
    }

    const profileCollection =
      user.role === "MENTOR"
        ? "mentorProfiles"
        : "menteeProfiles";

    const profileRef = firestore
      .collection(profileCollection)
      .doc(req.user.uid);

    const profileDoc = await profileRef.get();

    const profileUpdates = {};

    if (body.school !== undefined)
      profileUpdates.school = body.school;

    if (body.university !== undefined)
      profileUpdates.university = body.university;

    if (body.universityName !== undefined)
      profileUpdates.universityName = body.universityName;

    if (body.universityAbbr !== undefined)
      profileUpdates.universityAbbr = body.universityAbbr;

    if (body.classLevel !== undefined)
      profileUpdates.classLevel = body.classLevel;

    if (body.level !== undefined)
      profileUpdates.level = body.level;

    if (body.dreamCourse !== undefined)
      profileUpdates.dreamCourse = body.dreamCourse;

    if (body.bio !== undefined)
      profileUpdates.bio = body.bio;

    if (body.skills !== undefined)
      profileUpdates.skills = body.skills;

    if (body.responseTime !== undefined)
      profileUpdates.responseTime = body.responseTime;

    if (body.selectedVibes !== undefined)
      profileUpdates.selectedVibes =
        body.selectedVibes;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updatedAt =
        new Date().toISOString();

      if (!profileDoc.exists) {
        await profileRef.set({
          userId: req.user.uid,
          ...profileUpdates,
        });
      } else {
        await profileRef.set(profileUpdates, {
          merge: true,
        });
      }
    }

    const updatedUserDoc = await userRef.get();

    const updatedProfileDoc = await profileRef.get();

    return res.json({
      user: {
        ...updatedUserDoc.data(),
        [user.role === "MENTOR"
          ? "mentorProfile"
          : "menteeProfile"]:
          updatedProfileDoc.exists
            ? updatedProfileDoc.data()
            : null,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "/me PATCH");
  }
});

router.get("/users/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("👀 Fetching public user profile:", {
      requester: req.user.uid,
      target: userId,
    });

    const userRef = firestore.collection("users").doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const user = userDoc.data();

    // Determine profile collection
    const profileCollection =
      user.role === "MENTOR"
        ? "mentorProfiles"
        : "menteeProfiles";

    const profileRef = firestore
      .collection(profileCollection)
      .doc(userId);

    const profileDoc = await profileRef.get();

    // Build safe public response
    const publicUser = {
      uid: user.uid,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,

      ...(user.role === "MENTOR"
        ? {
            mentorProfile: profileDoc.exists
              ? profileDoc.data()
              : null,
          }
        : {
            menteeProfile: profileDoc.exists
              ? profileDoc.data()
              : null,
          }),
    };

    console.log("✅ Public profile returned:", {
      uid: user.uid,
      role: user.role,
    });

    return res.json({
      user: publicUser,
    });
  } catch (error) {
    console.error("❌ Fetch public profile error:", error);

    return res.status(500).json({
      error: "Failed to fetch user profile.",
    });
  }
});

export default router;