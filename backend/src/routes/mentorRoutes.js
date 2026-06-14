import { Router } from "express";
import { firestore } from "../lib/firebase.js";

const router = Router();
const isDebugMentorsEnabled = process.env.DEBUG_MENTORS === "1" || process.env.NODE_ENV !== "production";

function mapMentorDoc(userDoc, profileDoc) {
  const user = userDoc.data() || {};
  const profile = profileDoc.data() || {};
  const freemiumSplit = profile.freemiumSplit || {};

  const profileSessionPrice =
    profile.sessionPrice ??
    profile.price ??
    profile.bookingPrice ??
    profile.session_price ??
    profile.mentorPrice ??
    profile.mentorProfilePrice ??
    profile.amount ??
    profile.rate ??
    profile.pricing?.session ??
    profile.pricing?.price ??
    null;
  const userSessionPrice = user.sessionPrice ?? user.price ?? null;
  const rawSessionPrice = profileSessionPrice ?? userSessionPrice ?? 0;
  const sessionPriceValue = Number(rawSessionPrice);
  const sessionPrice = Number.isFinite(sessionPriceValue) ? sessionPriceValue : 0;

  if (isDebugMentorsEnabled) {
    console.log("[mapMentorDoc] Price Debug:", {
      mentorId: userDoc.id,
      rawSessionPrice,
      sessionPrice,
      profileSessionPrice,
      userSessionPrice,
      type: typeof rawSessionPrice,
    });
  }


  return {
    // Use Firestore document ID
    id: userDoc.id,

    initials: (user.name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join(""),

    name: user.name || "Unknown Mentor",

    university:
      profile.universityName ||
      profile.university ||
      null,

    level: profile.level || null,

    bio: profile.bio || "",

    skills: Array.isArray(profile.skills)
      ? profile.skills
      : [],

    rating: Number(profile.rating ?? 0),

    reviews: Number(profile.reviews ?? 0),

    responseTime: profile.responseTime || "Response time unavailable",
    sessionPrice,
    rawSessionPrice,
    profileSessionPrice,
    userSessionPrice,


    mentorProfile: profile,

    payoutStatus:
      profile.payoutStatus || "unverified",

    payoutProvider:
      profile.payoutProvider || "opay",

    payoutAmount: Number(
      profile.payoutAmount ??
      sessionPrice ??
      0
    ),

    status:
      profile.status || "active",

    freemiumSplit: {
      freeGroupMasterclass:
        freemiumSplit.freeGroupMasterclass !== false,

      premiumOneOnOne:
        freemiumSplit.premiumOneOnOne !== false,

      groupLabel:
        freemiumSplit.groupLabel ||
        "Free group masterclass",

      premiumLabel:
        freemiumSplit.premiumLabel ||
        "Premium 1-on-1",
    },

    bookingOptions: {
      groupMasterclass:
        freemiumSplit.freeGroupMasterclass !== false,

      oneOnOne:
        freemiumSplit.premiumOneOnOne !== false,
    },
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const userSnapshot = await firestore
      .collection("users")
      .where("role", "==", "MENTOR")
      .get();
    const mentors = [];

    for (const userDoc of userSnapshot.docs) {
      const profileDoc = await firestore
        .collection("mentorProfiles")
        .doc(userDoc.id)
        .get();

      if (profileDoc.exists) {

        const rawProfile = profileDoc.data();
        if (isDebugMentorsEnabled) {
          console.log("[mentors] raw Firestore mentor profile fields:", {
            mentorId: userDoc.id,
            userFields: userDoc.data(),
            profileFields: rawProfile,
            priceFields: {
              sessionPrice: rawProfile?.sessionPrice,
              price: rawProfile?.price,
              bookingPrice: rawProfile?.bookingPrice,
              session_price: rawProfile?.session_price,
              mentorPrice: rawProfile?.mentorPrice,
              mentorProfilePrice: rawProfile?.mentorProfilePrice,
              amount: rawProfile?.amount,
              rate: rawProfile?.rate,
              pricing: rawProfile?.pricing,
            },
          });
        }

        const mentor = mapMentorDoc(userDoc, profileDoc);
        console.log("[mentors] mentor profile loaded:", {
          mentorId: mentor.id,
          name: mentor.name,
          sessionPrice: mentor.sessionPrice,
          rawSessionPrice: mentor.rawSessionPrice,
          profileSessionPrice: mentor.profileSessionPrice,
          userSessionPrice: mentor.userSessionPrice,
        });

        mentors.push(mentor);
      }


    }

    return res.json({ mentors });
  } catch (error) {
    return next(error);
  }
});

router.get("/:mentorId", async (req, res, next) => {
  try {
    const mentorId = req.params.mentorId;
    const userDoc = await firestore.collection("users").doc(mentorId).get();

    if (!userDoc.exists || userDoc.data().role !== "MENTOR") {
      return res.status(404).json({ error: "Mentor not found." });
    }

    const profileDoc = await firestore
      .collection("mentorProfiles")
      .doc(mentorId)
      .get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        error: "Mentor profile not found.",
      });
    }


    const rawProfile = profileDoc.data();
    if (isDebugMentorsEnabled) {
      console.log("[mentors] raw Firestore mentor profile fields:", {
        mentorId,
        userFields: userDoc.data(),
        profileFields: rawProfile,
        priceFields: {
          sessionPrice: rawProfile?.sessionPrice,
          price: rawProfile?.price,
          bookingPrice: rawProfile?.bookingPrice,
          session_price: rawProfile?.session_price,
          mentorPrice: rawProfile?.mentorPrice,
          mentorProfilePrice: rawProfile?.mentorProfilePrice,
          amount: rawProfile?.amount,
          rate: rawProfile?.rate,
          pricing: rawProfile?.pricing,
        },
      });
    }

    const mentor = mapMentorDoc(userDoc, profileDoc);
    console.log("[mentors] mentor profile detail loaded:", {
      mentorId: mentor.id,
      name: mentor.name,
      sessionPrice: mentor.sessionPrice,
      rawSessionPrice: mentor.rawSessionPrice,
      profileSessionPrice: mentor.profileSessionPrice,
      userSessionPrice: mentor.userSessionPrice,
    });



    return res.json({ mentor });

  } catch (error) {
    return next(error);
  }
});

export default router;
