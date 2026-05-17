import process from "node:process";

let googleClient = null;
let calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
let mailer = null;

// =========================================================
// LOCAL EMAIL PREVIEW STORE
// =========================================================

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
    console.warn(
      "❌ Mailer init failed:",
      err?.message || err,
    );

    mailer = null;
  }
}

// =========================================================
// CREATE GOOGLE CALENDAR EVENT + REAL GOOGLE MEET
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
    const requestId = `unibridge-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    console.log("📅 Creating Google Calendar event...");

    console.log({
      summary,
      startDate,
      endDate,
      attendees,
      calendarId,
    });

    // =========================================================
    // EVENT OBJECT
    // =========================================================

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

      guestsCanModify: false,

      guestsCanInviteOthers: false,

      guestsCanSeeOtherGuests: true,

      // IMPORTANT:
      // Do NOT use conferenceSolutionKey
      conferenceData: {
        createRequest: {
          requestId,
        },
      },
    };

    // =========================================================
    // CREATE EVENT
    // =========================================================

    const response = await googleClient.events.insert({
      calendarId,

      resource: event,

      conferenceDataVersion: 1,

      sendUpdates: "none",
    });

    console.log("✅ EVENT INSERTED");

    console.dir(response.data, {
      depth: null,
    });

    // =========================================================
    // WAIT FOR GOOGLE TO GENERATE MEET
    // =========================================================

    await new Promise((resolve) =>
      setTimeout(resolve, 2000),
    );

    // =========================================================
    // REFRESH EVENT
    // =========================================================

    const refreshed = await googleClient.events.get({
      calendarId,

      eventId: response.data.id,

      conferenceDataVersion: 1,
    });

    const createdEvent = refreshed.data;

    console.log("✅ REFRESHED EVENT:");

    console.dir(createdEvent, {
      depth: null,
    });

    // =========================================================
    // EXTRACT REAL GOOGLE MEET LINK
    // =========================================================

    const meetLink =
      createdEvent?.hangoutLink ||
      createdEvent?.conferenceData?.entryPoints?.find(
        (e) => e.entryPointType === "video",
      )?.uri ||
      null;

    console.log(
      "🎥 GENERATED GOOGLE MEET LINK:",
      meetLink,
    );

    if (!meetLink) {
      console.log(
        "❌ Google Meet link was NOT generated",
      );
    }

    return {
      ...createdEvent,
      meetLink,
    };
  } catch (err) {
    console.log("❌ GOOGLE EVENT CREATION FAILED");

    console.dir(
      err?.response?.data || err,
      {
        depth: null,
      },
    );

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

  // =========================================================
  // DEV MODE
  // =========================================================

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

  // =========================================================
  // REAL EMAIL
  // =========================================================

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

    console.log(
      "✅ Email sent:",
      subject,
      "->",
      to,
    );

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