import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { approveAdminPrivatePayout, fetchAdminPrivateBookings } from "../../lib/api/sessions";
import AdminSidebar from "./AdminSidebar";

function money(n) {
  return `₦${Number(n || 0).toFixed(2)}`;
}

export default function AdminPayoutDashboard({ onNavigate = () => {} }) {
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAdminPrivateBookings();
      setBookings(data.bookings || []);
      setPayouts(data.payouts || []);
    } catch (err) {
      toast.error(err.message || "Unable to load payouts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const payoutBySession = useMemo(() => {
    const map = new Map();
    payouts.forEach((payout) => map.set(payout.sessionId, payout));
    return map;
  }, [payouts]);

  const summary = useMemo(() => {
    const pendingBookings = bookings.filter((booking) => {
      const payout = payoutBySession.get(booking.sessionId || booking.id);
      return !payout && booking.payoutStatus !== "approved";
    }).length;

    const approvedPayouts = payouts.filter((p) => ["approved", "completed", "processing"].includes(String(p.status || "").toLowerCase())).length;
    const totalPayoutAmount = payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);

    return {
      totalBookings: bookings.length,
      pendingBookings,
      approvedPayouts,
      totalPayoutAmount,
    };
  }, [bookings, payouts, payoutBySession]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar onNavigate={onNavigate} />
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Payout Dashboard</h1>
            <p className="text-slate-400">Review private bookings and approve mentor payouts.</p>
          </div>
          <button
            onClick={loadData}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Private bookings</div>
            <div className="mt-2 text-3xl font-bold">{summary.totalBookings}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Pending approvals</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">{summary.pendingBookings}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Approved payouts</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">{summary.approvedPayouts}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Total payout value</div>
            <div className="mt-2 text-3xl font-bold">{money(summary.totalPayoutAmount)}</div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Loading private bookings...</div>
        ) : (
          <div className="grid gap-4">
            {bookings.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No private bookings found.</div>
            ) : (
              bookings.map((booking) => {
                const payout = payoutBySession.get(booking.sessionId || booking.id);
                const payment = booking.payment || {};
                const status = payout?.status || booking.payoutStatus || payment.status || "pending";

                return (
                  <div key={booking.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold">{booking.topic || "Private booking"}</h2>
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">{status}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Mentor: {booking.mentor?.name || booking.mentorId || "Unknown"} • Mentee: {booking.mentee?.name || booking.menteeId || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-400">
                          Scheduled: {booking.sessionDate} at {booking.sessionTime}
                        </p>
                        <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-lg bg-slate-950/60 p-3">
                            <div className="text-slate-500">Base amount</div>
                            <div className="font-semibold">{money(payment.baseAmount || payment.amount)}</div>
                          </div>
                          <div className="rounded-lg bg-slate-950/60 p-3">
                            <div className="text-slate-500">Mentee fee / Platform</div>
                            <div className="font-semibold">{money(payment.menteeFee)}</div>
                          </div>
                          <div className="rounded-lg bg-slate-950/60 p-3">
                            <div className="text-slate-500">Mentor fee</div>
                            <div className="font-semibold">{money(payment.mentorFee)}</div>
                          </div>
                          <div className="rounded-lg bg-slate-950/60 p-3">
                            <div className="text-slate-500">Mentor payout</div>
                            <div className="font-semibold">{money(payment.mentorPayout || payout?.amount)}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Payment: {payment.status || "n/a"} • Payout: {booking.payoutStatus || "pending"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 md:min-w-[220px]">
                        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                          <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">Payout record</div>
                          <div>{payout ? payout.id : "No payout created yet"}</div>
                        </div>
                        <button
                          disabled={!!payout || approvingId === booking.id}
                          onClick={async () => {
                            setApprovingId(booking.id);
                            try {
                              await approveAdminPrivatePayout(booking.sessionId || booking.id, "Approved from admin dashboard");
                              toast.success("Payout approved");
                              await loadData();
                            } catch (err) {
                              toast.error(err.message || "Unable to approve payout");
                            } finally {
                              setApprovingId(null);
                            }
                          }}
                          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                        >
                          {payout ? "Approved / Exists" : approvingId === booking.id ? "Approving..." : "Approve payout"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}