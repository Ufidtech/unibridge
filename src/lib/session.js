// Session helpers for frontend usage

const FALLBACK_TIMEZONE = "UTC";

export const defaultSessionForm = {
  mentorId: "",
  mentorName: "",
  mentorEmail: "",
  topic: "",
  sessionDate: "", // YYYY-MM-DD
  sessionTime: "", // HH:mm
  timezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE,
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
  timezone,
}) {
  if (!sessionDate || !sessionTime) {
    console.warn("⚠️ Missing sessionDate or sessionTime in toISODateTime");
    return null;
  }

  const normalizedTimezone = isValidTimeZone(timezone)
    ? timezone
    : FALLBACK_TIMEZONE;

  try {
    const candidate = new Date(`${sessionDate}T${sessionTime}:00`);

    if (Number.isNaN(candidate.getTime())) {
      console.error("❌ Invalid date/time:", { sessionDate, sessionTime });
      return null;
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: normalizedTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(candidate);

    const lookup = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    const renderedDate = `${lookup.year}-${lookup.month}-${lookup.day}`;
    const renderedTime = `${lookup.hour}:${lookup.minute}`;

    if (renderedDate !== sessionDate || renderedTime !== sessionTime) {
      console.error("❌ Timezone/date mismatch detected:", {
        sessionDate,
        sessionTime,
        timezone: normalizedTimezone,
        renderedDate,
        renderedTime,
      });
      return null;
    }

    return candidate.toISOString();
  } catch (error) {
    console.error("🔥 Failed to generate ISO datetime:", error);
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

  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

export function isValidTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return false;

  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
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