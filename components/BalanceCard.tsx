"use client";

import { formatXlm } from "@/lib/format";
import { Alert } from "./Alert";

interface BalanceCardProps {
  xlm: string | null;
  funded: boolean;
  loading: boolean;
  funding: boolean;
  error: string | null;
  onRefresh: () => void;
  onFund: () => void;
}

export function BalanceCard({
  xlm,
  funded,
  loading,
  funding,
  error,
  onRefresh,
  onFund,
}: BalanceCardProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
          Balance
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 sm:px-2.5 sm:py-1 sm:text-xs"
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
        <div className="h-7 w-36 animate-pulse rounded bg-slate-800 sm:h-9 sm:w-48" />
      ) : !funded ? (
        <div className="space-y-3">
          <Alert variant="warning">
            This account isn&apos;t funded on testnet yet. Fund it to get 10,000
            test XLM.
          </Alert>
          <button
            onClick={onFund}
            disabled={funding}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
          >
            {funding ? "Funding via Friendbot..." : "Fund with Friendbot"}
          </button>
        </div>
      ) : (
        <p className="font-mono text-2xl font-semibold text-slate-100 sm:text-3xl">
          {xlm !== null ? formatXlm(xlm) : "—"}{" "}
          <span className="text-sm text-slate-400 sm:text-lg">XLM</span>
        </p>
      )}
    </section>
  );
}
