import { useState } from "react";

export default function MentorGroupSessionFormModal({
  open = false,
  onClose = () => {},
  onSubmit = async () => {},
}) {
  const [groupForm, setGroupForm] = useState({
    title: "",
    description: "",
    datetime: "",
    durationMinutes: 60,
    capacity: 50,
    isRecorded: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      if (!groupForm.title.trim() || !groupForm.datetime.trim()) {
        setError("Title and date/time are required.");
        return;
      }

      setSaving(true);
      setError("");
      await onSubmit(groupForm);
      setGroupForm({
        title: "",
        description: "",
        datetime: "",
        durationMinutes: 60,
        capacity: 50,
        isRecorded: false,
      });
    } catch (err) {
      setError(err.message || "Failed to create group session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-100">Create Group Session</h3>
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">Title</label>
            <input
              value={groupForm.title}
              onChange={(e) =>
                setGroupForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              placeholder="e.g. CV Review + Internship Tips"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Description</label>
            <textarea
              value={groupForm.description}
              onChange={(e) =>
                setGroupForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-28 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              placeholder="What will attendees learn?"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Date & Time</label>
              <input
                type="datetime-local"
                value={groupForm.datetime}
                onChange={(e) =>
                  setGroupForm((prev) => ({ ...prev, datetime: e.target.value }))
                }
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={groupForm.durationMinutes}
                onChange={(e) =>
                  setGroupForm((prev) => ({
                    ...prev,
                    durationMinutes: e.target.value,
                  }))
                }
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Capacity</label>
              <input
                type="number"
                min="1"
                value={groupForm.capacity}
                onChange={(e) =>
                  setGroupForm((prev) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              />
            </div>

            <label className="mt-6 flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={groupForm.isRecorded}
                onChange={(e) =>
                  setGroupForm((prev) => ({
                    ...prev,
                    isRecorded: e.target.checked,
                  }))
                }
              />
              Recorded session
            </label>
          </div>
        </div>

        <div className="border-t border-slate-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded bg-slate-800 px-4 py-2 text-slate-200 hover:bg-slate-700"
            type="button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
            type="button"
          >
            {saving ? "Publishing..." : "Publish Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
