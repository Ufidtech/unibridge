import { useState } from 'react';

export default function RateModal({ open = true, onClose = () => {}, onConfirm = () => {} }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Rate the Session</h3>
        <p className="text-slate-400 text-sm mb-4">How was your session? Give an honest rating and optional feedback.</p>
        <div className="mb-3">
          <label className="text-sm text-slate-300 mb-2 block">Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100">
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Okay</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Terrible</option>
          </select>
        </div>
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share feedback (optional)" rows={4} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 mb-3" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded cursor-pointer">Cancel</button>
          <button onClick={() => onConfirm({ rating, feedback })} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Submit Rating</button>
        </div>
      </div>
    </div>
  );
}
