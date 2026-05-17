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

  try {
    const data = await postJson("/api/auth/register/mentee", clean);

    if (!data?.customToken) {
      throw new Error("Unable to create account.");
    }

    const app = initFirebase();
    const auth = getAuth(app);

    await signInWithCustomToken(auth, data.customToken);

    const idToken = await auth.currentUser.getIdToken();

    localStorage.setItem("idToken", idToken);

    return {
      idToken,
      user: data.user,
    };
  } catch (err) {
    const errorMessage =
      err?.message ||
      "Registration failed. Please try again.";

    throw new Error(errorMessage);
  }
}

export async function registerMentor(payload) {
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v != null),
  );

  try {
    const data = await postJson("/api/auth/register/mentor", clean);

    if (!data?.customToken) {
      throw new Error("Unable to create account.");
    }

    const app = initFirebase();
    const auth = getAuth(app);

    await signInWithCustomToken(auth, data.customToken);

    const idToken = await auth.currentUser.getIdToken();

    localStorage.setItem("idToken", idToken);

    const verify = await postJson("/api/auth/verify-token", {
      idToken,
    });

    return {
      idToken,
      user: verify.user,
    };
  } catch (err) {
    const errorMessage =
      err?.response?.data?.error ||
      err?.message ||
      "Registration failed. Please try again.";

    throw new Error(errorMessage);
  }
}

export async function fetchMe() {
  try {
    const API = API_BASE + "/api/auth/me";

    const idToken = localStorage.getItem("idToken");

    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Unable to fetch account.");
    }

    return res.json();
  } catch {
    throw new Error("Unable to fetch account.");
  }
}

export async function updateMe(payload) {
  try {
    const API = API_BASE + "/api/auth/me";

    const idToken = localStorage.getItem("idToken");

    const res = await fetch(API, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Unable to update profile.");
    }

    return res.json();
  } catch {
    throw new Error("Unable to update profile.");
  }
}
export async function loginMentee(email, password) {
  try {
    const app = initFirebase();
    const auth = getAuth(app);

    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const idToken = await userCred.user.getIdToken(true);

    localStorage.setItem("idToken", idToken);

    const verify = await postJson("/api/auth/verify-token", {
      idToken,
    });

    return {
      idToken,
      user: verify.user,
    };
  } catch (err) {
    const msg = String(err?.message || "");

    if (
      msg.includes("auth/user-not-found") ||
      msg.includes("auth/wrong-password") ||
      msg.includes("auth/invalid-credential")
    ) {
      throw new Error("Invalid email or password.");
    }

    throw new Error("Unable to login. Please try again.");
  }
}

export async function loginMentor(email, password) {
  try {
    const app = initFirebase();
    const auth = getAuth(app);

    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const idToken = await userCred.user.getIdToken(true);

    localStorage.setItem("idToken", idToken);

    const verify = await postJson("/api/auth/verify-token", {
      idToken,
    });

    return {
      idToken,
      user: verify.user,
    };
  } catch (err) {
    const msg = String(err?.message || "");

    if (
      msg.includes("auth/user-not-found") ||
      msg.includes("auth/wrong-password") ||
      msg.includes("auth/invalid-credential")
    ) {
      throw new Error("Invalid email or password.");
    }

    throw new Error("Unable to login. Please try again.");
  }
}

export async function logout() {
  try {
    const app = initFirebase();
    const auth = getAuth(app);

    console.log(
      "👤 Current user before logout:",
      auth.currentUser?.email
    );

    await auth.signOut();

    localStorage.removeItem("idToken");

    sessionStorage.clear();

    console.log("✅ Firebase logout complete");
  } catch (error) {
    console.error("❌ Logout error:", error);

    throw error;
  }
}

export async function fetchUserProfile(userId) {
  const idToken = localStorage.getItem("idToken");

  const res = await fetch(
    `${API_BASE}/api/auth/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || "Failed to fetch profile"
    );
  }

  return data;
}