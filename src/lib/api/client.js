const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3001";

/**
 * Shared request helper
 */
export async function apiRequest(path, options = {}) {
  const idToken = localStorage.getItem("idToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  console.log(`🌐 API Request → ${options.method || "GET"} ${path}`);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
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

    throw new Error(
      error?.message || "Something went wrong. Please try again.",
      { cause: error }
    );
  }
}
