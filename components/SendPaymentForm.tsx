"use client";

import { useState, type FormEvent } from "react";
import { sendPayment, isValidPublicKey, validateAmount } from "@/lib/stellar";
import { explorerTxUrl } from "@/lib/constants";
import { Alert } from "./Alert";

interface SendPaymentFormProps {
  sourcePublicKey: string;
  balanceXlm: string | null;
  funded: boolean;
  disabled?: boolean;
  onSuccess: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; hash: string }
  | { kind: "error"; message: string };

export function SendPaymentForm({
  sourcePublicKey,
  balanceXlm,
  funded,
  disabled,
  onSuccess,
}: SendPaymentFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submitting = status.kind === "submitting";
  const formDisabled = disabled || !funded || submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return; // guard against double-submit
    setFieldError(null);

    const dest = destination.trim();
    if (!isValidPublicKey(dest)) {
      setFieldError("Enter a valid Stellar public key (starts with G).");
      return;
    }
    if (dest === sourcePublicKey) {
      setFieldError("You can't send a payment to yourself.");
      return;
    }
    const amountCheck = validateAmount(amount, balanceXlm ?? "0");
    if (!amountCheck.valid) {
      setFieldError(amountCheck.error ?? "Invalid amount.");
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const { hash } = await sendPayment({
        sourcePublicKey,
        destination: dest,
        amount: amount.trim(),
      });
      setStatus({ kind: "success", hash });
      setDestination("");
      setAmount("");
      onSuccess();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Transaction failed.",
      });
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400">
        Send Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="destination"
            className="mb-1 block text-sm text-slate-300"
          >
            Destination public key
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="GABC...WXYZ"
            disabled={formDisabled}
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm text-slate-300">
            Amount (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0000000"
            disabled={formDisabled}
            autoComplete="off"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-50"
          />
        </div>

        {fieldError && <Alert variant="error">{fieldError}</Alert>}

        <button
          type="submit"
          disabled={formDisabled}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Send Payment"}
        </button>

        {!funded && (
          <p className="text-xs text-slate-500">
            Fund your account before sending a payment.
          </p>
        )}
      </form>

      {status.kind === "success" && (
        <div className="mt-4">
          <Alert variant="success">
            <p className="font-medium">Payment sent.</p>
            <p className="mt-1 break-all font-mono text-xs">{status.hash}</p>
            <a
              href={explorerTxUrl(status.hash)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block underline underline-offset-2 hover:text-emerald-100"
            >
              View on Stellar Expert →
            </a>
          </Alert>
        </div>
      )}

      {status.kind === "error" && (
        <div className="mt-4">
          <Alert variant="error">{status.message}</Alert>
        </div>
      )}
    </section>
  );
}
