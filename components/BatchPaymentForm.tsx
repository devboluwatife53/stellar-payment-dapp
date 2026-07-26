"use client";

import { useState, type FormEvent } from "react";
import {
  sendBatchPayment,
  validateBatch,
  isValidPublicKey,
  type RecipientEntry,
} from "@/lib/stellar";
import { explorerTxUrl } from "@/lib/constants";
import { Alert } from "./Alert";

interface BatchPaymentFormProps {
  sourcePublicKey: string;
  balanceXlm: string | null;
  funded: boolean;
  disabled?: boolean;
  onSuccess: () => void;
  onTxComplete: (entry: {
    hash: string;
    recipientCount: number;
    totalXlm: string;
    timestamp: string;
    perRecipient: { address: string; amount: string; ok: boolean }[];
  }) => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting"; progress: string }
  | { kind: "success"; hash: string; recipientCount: number; totalXlm: string }
  | { kind: "error"; message: string };

export function BatchPaymentForm({
  sourcePublicKey,
  balanceXlm,
  funded,
  disabled,
  onSuccess,
  onTxComplete,
}: BatchPaymentFormProps) {
  const [recipientText, setRecipientText] = useState("");
  const [mode, setMode] = useState<"same" | "individual">("same");
  const [sameAmount, setSameAmount] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submitting = status.kind === "submitting";
  const formDisabled = disabled || !funded || submitting;

  /** Parse the textarea into RecipientEntry[] */
  function parseRecipients(): RecipientEntry[] {
    const lines = recipientText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((addr) => ({
      address: addr,
      amount: sameAmount,
    }));
  }

  function getTotalPreview(): string {
    const recipients = parseRecipients();
    if (mode === "same") {
      const total = Number(sameAmount) * recipients.length;
      return total > 0 ? total.toFixed(7) : "0";
    }
    // individual mode — sum amounts from lines like "GABC... 10.5"
    const lines = recipientText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    let total = 0;
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const amt = Number(parts[parts.length - 1]);
      if (!Number.isNaN(amt) && amt > 0) total += amt;
    }
    return total > 0 ? total.toFixed(7) : "0";
  }

  function parseIndividualRecipients(): RecipientEntry[] {
    const lines = recipientText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((line) => {
      const parts = line.split(/\s+/);
      const amount = parts[parts.length - 1];
      const address = parts.slice(0, -1).join(" ");
      return { address, amount };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFieldError(null);

    const recipients =
      mode === "same" ? parseRecipients() : parseIndividualRecipients();

    // Basic client-side validation
    if (recipients.length === 0) {
      setFieldError("Add at least one recipient address.");
      return;
    }
    if (recipients.length > 20) {
      setFieldError("Maximum 20 recipients per batch.");
      return;
    }
    if (mode === "same" && (!sameAmount || Number(sameAmount) <= 0)) {
      setFieldError("Enter an amount to send to each recipient.");
      return;
    }

    // Validate addresses + amounts
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      if (!isValidPublicKey(r.address)) {
        setFieldError(
          `Recipient ${i + 1} ("${r.address.slice(0, 12)}...") is not a valid Stellar address.`,
        );
        return;
      }
      if (Number(r.amount) <= 0 || Number.isNaN(Number(r.amount))) {
        setFieldError(`Recipient ${i + 1} has an invalid amount.`);
        return;
      }
    }

    // Check total against balance
    if (balanceXlm) {
      const batchCheck = validateBatch(recipients, balanceXlm);
      if (!batchCheck.valid) {
        setFieldError(batchCheck.error ?? "Invalid batch.");
        return;
      }
    }

    setStatus({
      kind: "submitting",
      progress: `Sending to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}...`,
    });

    try {
      const result = await sendBatchPayment({
        sourcePublicKey,
        recipients,
      });

      setStatus({
        kind: "success",
        hash: result.hash,
        recipientCount: result.recipientCount,
        totalXlm: result.totalXlm,
      });

      onTxComplete({
        hash: result.hash,
        recipientCount: result.recipientCount,
        totalXlm: result.totalXlm,
        timestamp: new Date().toISOString(),
        perRecipient: result.perRecipient,
      });

      setRecipientText("");
      setSameAmount("");
      onSuccess();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Batch payment failed.",
      });
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-5">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400 sm:mb-4 sm:text-sm">
        Batch Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Mode selector */}
        <div className="flex gap-4 text-xs sm:text-sm">
          <label className="flex items-center gap-1.5 text-slate-300">
            <input
              type="radio"
              name="mode"
              value="same"
              checked={mode === "same"}
              onChange={() => setMode("same")}
              disabled={formDisabled}
              className="accent-indigo-500"
            />
            Same amount
          </label>
          <label className="flex items-center gap-1.5 text-slate-300">
            <input
              type="radio"
              name="mode"
              value="individual"
              checked={mode === "individual"}
              onChange={() => setMode("individual")}
              disabled={formDisabled}
              className="accent-indigo-500"
            />
            Individual amounts
          </label>
        </div>

        {/* Recipients textarea */}
        <div>
          <label
            htmlFor="recipients"
            className="mb-1 block text-xs text-slate-300 sm:text-sm"
          >
            {mode === "same"
              ? "Recipient addresses (one per line or comma-separated)"
              : "Recipient address and amount (one per line: GABC... 10.5)"}
          </label>
          <textarea
            id="recipients"
            value={recipientText}
            onChange={(e) => setRecipientText(e.target.value)}
            placeholder={
              mode === "same"
                ? "GABC...WXYZ\nGDEF...JKLM\nGHIJ...NOPQ"
                : "GABC...WXYZ 10.0\nGDEF...JKLM 5.5\nGHIJ...NOPQ 2.0"
            }
            disabled={formDisabled}
            spellCheck={false}
            rows={4}
            className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
          />
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            {recipientText
              .split(/[\n,]+/)
              .filter((l) => l.trim()).length}{" "}
            recipient(s) detected
          </p>
        </div>

        {/* Amount input (same mode only) */}
        {mode === "same" && (
          <div>
            <label
              htmlFor="amount"
              className="mb-1 block text-xs text-slate-300 sm:text-sm"
            >
              Amount per recipient (XLM)
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={sameAmount}
              onChange={(e) => setSameAmount(e.target.value)}
              placeholder="0.0000000"
              disabled={formDisabled}
              autoComplete="off"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>
        )}

        {/* Total preview */}
        {getTotalPreview() !== "0" && (
          <div className="flex items-center justify-between rounded-md bg-slate-800/50 px-3 py-2 text-xs sm:text-sm">
            <span className="text-slate-400">Total to be sent</span>
            <span className="font-mono font-semibold text-slate-100">
              {getTotalPreview()} XLM
            </span>
          </div>
        )}

        {fieldError && <Alert variant="error">{fieldError}</Alert>}

        <button
          type="submit"
          disabled={formDisabled}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          {submitting
            ? status.kind === "submitting"
              ? status.progress
              : "Submitting..."
            : `Send to ${recipientText.split(/[\n,]+/).filter((l) => l.trim()).length || 0} recipient(s)`}
        </button>

        {!funded && (
          <p className="text-[10px] text-slate-500 sm:text-xs">
            Fund your account before sending payments.
          </p>
        )}
      </form>

      {status.kind === "success" && (
        <div className="mt-4">
          <Alert variant="success">
            <p className="font-medium">
              Batch payment sent to {status.recipientCount} recipient(s).
            </p>
            <p className="mt-0.5 text-xs text-slate-300">
              Total: {status.totalXlm} XLM
            </p>
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
