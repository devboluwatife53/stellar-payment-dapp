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
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Balance
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
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
        <div className="h-9 w-48 animate-pulse rounded bg-slate-800" />
      ) : !funded ? (
        <div className="space-y-3">
          <Alert variant="warning">
            This account isn&apos;t funded on testnet yet. Fund it to get 10,000
            test XLM.
          </Alert>
          <button
            onClick={onFund}
            disabled={funding}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {funding ? "Funding via Friendbot..." : "Fund with Friendbot"}
          </button>
        </div>
      ) : (
        <p className="font-mono text-3xl font-semibold text-slate-100">
          {xlm !== null ? formatXlm(xlm) : "—"}{" "}
          <span className="text-lg text-slate-400">XLM</span>
        </p>
      )}
    </section>
  );
}
