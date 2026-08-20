"use client";

import { useState, type FormEvent } from "react";
import { formatAmount } from "@/lib/format";
import { Alert } from "./Alert";

const NGN_PER_USDC = 1380;

const NIGERIAN_BANKS = [
  "Access Bank",
  "GTBank",
  "Kuda",
  "Opay",
  "UBA",
  "Zenith Bank",
  "First Bank",
  "Stanbic IBTC",
  "Wema Bank",
];

interface WithdrawFormProps {
  balanceUsdc: string | null;
}

type Stage = "form" | "processing" | "done";

export function WithdrawForm({ balanceUsdc }: WithdrawFormProps) {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [ref, setRef] = useState("");

  const naira = amount ? Number(amount) * NGN_PER_USDC : 0;
  const availableUsdc = balanceUsdc != null ? parseFloat(balanceUsdc) : 0;
  const submitting = stage === "processing";

  function reset() {
    setStage("form");
    setAmount("");
    setAccountNo("");
    setBank("");
    setError(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (balanceUsdc !== null && n > availableUsdc) {
      setError("Amount exceeds your available USDC balance.");
      return;
    }
    if (accountNo.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }
    if (!bank) {
      setError("Select your bank.");
      return;
    }

    setStage("processing");
    setTimeout(() => {
      setRef(`PL-${Date.now().toString(36).toUpperCase()}`);
      setStage("done");
    }, 2200);
  }

  return (
    <section className="rounded-md border-[0.5px] border-white/7 bg-graphite p-3 sm:p-5">
      <h2 className="mb-3 text-[9px] font-medium uppercase tracking-wide text-ash sm:mb-4 sm:text-[10px]">
        Withdraw to Naira
      </h2>

      <div className="mb-4">
        <Alert variant="info">
          Demo mode — this simulates a licensed off-ramp. No real bank
          transfer occurs and no on-chain funds move. SEP-24 anchors aren&apos;t
          active on Stellar Testnet, so this stands in for a live anchor
          withdrawal.
        </Alert>
      </div>

      {stage === "done" ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint/10 text-2xl text-mint">
            ✓
          </div>
          <div>
            <p className="text-sm font-normal text-snow">
              Withdrawal initiated
            </p>
            <p className="mt-1 text-xs text-fog">
              ₦{naira.toLocaleString()} is on its way to your {bank} account
              ending {accountNo.slice(-4)}.
            </p>
          </div>
          <div className="rounded-sm border-[0.5px] border-white/8 bg-charcoal px-3 py-2 text-xs">
            <span className="text-ash">Reference</span>{" "}
            <span className="font-mono text-snow">{ref}</span>
          </div>
          <button
            onClick={reset}
            className="w-full rounded-pill bg-white/5 px-3 py-2 text-xs font-normal text-snow transition-colors hover:bg-white/10 sm:text-sm"
          >
            Make another withdrawal
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="amt" className="mb-1 block text-xs text-chalk sm:text-sm">
              Amount (USDC)
            </label>
            <input
              id="amt"
              inputMode="decimal"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              className="w-full rounded-sm border-[0.5px] border-white/8 bg-charcoal px-2.5 py-1.5 font-mono text-xs text-snow outline-none transition-colors focus:border-signal-blue disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
            />
            {balanceUsdc !== null && (
              <p className="mt-1 text-[10px] text-steel sm:text-xs">
                Available: {formatAmount(balanceUsdc)} USDC
              </p>
            )}
            {naira > 0 && (
              <p className="mt-1 text-[10px] text-steel sm:text-xs">
                You&apos;ll receive ≈{" "}
                <span className="text-chalk">₦{naira.toLocaleString()}</span>{" "}
                (₦{NGN_PER_USDC.toLocaleString()}/USDC)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bank" className="mb-1 block text-xs text-chalk sm:text-sm">
              Bank
            </label>
            <select
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              disabled={submitting}
              className="w-full rounded-sm border-[0.5px] border-white/8 bg-charcoal px-2.5 py-1.5 text-xs text-snow outline-none transition-colors focus:border-signal-blue disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
            >
              <option value="">Select bank…</option>
              {NIGERIAN_BANKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="acct" className="mb-1 block text-xs text-chalk sm:text-sm">
              Account number
            </label>
            <input
              id="acct"
              inputMode="numeric"
              placeholder="0123456789"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              maxLength={10}
              disabled={submitting}
              autoComplete="off"
              className="w-full rounded-sm border-[0.5px] border-white/8 bg-charcoal px-2.5 py-1.5 font-mono text-xs text-snow outline-none transition-colors focus:border-signal-blue disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-pill bg-bone px-3 py-2 text-xs font-normal text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            {submitting ? "Processing…" : "Withdraw to bank"}
          </button>
        </form>
      )}
    </section>
  );
}
