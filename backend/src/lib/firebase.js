import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';

// Attempt to init real Firebase Admin SDK. If initialization fails or
// credentials aren't available, fall back to a lightweight in-memory mock
// that implements the subset of auth/firestore behavior used by the app.
function tryInitFirebaseAdmin() {
  try {
    if (admin.apps.length > 0) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID || 'unibridge-7ea3e';

    // Prefer FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string). If absent,
    // fall back to reading the JSON from GOOGLE_APPLICATION_CREDENTIALS file
    // (common when you set GOOGLE_APPLICATION_CREDENTIALS=./key.json).
    let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountJson && gacPath) {
      try {
        const resolved = path.isAbsolute(gacPath)
          ? gacPath
          : path.resolve(process.cwd(), gacPath);
        serviceAccountJson = fs.readFileSync(resolved, 'utf8');
        console.log(`ℹ️ Loaded service account JSON from ${resolved}`);
      } catch (err) {
        console.warn('⚠️ Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', err.message);
      }
    }

    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        console.log('✅ Using real Firebase service account credentials');
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
      } catch (err) {
        console.error('❌ Failed to parse service account JSON:', err.message);
        // fall through to mock
      }
    }

    // Only attempt to initialize with real credentials when a service account
    // JSON is provided. applicationDefault() can silently succeed but later
    // produce "invalid_grant" errors in environments without proper ADC.
    console.log('ℹ️ No service account JSON provided — skipping real Firebase initialization and using mock instead');
    return null;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    return null;
  }
}

const realApp = tryInitFirebaseAdmin();

let firebaseAdmin = null;
let firebaseAuth = null;
let firestore = null;

if (realApp) {
  const app = admin.app();
  firebaseAdmin = admin;
  firebaseAuth = admin.auth();
  firestore = admin.firestore();
} else {
  console.warn('⚠️ Falling back to in-memory Firebase mock for local development.');

  // In-memory mock implementation
  const collections = new Map();
  const usersByUid = new Map();
  const usersByEmail = new Map();
  const userClaims = new Map();
  let idCounter = 1;

  function makeId() {
    return `mock-${Date.now()}-${idCounter++}`;
  }

  function ensureCollection(name) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  }

  const mockFirestore = {
    collection(name) {
      const store = ensureCollection(name);

      return {
        doc(id) {
          // If no id provided, generate one (auto-id behavior)
          const docId = id || makeId();
          return {
            id: docId,
            async get() {
              const exists = store.has(docId);
              return {
                exists,
                id: docId,
                data() {
                  return store.get(docId) ?? null;
                },
              };
            },
            async set(data, options) {
              if (options && options.merge) {
                const existing = store.get(docId) || {};
                store.set(docId, { ...existing, ...data });
              } else {
                store.set(docId, data);
              }
              return { id: docId };
            },
          };
        },
        async add(data) {
          const id = makeId();
          const now = new Date().toISOString();
          store.set(id, { ...data, createdAt: data.createdAt ?? now });
          return { id };
        },
        where(field, op, value) {
          // only support '==' for our needs
          const all = Array.from(store.entries()).map(([id, data]) => ({ id, data }));
          const filtered = all.filter((pair) => pair.data?.[field] === value);
          return {
            orderBy() {
              return {
                async get() {
                  const docs = filtered.map((pair) => ({ id: pair.id, data: () => pair.data }));
                  return { docs };
                },
              };
            },
            async get() {
              const docs = filtered.map((pair) => ({ id: pair.id, data: () => pair.data }));
              return { docs };
            },
          };
        },
        orderBy(field, dir) {
          const all = Array.from(store.entries()).map(([id, data]) => ({ id, data }));
          // naive ordering by stringified field
          all.sort((a, b) => ((a.data[field] || '') > (b.data[field] || '') ? -1 : 1));
          return {
            async get() {
              const docs = all.map((pair) => ({ id: pair.id, data: () => pair.data }));
              return { docs };
            },
          };
        },
        async get() {
          const docs = Array.from(store.entries()).map(([id, data]) => ({ id, data: () => data }));
          return { docs };
        },
      };
    },
  };

  const mockAuth = {
    async getUserByEmail(email) {
      if (usersByEmail.has(email)) {
        return usersByEmail.get(email);
      }
      // mimic firebase-admin behavior by rejecting when not found
      const err = new Error('User not found');
      err.code = 'auth/user-not-found';
      throw err;
    },
    async createUser({ email, password, displayName }) {
      const uid = makeId();
      const user = { uid, email, displayName };
      usersByUid.set(uid, user);
      usersByEmail.set(email, user);
      // also write to users collection for requireAuth lookups
      ensureCollection('users').set(uid, { uid, name: displayName, email, role: 'MENTEE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      return user;
    },
    async setCustomUserClaims(uid, claims) {
      userClaims.set(uid, claims);
      return;
    },
    async verifyIdToken(token) {
      // Accept tokens in the form "mock:<uid>" or previously created custom tokens
      if (!token) {
        throw new Error('Invalid token');
      }
      const parts = token.split(':');
      const uid = parts.length === 2 ? parts[1] : token;
      if (!usersByUid.has(uid)) {
        throw new Error('Invalid token');
      }
      const user = usersByUid.get(uid);
      const claims = userClaims.get(uid) || {};
      return { uid: user.uid, email: user.email, name: user.displayName, ...claims };
    },
    // Provide createCustomToken on auth() to mirror firebase-admin API
    async createCustomToken(uid, claims) {
      return `mock:${uid}`;
    },
  };

  const mockAdmin = {
    auth() {
      return mockAuth;
    },
    firestore() {
      return mockFirestore;
    },
    // keep a createCustomToken helper similar to admin.auth().createCustomToken
    async createCustomToken(uid, claims) {
      return `mock:${uid}`;
    },
  };

  firebaseAdmin = mockAdmin;
  firebaseAuth = mockAuth;
  firestore = mockFirestore;
}

export { firebaseAdmin, firebaseAuth, firestore };