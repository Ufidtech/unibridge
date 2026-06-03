import functions from 'firebase-functions';
import app from '../src/app.js';

// Export Express app as a single Cloud Function
export const api = functions.https.onRequest(app);
