"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { WalletBar } from "@/components/WalletBar";
import { WithdrawForm } from "@/components/WithdrawForm";
import { Alert } from "@/components/Alert";
import { EXPECTED_NETWORK, FREIGHTER_INSTALL_URL } from "@/lib/constants";

export default function WithdrawPage() {
  const wallet = useWallet();
  const balance = useBalance(wallet.publicKey);

  return (
    <main className="mx-auto flex min-h-dvh min-h-screen max-w-2xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
      <Link
        href="/app"
        className="inline-flex w-fit items-center gap-1 text-[12px] font-normal text-ash transition-colors hover:text-snow"
      >
        ← Batch Payment
      </Link>

      <WalletBar
        installed={wallet.installed}
        publicKey={wallet.publicKey}
        network={wallet.network}
        connecting={wallet.connecting}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      {wallet.installed === false && (
        <Alert variant="warning">
          The Freighter browser extension isn&apos;t installed. Install it from{" "}
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            freighter.app
          </a>{" "}
          and reload this page.
        </Alert>
      )}

      {wallet.error && <Alert variant="error">{wallet.error}</Alert>}

      {wallet.publicKey && wallet.wrongNetwork && (
        <Alert variant="warning">
          Freighter is set to{" "}
          <span className="font-medium">{wallet.network}</span>, but this app
          uses <span className="font-medium">{EXPECTED_NETWORK}</span>. Switch
          the network in Freighter, then{" "}
          <button
            onClick={wallet.refreshNetwork}
            className="underline underline-offset-2"
          >
            re-check
          </button>
          .
        </Alert>
      )}

      {!wallet.publicKey ? (
        <div className="rounded-md border-[0.5px] border-dashed border-white/10 p-8 text-center text-sm text-fog sm:p-10">
          <p>Connect your Freighter wallet to withdraw USDC to a bank account.</p>
        </div>
      ) : (
        <WithdrawForm balanceUsdc={balance.usdc} />
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-steel">
        Stellar Testnet demo — no real funds move. Off-ramp is simulated
        until a SEP-24 anchor is live on testnet.
      </footer>
    </main>
  );
}
