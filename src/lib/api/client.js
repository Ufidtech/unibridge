const RAW_API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

function getJsonHeaders(options = {}) {
  return {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
}

let firebaseAuthReadyPromise = null;

async function waitForFirebaseUser(timeoutMs = 1500) {
  if (!firebaseAuthReadyPromise) {
    firebaseAuthReadyPromise = Promise.all([
      import("firebase/auth"),
      import("../firebaseClient"),
    ]).then(([{ getAuth, onAuthStateChanged }, { initFirebase }]) => {
      const auth = getAuth(initFirebase());

      if (auth.currentUser) return auth.currentUser;

      return new Promise((resolve) => {
        let unsubscribe = null;
        const timer = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          resolve(auth.currentUser || null);
        }, timeoutMs);

        unsubscribe = onAuthStateChanged(auth, (user) => {
          clearTimeout(timer);
          if (unsubscribe) unsubscribe();
          resolve(user || null);
        });
      });
    });
  }

  return firebaseAuthReadyPromise;
}

async function getStoredIdToken() {
  const localToken =
    typeof window !== "undefined" ? window.localStorage.getItem("idToken") : null;
  if (localToken) return localToken;

  try {
    const user = await waitForFirebaseUser();
    if (!user) return null;

    const token = await user.getIdToken();
    if (typeof window !== "undefined" && token) {
      window.localStorage.setItem("idToken", token);
    }
    return token;
  } catch {
    return null;
  }
}

export function getApiBase() {
  return API_BASE;
}


/**
 * Shared request helper
 */
export async function apiRequest(path, options = {}) {
  const idToken = await getStoredIdToken();

  const headers = getJsonHeaders(options);


  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }


  console.log(`🌐 API Request → ${options.method || "GET"} ${path}`);

  try {
    const url = path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        res.statusText ||
        "Request failed";

      console.error(`❌ API Error (${res.status}) →`, {
        path,
        method: options.method || "GET",
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    console.log(`✅ API Success → ${path}`, data);

    return data;
  } catch (error) {
    console.error(`🔥 Network/API Failure → ${path}`, error);

    const fallbackMessage = error?.message || "Something went wrong. Please try again.";
    const normalizedMessage = /selected time cannot be represented in the chosen timezone/i.test(fallbackMessage)
      || /the selected time does not work in the chosen timezone/i.test(fallbackMessage)
      ? "The selected time does not work in that timezone. Please choose another time."
      : /unexpected error/i.test(fallbackMessage)
        ? "We couldn't complete that action. Please try again."
        : fallbackMessage;


    throw new Error(normalizedMessage, { cause: error });

  }
}
