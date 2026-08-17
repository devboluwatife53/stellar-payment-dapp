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
    <header className="space-y-3 border-b-[0.5px] border-white/7 pb-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-[18px] font-normal tracking-[-0.61px] text-snow sm:text-[20px]">
          Batch Payment
        </h1>
      </div>

      {/* Wallet section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {publicKey ? (
          <>
            {/* Address + network badge */}
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-xs border-[0.5px] border-white/8 bg-graphite px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ash">
                {network ?? "TESTNET"}
              </span>
              <span
                className="font-mono text-xs text-chalk sm:text-sm"
                title={publicKey}
              >
                {truncateAddress(publicKey, 4, 4)}
              </span>
            </div>
            {/* Disconnect button */}
            <button
              onClick={onDisconnect}
              title="Clears this session. Freighter itself stays connected — revoke access from the extension if you want to fully disconnect."
              className="w-full rounded-pill bg-white/5 px-3 py-1.5 text-xs font-normal text-snow transition-colors hover:bg-white/10 sm:w-auto"
            >
              Disconnect
            </button>
          </>
        ) : installed === false ? (
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-pill bg-bone px-4 py-2 text-center text-sm font-normal text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-white sm:w-auto"
          >
            Install Freighter
          </a>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting || installed === null}
            className="block w-full rounded-pill bg-bone px-4 py-2 text-center text-sm font-normal text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {connecting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
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
