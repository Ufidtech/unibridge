import { initializeApp, getApps } from "firebase/app";

export function initFirebase() {
  if (getApps().length > 0) return getApps()[0];

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (!config.apiKey) {
    throw new Error(
      "Missing Firebase client config. Set VITE_FIREBASE_API_KEY and related Vite env vars.",
    );
  }

  return initializeApp(config);
}
