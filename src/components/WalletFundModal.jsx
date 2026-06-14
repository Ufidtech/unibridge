import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { fundMyWallet } from "../lib/api/wallet";

export default function WalletFundModal({
  amount = 0,
  menteeName = "Mentee",
  onClose = () => {},
  onConfirm = () => {},
  shareLink = "",
}) {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(String(amount || 0));
  const parsedFundingAmount = Number(fundingAmount || 0);
  const platformFee = useMemo(
    () => Number((parsedFundingAmount * 0.02).toFixed(2)),
    [parsedFundingAmount],
  );
  const total = Number((parsedFundingAmount + platformFee).toFixed(2));

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handlePay = async () => {
    setSubmitting(true);
    try {
      await fundMyWallet({
        amount: parsedFundingAmount,
        note: `Wallet funding for ${menteeName}`,
        sponsorName: menteeName,
        source: "wallet_fund",
      });
      toast.success("Wallet funded successfully");
      onConfirm(parsedFundingAmount);
    } catch (err) {
      toast.error(err.message || "Failed to fund wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100">Fund Unibridge Wallet</h3>
        <p className="mt-2 text-sm text-slate-400">
          Fund your wallet with any amount. This updates the wallet balance directly.
        </p>

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">Amount</p>
          <label className="mt-2 block text-sm text-slate-300">Enter amount to fund</label>
          <input
            type="number"
            min="0"
            step="1"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <p className="mt-3 text-sm text-slate-300">Funds will be added to the mentee wallet.</p>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Funding amount</span>
              <span>₦{parsedFundingAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform fee</span>
              <span>₦{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-emerald-500/20 pt-2 font-semibold">
              <span>Total charged</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {shareLink && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Request funds link
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={shareLink}
                readOnly
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300"
              />
              <button
                onClick={handleCopy}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Fund Wallet"}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
