"use client";

import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { WalletBar } from "@/components/WalletBar";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPaymentForm } from "@/components/SendPaymentForm";
import { Alert } from "@/components/Alert";
import { EXPECTED_NETWORK, FREIGHTER_INSTALL_URL } from "@/lib/constants";

export default function Home() {
  const wallet = useWallet();
  const balance = useBalance(wallet.publicKey);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
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
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-400">
          <p>Connect your Freighter wallet to view your balance and send XLM.</p>
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

          <SendPaymentForm
            sourcePublicKey={wallet.publicKey}
            balanceXlm={balance.xlm}
            funded={balance.funded}
            disabled={wallet.wrongNetwork}
            onSuccess={balance.refresh}
          />
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-slate-600">
        Stellar Testnet · Built with Next.js, Freighter &amp; the Stellar SDK
      </footer>
    </main>
  );
}
