"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { WalletBar } from "@/components/WalletBar";
import { BalanceCard } from "@/components/BalanceCard";
import { BatchPaymentForm } from "@/components/BatchPaymentForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Alert } from "@/components/Alert";
import {
  EXPECTED_NETWORK,
  FREIGHTER_INSTALL_URL,
} from "@/lib/constants";
import {
  getHistory,
  addToHistory,
  type HistoryEntry,
} from "@/lib/stellar";

export default function AppPage() {
  const wallet = useWallet();
  const balance = useBalance(wallet.publicKey);
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());

  function handleTxComplete(entry: HistoryEntry) {
    addToHistory(entry);
    setHistory(getHistory());
  }

  return (
    <main className="mx-auto flex min-h-dvh min-h-screen max-w-2xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-[12px] font-normal text-ash transition-colors hover:text-snow"
      >
        ← Stellar Payroll
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
          <p>
            Connect your Freighter wallet to send batch payments on Stellar
            Testnet.
          </p>
        </div>
      ) : (
        <>
          <BalanceCard
            xlm={balance.xlm}
            usdc={balance.usdc}
            funded={balance.funded}
            loading={balance.loading}
            funding={balance.funding}
            addingTrustline={balance.addingTrustline}
            error={balance.error}
            onRefresh={balance.refresh}
            onFund={balance.fund}
            onAddTrustline={balance.addTrustline}
          />

          <BatchPaymentForm
            sourcePublicKey={wallet.publicKey}
            balanceXlm={balance.xlm}
            balanceUsdc={balance.usdc}
            funded={balance.funded}
            disabled={wallet.wrongNetwork}
            addingTrustline={balance.addingTrustline}
            onAddTrustline={balance.addTrustline}
            onSuccess={balance.refresh}
            onTxComplete={handleTxComplete}
          />

          <TransactionHistory entries={history} />
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-steel">
        Stellar Testnet demo — test XLM and USDC only, no real funds are used.
      </footer>
    </main>
  );
}
