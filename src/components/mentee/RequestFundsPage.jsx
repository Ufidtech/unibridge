import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { createWalletRequestLink } from "../../lib/api/wallet";

const REQUEST_AMOUNT_KEY = "unibridge-request-amount";
const REQUEST_NOTE_KEY = "unibridge-request-note";
const REQUEST_SYNC_EVENT = "unibridge:request-funds-sync";

function readRequestState() {
  if (typeof window === "undefined") {
    return { amount: "5000", note: "" };
  }

  return {
    amount: window.localStorage.getItem(REQUEST_AMOUNT_KEY) || "5000",
    note: window.localStorage.getItem(REQUEST_NOTE_KEY) || "",
  };
}

function syncRequestState({ amount, note }) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(REQUEST_AMOUNT_KEY, String(amount || ""));
  window.localStorage.setItem(REQUEST_NOTE_KEY, String(note || ""));
  window.dispatchEvent(
    new CustomEvent(REQUEST_SYNC_EVENT, {
      detail: { amount: String(amount || ""), note: String(note || "") },
    }),
  );
}

export default function RequestFundsPage({
  userInfo = {},
  onNavigate = () => {},
}) {
  const location = useLocation();
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const menteeId = query.get("menteeId") || userInfo?.id || "me";
  const sponsorView = query.has("sponsor");
  const [amount, setAmount] = useState(
    () => query.get("amount") || readRequestState().amount,
  );
  const [note, setNote] = useState(
    () => query.get("note") || readRequestState().note,
  );

  useEffect(() => {
    const handleSync = (ev) => {
      const detail = ev?.detail || {};
      if (detail.amount != null) setAmount(String(detail.amount));
      if (detail.note != null) setNote(String(detail.note));
    };

    const handleStorage = (ev) => {
      if (ev.key === REQUEST_AMOUNT_KEY) setAmount(ev.newValue || "");
      if (ev.key === REQUEST_NOTE_KEY) setNote(ev.newValue || "");
    };

    window.addEventListener(REQUEST_SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(REQUEST_SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    syncRequestState({ amount, note });
  }, [amount, note]);

  const shareLink = useMemo(() => {
    const search = new URLSearchParams();
    search.set("menteeId", menteeId);
    if (amount) search.set("amount", String(amount));
    if (note) search.set("note", note);
    return `${window.location.origin}/request-funds?${search.toString()}`;
  }, [menteeId, amount, note]);

  const [creating, setCreating] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const createLink = async () => {
    setCreating(true);
    try {
      const resp = await createWalletRequestLink({
        amount: Number(amount || 0),
        note,
      });
      syncRequestState({ amount, note });
      if (resp?.requestLink?.url) {
        await navigator.clipboard.writeText(resp.requestLink.url);
        toast.success("Request link created and copied");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create request link");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        {sponsorView ? (
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-slate-200">
            Sponsor view detected. This link can be used to fund the mentee
            wallet directly.
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Request funds
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Share your wallet request
            </h1>
          </div>
          <button
            onClick={() => onNavigate("/mentee-dashboard")}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Back to dashboard
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => syncRequestState({ amount, note })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sponsor note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() =>
                window.localStorage.setItem(
                  REQUEST_NOTE_KEY,
                  String(note || ""),
                )
              }
              placeholder="e.g. Help me book a mentor session"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shareable link
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={shareLink}
              readOnly
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300"
            />
            <button
              onClick={copyLink}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Copy link
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-300">
              Prefill preview
            </p>
            <div className="mt-2 space-y-1 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Name:</span>{" "}
                {userInfo?.name || "Mentee"}
              </p>
              <p>
                <span className="text-slate-400">Level:</span>{" "}
                {userInfo?.level || "Not set"}
              </p>
              <p>
                <span className="text-slate-400">Mentee ID:</span> {menteeId}
              </p>
              <p>
                <span className="text-slate-400">Current target:</span> ₦
                {Number(amount || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              What sponsors will see
            </p>
            <p className="mt-2 text-sm text-slate-300">
              A simple funding page with your amount, note, and wallet
              destination.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={createLink}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create request link"}
          </button>
          <button
            onClick={copyLink}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Copy share link
          </button>
        </div>
      </div>
    </div>
  );
}
