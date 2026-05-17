import React from "react";

export default function MentorProposals({
  proposalsList,
  onAcceptProposal,
  onDeclineProposal,
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">🔁 Proposals</h2>
      {proposalsList.length > 0 ? (
        <div className="space-y-3">
          {proposalsList.map((p) => {
            const isPending = !p.status || p.status === "PENDING";

            return (
              <div
                key={p.id}
                className={`bg-slate-900 border rounded-lg p-4 flex items-start justify-between transition ${
                  p.status === "ACCEPTED"
                    ? "border-green-500/30"
                    : p.status === "DECLINED"
                    ? "border-red-500/30"
                    : "border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-slate-200 font-semibold">
                      {p.menteeName} — {p.sessionTopic}
                    </div>
                    {/* Dynamic Status Badge */}
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                        p.status === "ACCEPTED"
                          ? "bg-green-500/10 text-green-400"
                          : p.status === "DECLINED"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {p.status || "PENDING"}
                    </span>
                  </div>

                  <div className="text-slate-400 text-sm mt-1">
                    {p.sessionDate} {p.sessionTime} ({p.timezone || "UTC"})
                  </div>

                  {p.notes && (
                    <div className="text-slate-300 text-sm mt-2">
                      <span className="font-semibold text-slate-400">Note: </span>
                      {p.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons - ONLY show if Pending */}
                {isPending && (
                  <div className="flex flex-col gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => onAcceptProposal(p)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition cursor-pointer"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => onDeclineProposal(p)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded transition cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
          No proposals at the moment.
        </div>
      )}
    </div>
  );
}