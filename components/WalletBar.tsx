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
    <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">
          Stellar Payment dApp
        </h1>
        <p className="text-xs text-slate-400">Testnet</p>
      </div>

      <div className="flex items-center gap-3">
        {publicKey ? (
          <>
            <div className="flex flex-col items-end">
              <span className="font-mono text-sm text-slate-200">
                {truncateAddress(publicKey)}
              </span>
              {network && (
                <span className="text-xs text-slate-500">{network}</span>
              )}
            </div>
            <button
              onClick={onDisconnect}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Disconnect
            </button>
          </>
        ) : installed === false ? (
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Install Freighter
          </a>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting || installed === null}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}
