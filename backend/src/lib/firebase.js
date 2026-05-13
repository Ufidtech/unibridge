import process from 'node:process';
import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'unibridge-7ea3e';
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  // Try to use service account credentials first (production/real Firebase)
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      console.log('✅ Using real Firebase service account credentials');
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
      });
    } catch (error) {
      console.error('❌ Failed to parse service account JSON:', error.message);
      // Fall through to other credential methods
    }
  }

  // Fall back to application default credentials
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

initializeFirebaseAdmin();

const app = admin.app();
export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();