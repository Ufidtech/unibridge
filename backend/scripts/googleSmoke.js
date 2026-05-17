#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { google } from 'googleapis';

// Load backend .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

async function main() {
  try {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    console.log('GOOGLE_APPLICATION_CREDENTIALS=', credPath);
    if (!credPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set in backend/.env');
    }

    const keyFile = path.resolve(process.cwd(), 'backend', credPath);
    console.log('Resolved key file:', keyFile);

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const client = await auth.getClient();
    // Try to get an access token
    const at = await client.getAccessToken();
    console.log('Got access token (truncated):', (typeof at === 'string' ? at : at?.token)?.slice?.(0, 60) + '...');

    // Try a Calendar API call (may return empty or 403 depending on service account permissions)
    const calendar = google.calendar({ version: 'v3', auth: client });
    const res = await calendar.calendarList.list().catch((err) => {
      console.error('Calendar API call failed:', err?.response?.data || err.message || err);
      return null;
    });

    if (res && res.data) {
      console.log('Calendar list fetched. items:', Array.isArray(res.data.items) ? res.data.items.length : '(no items)');
      if (Array.isArray(res.data.items) && res.data.items.length > 0) console.dir(res.data.items.slice(0, 5));
    } else {
      console.log('No calendar data returned (this can be normal for service accounts without calendars).');
    }
    console.log('Google smoke-check completed successfully.');
  } catch (err) {
    console.error('Smoke-check failed:', err?.response?.data || err?.message || err);
    process.exitCode = 2;
  }
}

main();
