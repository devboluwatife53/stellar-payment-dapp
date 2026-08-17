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
    <section className="rounded-md border-[0.5px] border-white/7 bg-graphite p-3 sm:p-5">
      <h2 className="mb-2 text-[9px] font-medium uppercase tracking-wide text-ash sm:mb-4 sm:text-[10px]">
        Transaction History
      </h2>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.hash}
            className="rounded-sm border-[0.5px] border-white/8 bg-charcoal p-2.5 sm:p-3"
          >
            {/* Header row */}
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[10px] text-steel sm:text-xs">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span className="shrink-0 rounded-xs border-[0.5px] border-white/8 bg-graphite px-1.5 py-0.5 text-[10px] font-medium text-arc-blue sm:text-xs">
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
                  <span className="min-w-0 truncate font-mono text-chalk">
                    {truncateAddress(r.address)}
                  </span>
                  <span className="shrink-0 font-mono font-medium text-snow">
                    {r.amount}
                  </span>
                </div>
              ))}
              {entry.perRecipient.length > 3 && (
                <p className="text-[10px] text-steel sm:text-xs">
                  +{entry.perRecipient.length - 3} more
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t-[0.5px] border-white/7 pt-1.5 sm:mt-2 sm:pt-2">
              <span className="min-w-0 truncate font-mono text-[10px] text-steel sm:text-xs">
                {truncateAddress(entry.hash, 6, 4)}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] font-medium text-chalk sm:text-xs">
                  {entry.totalAmount} {entry.asset}
                </span>
                <a
                  href={explorerTxUrl(entry.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-arc-blue underline underline-offset-2 hover:text-signal-blue sm:text-xs"
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
