import { initializeApp, getApps } from "firebase/app";

export function initFirebase() {
  if (getApps().length > 0) return getApps()[0];

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Helpful diagnostics for common dev setup mistakes: many users keep
  // a `.env.local` with placeholder values (e.g. "your-firebase-api-key") which
  // silently override a working `.env`. Detect obvious placeholders and fail
  // fast with an actionable message.
  const apiKey = String(config.apiKey || "").trim();
  const placeholderPattern = /^your-|your$|project-id|your-project|abcdef|123456/iu;

  if (!apiKey) {
    throw new Error(
      "Missing Firebase client config. Set VITE_FIREBASE_API_KEY and related Vite env vars in .env or .env.local.",
    );
  }

  if (placeholderPattern.test(apiKey) || apiKey === "your-firebase-api-key") {
    const msg = [
      'Detected placeholder Firebase client config (VITE_FIREBASE_API_KEY looks like a template).',
      'Either update `./.env.local` with your project values or remove `./.env.local` so the real `./.env` values are used.',
      'You can copy values from the Firebase console -> Project settings -> Your apps (Web) -> Config.',
      'Example keys start with "AIza". After updating, restart the dev server.',
    ].join(' ');
    // Log to console for easier browser debugging, then throw so init fails visibly.
    // eslint-disable-next-line no-console
    console.error(msg);
    throw new Error(msg);
  }

  return initializeApp(config);
}
