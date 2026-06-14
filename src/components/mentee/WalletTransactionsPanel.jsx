import { useEffect, useState } from "react";
import { fetchMyWalletTransactions } from "../../lib/api/wallet";

export default function WalletTransactionsPanel({ wallet = null }) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const balance = Number(remote?.balance ?? wallet?.currentBalance ?? 0);
  const transactions = Array.isArray(remote?.transactions)
    ? remote.transactions
    : Array.isArray(wallet?.transactionHistory)
      ? wallet.transactionHistory
      : [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchMyWalletTransactions();
        if (!cancelled) setRemote(data);
      } catch {
        if (!cancelled) setRemote(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Wallet history
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-100">
            Transaction details
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            A full log of wallet funding and session-related activity.
          </p>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Balance ₦{balance.toFixed(2)}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-slate-400">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-slate-400">
            No transactions yet.
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-100">
                  {tx.description || tx.type || "Wallet activity"}
                </p>
                <p className="text-xs text-slate-500">
                  {tx.createdAt || tx.date || "Recent activity"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-100">
                  {tx.amount ? `₦${Number(tx.amount).toFixed(2)}` : "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {tx.type || "transaction"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
