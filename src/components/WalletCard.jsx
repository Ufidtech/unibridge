export default function WalletCard({
  wallet = null,
  onRequestFunds = () => {},
  onViewTransactions = () => {},
  shareLink = "",
  onCopyShareLink = () => {},
  shareLinkLabel = "Request Funds Link",
  balanceLabel = "Unibridge Wallet",
  shareLinkText = "Share your request link",
}) {
  const balance = Number(wallet?.currentBalance || 0);
  const transactions = Array.isArray(wallet?.transactionHistory)
    ? wallet.transactionHistory
    : [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            {balanceLabel}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-100">
            ₦{balance.toFixed(2)}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Wallet balance for premium 1-on-1 sessions and funding from
            sponsors.
          </p>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {transactions.length} transactions
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {transactions.length > 0
          ? "Recent wallet activity is shown below."
          : "No wallet activity yet."}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onRequestFunds}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Fund Wallet
        </button>
        <button
          onClick={onCopyShareLink}
          disabled={!shareLink}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {shareLinkText || shareLinkLabel}
        </button>
        <button
          onClick={onViewTransactions}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
        >
          View Transactions
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent activity
          </p>
          {transactions.slice(0, 3).map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-sm"
            >
              <span className="text-slate-300">
                {tx.description || tx.type || "Wallet activity"}
              </span>
              <span className="text-slate-400">
                {tx.amount ? `₦${Number(tx.amount).toFixed(2)}` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
