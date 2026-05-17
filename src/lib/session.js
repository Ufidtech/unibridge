// Session helpers for frontend usage

export const defaultSessionForm = {
  mentorId: "",
  mentorName: "",
  mentorEmail: "",
  topic: "",
  sessionDate: "", // YYYY-MM-DD
  sessionTime: "", // HH:mm
  timezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  notes: "",
};

/**
 * Convert session form into ISO datetime string
 * Example:
 * 2026-05-16T14:30:00+01:00
 */
export function toISODateTime({
  sessionDate,
  sessionTime,
}) {
  if (!sessionDate || !sessionTime) {
    console.warn(
      "⚠️ Missing sessionDate or sessionTime in toISODateTime"
    );
    return null;
  }

  try {
    const date = new Date(`${sessionDate}T${sessionTime}`);

    if (Number.isNaN(date.getTime())) {
      console.error("❌ Invalid date/time:", {
        sessionDate,
        sessionTime,
      });

      return null;
    }

    const offset = getLocalTimezoneOffset(date);

    const iso = `${sessionDate}T${sessionTime}:00${offset}`;

    console.log("🕒 Generated ISO datetime:", iso);

    return iso;
  } catch (error) {
    console.error(
      "🔥 Failed to generate ISO datetime:",
      error
    );

    return null;
  }
}

/**
 * Returns timezone offset like:
 * +01:00
 * -05:00
 */
function getLocalTimezoneOffset(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();

  const sign = offsetMinutes >= 0 ? "+" : "-";

  const hours = String(
    Math.floor(Math.abs(offsetMinutes) / 60)
  ).padStart(2, "0");

  const minutes = String(
    Math.abs(offsetMinutes) % 60
  ).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

/**
 * Build clean payload for backend
 */
export function buildSessionPayload(form) {
  const payload = {
    mentorId: String(form.mentorId || "").trim(),
    topic: String(
      form.topic || form.mentorName || ""
    ).trim(),

    sessionDate: String(form.sessionDate || "").trim(),

    sessionTime: String(form.sessionTime || "").trim(),

    timezone: String(
      form.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC"
    ).trim(),

    notes: String(form.notes || "").trim(),

    // fallback/demo mentor support
    mentorName: String(form.mentorName || "").trim(),

    mentorEmail: String(form.mentorEmail || "").trim(),
  };

  console.log("📦 Built session payload:", payload);

  return payload;
}

export default {
  defaultSessionForm,
  toISODateTime,
  buildSessionPayload,
};