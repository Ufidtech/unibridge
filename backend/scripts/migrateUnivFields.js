#!/usr/bin/env node
/*
  Migration script: populate mentorProfiles.universityName and universityAbbr
  from existing mentorProfiles.university where possible.
  Run: node backend/scripts/migrateUnivFields.js
*/
import fs from 'fs';
import path from 'path';
import { firestore } from '../src/lib/firebase.js';

async function run() {
  console.log('Starting university migration...');
  const snap = await firestore.collection('mentorProfiles').get();
  console.log('Found', snap.size, 'mentor profiles');

  // Load local list to map abbreviations
  let list = [];
  try {
    // require the JS file by reading and evaluating minimal JSON-like content
    const raw = fs.readFileSync(path.resolve('src/data/nigeriaUniversities.js'), 'utf8');
    // crude extraction: find array start
    const arrStart = raw.indexOf('[');
    const arrText = raw.slice(arrStart);
    // eslint-disable-next-line no-eval
    list = eval('(' + arrText + ')');
  } catch (e) {
    console.warn('Failed to load local university list, migration will copy existing value into universityName');
  }

  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = {};
    if ((!data.universityName || !data.universityAbbr) && data.university) {
      // try to find matching abbr in list by name substring
      const found = list.find(u => data.university.toLowerCase().includes((u.name || '').toLowerCase()) || (u.abbr && data.university.toLowerCase().includes(u.abbr.toLowerCase())));
      if (found) {
        updates.universityName = found.name;
        updates.universityAbbr = found.abbr;
      } else {
        updates.universityName = data.university;
        updates.universityAbbr = 'OTHER';
      }
    }

    if (Object.keys(updates).length) {
      updates.updatedAt = new Date().toISOString();
      await firestore.collection('mentorProfiles').doc(doc.id).set(updates, { merge: true });
      console.log('Updated', doc.id, updates);
    }
  }

  console.log('Migration completed');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed', err);
  process.exit(2);
});
