"use client";

import { formatAmount } from "@/lib/format";
import { Alert } from "./Alert";

interface BalanceCardProps {
  xlm: string | null;
  usdc: string | null;
  funded: boolean;
  loading: boolean;
  funding: boolean;
  addingTrustline: boolean;
  error: string | null;
  onRefresh: () => void;
  onFund: () => void;
  onAddTrustline: () => void;
}

export function BalanceCard({
  xlm,
  usdc,
  funded,
  loading,
  funding,
  addingTrustline,
  error,
  onRefresh,
  onFund,
  onAddTrustline,
}: BalanceCardProps) {
  return (
    <section className="rounded-md border-[0.5px] border-white/7 bg-graphite p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[9px] font-medium uppercase tracking-wide text-ash sm:text-[10px]">
          Balance
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-pill bg-white/5 px-2 py-0.5 text-[10px] font-normal text-snow transition-colors hover:bg-white/10 disabled:opacity-50 sm:px-2.5 sm:py-1 sm:text-xs"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading && xlm === null ? (
        <div className="h-7 w-36 animate-pulse rounded-sm bg-charcoal sm:h-9 sm:w-48" />
      ) : !funded ? (
        <div className="space-y-3">
          <Alert variant="warning">
            This account isn&apos;t funded on testnet yet. Fund it to get 10,000
            test XLM.
          </Alert>
          <button
            onClick={onFund}
            disabled={funding}
            className="rounded-pill bg-bone px-3 py-1.5 text-xs font-normal text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-white disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
          >
            {funding ? "Funding via Friendbot..." : "Fund with Friendbot"}
          </button>
        </div>
      ) : (
        <div className="divide-y-[0.5px] divide-white/7 rounded-sm border-[0.5px] border-white/8 bg-charcoal">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-normal text-ash">XLM</span>
            <span className="font-mono text-base font-normal text-snow sm:text-lg">
              {xlm !== null ? formatAmount(xlm) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-normal text-ash">USDC</span>
            {usdc !== null ? (
              <span className="font-mono text-base font-normal text-snow sm:text-lg">
                {formatAmount(usdc)}
              </span>
            ) : (
              <button
                onClick={onAddTrustline}
                disabled={addingTrustline}
                className="rounded-pill bg-white/5 px-2.5 py-1 text-[10px] font-normal text-snow transition-colors hover:bg-white/10 disabled:opacity-50 sm:text-xs"
              >
                {addingTrustline ? "Adding..." : "Add trustline"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
