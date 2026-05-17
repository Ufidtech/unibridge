export async function fetchEmailPreviews() {
  try {
    const res = await fetch('/api/dev/email-previews');
    if (!res.ok) throw new Error('Failed to fetch email previews');
    return res.json();
  } catch (err) {
    console.warn('Email preview fetch failed', err);
    return { previews: [] };
  }
}
