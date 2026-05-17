import { useEffect, useState } from 'react';
import { fetchEmailPreviews } from '../lib/api/dev';

export default function EmailPreviewPanel() {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchEmailPreviews();
      if (mounted) setPreviews(data.previews || []);
    })();
    return () => { mounted = false; };
  }, []);

  if (!previews.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-400">
        No email previews captured yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {previews.map((p, i) => (
        <details key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <summary className="text-slate-100 font-semibold">{p.subject} — {p.to} <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</span></summary>
          <div className="mt-2 text-slate-300 text-sm">
            <p><strong>To:</strong> {p.to}</p>
            <p><strong>Subject:</strong> {p.subject}</p>
            <p className="mt-2 whitespace-pre-wrap">{p.text}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
