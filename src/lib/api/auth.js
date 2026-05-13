import {
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { initFirebase } from "../firebaseClient";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || res.statusText;
    } catch {
      const text = await res.text();
      errorMessage = text || res.statusText;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function registerMentee(payload) {
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v != null),
  );
  const data = await postJson("/api/auth/register/mentee", clean);
  if (!data?.customToken)
    throw new Error("No custom token returned from server");

  const app = initFirebase();
  const auth = getAuth(app);
  await signInWithCustomToken(auth, data.customToken);
  const idToken = await auth.currentUser.getIdToken();
  localStorage.setItem("idToken", idToken);

  const verify = await postJson("/api/auth/verify-token", { idToken });
  return { idToken, user: verify.user };
}

export async function registerMentor(payload) {
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v != null),
  );
  const data = await postJson("/api/auth/register/mentor", clean);
  if (!data?.customToken)
    throw new Error("No custom token returned from server");

  const app = initFirebase();
  const auth = getAuth(app);
  await signInWithCustomToken(auth, data.customToken);
  const idToken = await auth.currentUser.getIdToken();
  localStorage.setItem("idToken", idToken);

  const verify = await postJson("/api/auth/verify-token", { idToken });
  return { idToken, user: verify.user };
}

export async function fetchMe() {
  const API = API_BASE + "/api/auth/me";
  const idToken = localStorage.getItem("idToken");
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function loginMentee(email, password) {
  const app = initFirebase();
  const auth = getAuth(app);
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();
  localStorage.setItem("idToken", idToken);

  const verify = await postJson("/api/auth/verify-token", { idToken });
  return { idToken, user: verify.user };
}

export async function loginMentor(email, password) {
  const app = initFirebase();
  const auth = getAuth(app);
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();
  localStorage.setItem("idToken", idToken);

  const verify = await postJson("/api/auth/verify-token", { idToken });
  return { idToken, user: verify.user };
}

export async function logout() {
  const app = initFirebase();
  const auth = getAuth(app);
  await auth.signOut();
  localStorage.removeItem("idToken");
}
