"use client";

import { useState } from "react";
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

export default function Home() {
  const wallet = useWallet();
  const balance = useBalance(wallet.publicKey);
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());

  function handleTxComplete(entry: HistoryEntry) {
    addToHistory(entry);
    setHistory(getHistory());
  }

  return (
    <main className="mx-auto flex min-h-dvh min-h-screen max-w-2xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
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
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-400 sm:p-10">
          <p>
            Connect your Freighter wallet to send batch payments on Stellar
            Testnet.
          </p>
        </div>
      ) : (
        <>
          <BalanceCard
            xlm={balance.xlm}
            funded={balance.funded}
            loading={balance.loading}
            funding={balance.funding}
            error={balance.error}
            onRefresh={balance.refresh}
            onFund={balance.fund}
          />

          <BatchPaymentForm
            sourcePublicKey={wallet.publicKey}
            balanceXlm={balance.xlm}
            funded={balance.funded}
            disabled={wallet.wrongNetwork}
            onSuccess={balance.refresh}
            onTxComplete={handleTxComplete}
          />

          <TransactionHistory entries={history} />
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-slate-600">
        Stellar Payroll · Built with Next.js, Freighter &amp; the Stellar SDK
      </footer>
    </main>
  );
}
