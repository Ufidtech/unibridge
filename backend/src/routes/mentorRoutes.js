import { Router } from 'express';
import { firestore } from '../lib/firebase.js';

const router = Router();

function mapMentorDoc(userDoc, profileDoc) {
  const user = userDoc.data();
  const profile = profileDoc.data();

  return {
    id: user.uid,
    initials: user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    name: user.name,
    university: profile.university,
    level: profile.level,
    bio: profile.bio,
    skills: profile.skills ?? [],
    rating: profile.rating ?? 0,
    reviews: profile.reviews ?? 0,
    responseTime: profile.responseTime ?? null,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const userSnapshot = await firestore.collection('users').where('role', '==', 'MENTOR').get();
    const mentors = [];

    for (const userDoc of userSnapshot.docs) {
      const profileDoc = await firestore.collection('mentorProfiles').doc(userDoc.id).get();

      if (profileDoc.exists) {
        mentors.push(mapMentorDoc(userDoc, profileDoc));
      }
    }

    return res.json({ mentors });
  } catch (error) {
    return next(error);
  }
});

router.get('/:mentorId', async (req, res, next) => {
  try {
    const mentorId = req.params.mentorId;
    const userDoc = await firestore.collection('users').doc(mentorId).get();

    if (!userDoc.exists || userDoc.data().role !== 'MENTOR') {
      return res.status(404).json({ error: 'Mentor not found.' });
    }

    const profileDoc = await firestore.collection('mentorProfiles').doc(mentorId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Mentor profile not found.' });
    }

    return res.json({ mentor: mapMentorDoc(userDoc, profileDoc) });
  } catch (error) {
    return next(error);
  }
});

export default router;