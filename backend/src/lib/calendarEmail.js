import process from "node:process";

let googleClient = null;
let calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
let mailer = null;

// Local email preview store
const emailPreviewStore = [];

// =========================================================
// INIT GOOGLE CLIENT
// =========================================================

async function initGoogleClientIfNeeded() {
  if (googleClient || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return;
  }

  try {
    const { google } = await import("googleapis");

    const serviceAccount = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    );

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,

      key: serviceAccount.private_key,

      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    await jwtClient.authorize();

    googleClient = google.calendar({
      version: "v3",
      auth: jwtClient,
    });

    console.log("✅ Google Calendar initialized");
  } catch (err) {
    console.warn(
      "❌ Google Calendar failed:",
      err?.message || err,
    );

    googleClient = null;
  }
}

// =========================================================
// INIT MAILER
// =========================================================

async function initMailerIfNeeded() {
  if (
    mailer ||
    !(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    )
  ) {
    return;
  }

  try {
    const nodemailer = await import("nodemailer");

    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,

      port: Number(process.env.SMTP_PORT || 587),

      secure: process.env.SMTP_SECURE === "true",

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("✅ Mailer initialized");
  } catch (err) {
    console.warn("❌ Mailer init failed:", err?.message || err);

    mailer = null;
  }
}

// =========================================================
// CREATE REAL GOOGLE MEET EVENT
// =========================================================

export async function createCalendarEvent({
  summary,
  description,
  startDate,
  endDate,
  attendees = [],
}) {
  await initGoogleClientIfNeeded();

  if (!googleClient) {
    console.log("❌ Google client not initialized");

    return null;
  }

  try {
    const requestId = `unibridge-${Date.now()}`;

    console.log("📅 Creating Google Calendar event...");

    console.log({
      summary,
      startDate,
      endDate,
      attendees,
      calendarId,
    });

    const event = {
      summary,

      description,

      start: {
        dateTime: startDate,
        timeZone: "UTC",
      },

      end: {
        dateTime: endDate,
        timeZone: "UTC",
      },

      attendees: attendees
        .filter(Boolean)
        .map((email) => ({
          email,
        })),

      conferenceData: {
        createRequest: {
          requestId,

          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await googleClient.events.insert({
      calendarId,

      resource: event,

      conferenceDataVersion: 1,

      sendUpdates: "all",
    });

    console.log("✅ RAW GOOGLE RESPONSE:");
    console.dir(response.data, { depth: null });

    const createdEvent = response.data;

    const meetLink =
      createdEvent?.hangoutLink ||
      createdEvent?.conferenceData?.entryPoints?.find(
        (e) => e.entryPointType === "video",
      )?.uri ||
      null;

    console.log("🎥 GENERATED MEET LINK:", meetLink);

    if (!meetLink) {
      console.log("❌ No Google Meet link generated");
    }

    return {
      ...createdEvent,
      meetLink,
    };
  } catch (err) {
    console.log("❌ GOOGLE EVENT CREATION FAILED");

    console.dir(err?.response?.data || err, {
      depth: null,
    });

    return null;
  }
}

// =========================================================
// SEND EMAIL
// =========================================================

export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  await initMailerIfNeeded();

  // DEV MODE
  if (!mailer) {
    const preview = {
      to,
      subject,
      text,
      html,
      createdAt: new Date().toISOString(),
    };

    emailPreviewStore.unshift(preview);

    if (emailPreviewStore.length > 50) {
      emailPreviewStore.length = 50;
    }

    console.info(
      "📧 Email preview stored:",
      subject,
      "->",
      to,
    );

    return true;
  }

  try {
    await mailer.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to,

      subject,

      text,

      html,
    });

    return true;
  } catch (err) {
    console.warn(
      "❌ Failed to send email:",
      err?.message || err,
    );

    return false;
  }
}

// =========================================================
// TEST HELPERS
// =========================================================

export function _resetForTests() {
  googleClient = null;
  mailer = null;
}

export function _getEmailPreviews(limit = 20) {
  return emailPreviewStore.slice(0, limit);
}