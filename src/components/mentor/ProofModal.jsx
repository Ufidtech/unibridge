import { useState } from 'react';

export default function ProofModal({ open = true, onClose = () => {}, onConfirm = () => {} }) {
  const [proof, setProof] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const canConfirm = proof.trim().length >= 5;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Provide Proof of Session</h3>
        <p className="text-slate-400 text-sm mb-4">Paste a meeting transcript link, recording URL, or brief notes confirming the session.</p>
        <input value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Proof URL or short note" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 mb-3" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 mb-3" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded cursor-pointer">Cancel</button>
          <button onClick={() => onConfirm({ proof: proof.trim(), notes: notes.trim() })} disabled={!canConfirm} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-slate-700 cursor-pointer">Mark Complete</button>
        </div>
      </div>
    </div>
  );
}
