"use client";

import { truncateAddress } from "@/lib/format";
import { explorerTxUrl } from "@/lib/constants";
import type { HistoryEntry } from "@/lib/stellar";

interface TransactionHistoryProps {
  entries: HistoryEntry[];
}

export function TransactionHistory({ entries }: TransactionHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-5">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 sm:mb-4 sm:text-sm">
        Transaction History
      </h2>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.hash}
            className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5 sm:p-3"
          >
            {/* Header row */}
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[10px] text-slate-500 sm:text-xs">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span className="shrink-0 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 sm:text-xs">
                {entry.recipientCount} recipient
                {entry.recipientCount > 1 ? "s" : ""}
              </span>
            </div>

            {/* Recipients - show max 3 on mobile, rest collapsed */}
            <div className="space-y-0.5">
              {entry.perRecipient.slice(0, 3).map((r) => (
                <div
                  key={r.address}
                  className="flex items-center justify-between gap-2 text-[10px] sm:text-xs"
                >
                  <span className="min-w-0 truncate font-mono text-slate-300">
                    {truncateAddress(r.address)}
                  </span>
                  <span className="shrink-0 font-mono font-medium text-slate-100">
                    {r.amount}
                  </span>
                </div>
              ))}
              {entry.perRecipient.length > 3 && (
                <p className="text-[10px] text-slate-500 sm:text-xs">
                  +{entry.perRecipient.length - 3} more
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-800 pt-1.5 sm:mt-2 sm:pt-2">
              <span className="min-w-0 truncate font-mono text-[10px] text-slate-500 sm:text-xs">
                {truncateAddress(entry.hash, 6, 4)}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] font-medium text-slate-300 sm:text-xs">
                  {entry.totalXlm} XLM
                </span>
                <a
                  href={explorerTxUrl(entry.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 underline underline-offset-2 hover:text-indigo-300 sm:text-xs"
                >
                  ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
