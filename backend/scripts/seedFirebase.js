import 'dotenv/config';
import process from 'node:process';
import { firebaseAdmin, firestore } from '../src/lib/firebase.js';

const mentorSeeds = [
  {
    name: 'Umar Farooq',
    email: 'umar.farooq@unibridge.local',
    password: 'Password123!',
    university: 'FUT Minna',
    level: '300L',
    bio: 'Frontend Dev and AI enthusiast. Help you balance GPA with coding. Avoid fresher mistakes.',
    skills: ['Frontend', 'React', 'Tech & CGPA'],
    rating: 4.9,
    reviews: 28,
    responseTime: '2 hours',
  },
  {
    name: 'Aisha Johnson',
    email: 'aisha.johnson@unibridge.local',
    password: 'Password123!',
    university: 'University of Lagos',
    level: '400L',
    bio: 'Med student with 4.3 CGPA. Specialize in JAMB prep and pre-med strategies. Helped 45+ students.',
    skills: ['JAMB Prep', 'Medical Track', 'Leadership'],
    rating: 4.8,
    reviews: 45,
    responseTime: '1 hour',
  },
];

const menteeSeed = {
  name: 'Ibrahim Musa',
  email: 'ibrahim.musa@unibridge.local',
  password: 'Password123!',
  school: 'Federal Government College',
  classLevel: 'SS3',
  dreamCourse: 'Computer Science',
};

async function seedUser(userData, role, profileCollection, profileData) {
  let userRecord;

  try {
    userRecord = await firebaseAdmin.auth().getUserByEmail(userData.email);
  } catch {
    userRecord = await firebaseAdmin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
    });
  }

  await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role });

  const now = new Date().toISOString();
  await firestore.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    name: userData.name,
    email: userData.email,
    role,
    createdAt: now,
    updatedAt: now,
  });

  await firestore.collection(profileCollection).doc(userRecord.uid).set({
    userId: userRecord.uid,
    ...profileData,
    createdAt: now,
    updatedAt: now,
  });
}

async function main() {
  for (const mentor of mentorSeeds) {
    await seedUser(
      mentor,
      'MENTOR',
      'mentorProfiles',
      {
        university: mentor.university,
        level: mentor.level,
        bio: mentor.bio,
        skills: mentor.skills,
        rating: mentor.rating,
        reviews: mentor.reviews,
        responseTime: mentor.responseTime,
      },
    );

    console.log(`Seeded mentor ${mentor.email}`);
  }

  await seedUser(
    menteeSeed,
    'MENTEE',
    'menteeProfiles',
    {
      school: menteeSeed.school,
      classLevel: menteeSeed.classLevel,
      dreamCourse: menteeSeed.dreamCourse,
    },
  );

  console.log(`Seeded mentee ${menteeSeed.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await firebaseAdmin.app().delete();
  });