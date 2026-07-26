"use client";

import { truncateAddress } from "@/lib/format";
import { FREIGHTER_INSTALL_URL } from "@/lib/constants";

interface WalletBarProps {
  installed: boolean | null;
  publicKey: string | null;
  network: string | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletBar({
  installed,
  publicKey,
  network,
  connecting,
  onConnect,
  onDisconnect,
}: WalletBarProps) {
  return (
    <header className="space-y-3 border-b border-slate-800 pb-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
          Stellar Payroll
        </h1>
      </div>

      {/* Wallet section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {publicKey ? (
          <>
            {/* Address + network badge */}
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {network ?? "TESTNET"}
              </span>
              <span
                className="font-mono text-xs text-slate-300 sm:text-sm"
                title={publicKey}
              >
                {truncateAddress(publicKey, 4, 4)}
              </span>
            </div>
            {/* Disconnect button */}
            <button
              onClick={onDisconnect}
              className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 active:bg-slate-700 sm:w-auto"
            >
              Disconnect
            </button>
          </>
        ) : installed === false ? (
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-500 active:bg-indigo-700 sm:w-auto"
          >
            Install Freighter
          </a>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting || installed === null}
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {connecting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Connecting...
              </span>
            ) : (
              "Connect Wallet"
            )}
          </button>
        )}
      </div>
    </header>
  );
}
