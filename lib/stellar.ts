/**
 * Stellar / Horizon interactions: balance lookup, funding, batch payment
 * building, and transaction history. Every network call is wrapped so callers
 * get either clean data or a thrown Error with a human-readable message.
 */

import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
  StrKey,
} from "@stellar/stellar-sdk";
import {
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  FRIENDBOT_URL,
  RESERVE_BUFFER_XLM,
} from "./constants";
import { signTransactionXdr } from "./freighter";

const server = new Horizon.Server(HORIZON_URL);

export interface AccountBalance {
  /** Native XLM balance as a string, e.g. "1234.5678900". */
  xlm: string;
  /** Whether the account exists/is funded on the network. */
  funded: boolean;
}

/**
 * Fetch the native XLM balance for an account. If the account isn't funded
 * yet (404 from Horizon), returns { funded: false } instead of throwing.
 */
export async function fetchBalance(publicKey: string): Promise<AccountBalance> {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return {
      xlm: native ? native.balance : "0",
      funded: true,
    };
  } catch (err: unknown) {
    if (isNotFound(err)) {
      return { xlm: "0", funded: false };
    }
    throw new Error(parseHorizonError(err, "Failed to fetch balance."));
  }
}

/**
 * Fund an account on testnet via Friendbot. Throws on failure.
 */
export async function fundWithFriendbot(publicKey: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(
      `${FRIENDBOT_URL}/?addr=${encodeURIComponent(publicKey)}`,
    );
  } catch {
    throw new Error("Could not reach Friendbot. Check your connection.");
  }
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        "Friendbot rejected the request — the account may already be funded.",
      );
    }
    throw new Error(`Friendbot funding failed (HTTP ${response.status}).`);
  }
}

/* ------------------------------------------------------------------ */
/*  Batch payment types                                               */
/* ------------------------------------------------------------------ */

export interface RecipientEntry {
  address: string;
  amount: string;
}

export interface BatchPaymentParams {
  sourcePublicKey: string;
  recipients: RecipientEntry[];
}

export interface BatchPaymentResult {
  hash: string;
  recipientCount: number;
  totalXlm: string;
  /** Per-recipient results for UI tracking. */
  perRecipient: { address: string; amount: string; ok: boolean }[];
}

/**
 * Build a single multi-operation transaction containing one Payment op per
 * recipient, have Freighter sign it, and submit to Horizon.  This is atomic —
 * either all payments succeed or the whole transaction is rejected.
 */
export async function sendBatchPayment({
  sourcePublicKey,
  recipients,
}: BatchPaymentParams): Promise<BatchPaymentResult> {
  if (recipients.length === 0) {
    throw new Error("No recipients provided.");
  }

  // Load the source account for the sequence number.
  let sourceAccount;
  try {
    sourceAccount = await server.loadAccount(sourcePublicKey);
  } catch (err) {
    if (isNotFound(err)) {
      throw new Error("Your account isn't funded on testnet yet.");
    }
    throw new Error(parseHorizonError(err, "Could not load your account."));
  }

  // Build one transaction with N payment operations.
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BigInt(BASE_FEE) * BigInt(recipients.length)),
    networkPassphrase: NETWORK_PASSPHRASE || Networks.TESTNET,
  });

  for (const r of recipients) {
    txBuilder.addOperation(
      Operation.payment({
        destination: r.address,
        asset: Asset.native(),
        amount: r.amount,
      }),
    );
  }

  const tx = txBuilder.setTimeout(180).build();

  // Sign with Freighter.
  const signedXdr = await signTransactionXdr(
    tx.toXDR(),
    NETWORK_PASSPHRASE || Networks.TESTNET,
    sourcePublicKey,
  );

  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE || Networks.TESTNET,
  );

  try {
    const result = await server.submitTransaction(signedTx);
    const total = recipients.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    return {
      hash: result.hash,
      recipientCount: recipients.length,
      totalXlm: total.toFixed(7),
      perRecipient: recipients.map((r) => ({
        address: r.address,
        amount: r.amount,
        ok: true,
      })),
    };
  } catch (err) {
    throw new Error(parseHorizonError(err, "Batch payment failed."));
  }
}

/* ------------------------------------------------------------------ */
/*  Transaction history                                               */
/* ------------------------------------------------------------------ */

export interface HistoryEntry {
  hash: string;
  recipientCount: number;
  totalXlm: string;
  timestamp: string;
  perRecipient: { address: string; amount: string; ok: boolean }[];
}

const HISTORY_KEY = "stellar_payroll_history";

function _loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function _saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function getHistory(): HistoryEntry[] {
  return _loadHistory();
}

export function addToHistory(entry: HistoryEntry): void {
  const updated = [entry, ..._loadHistory()].slice(0, 50);
  _saveHistory(updated);
}

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                */
/* ------------------------------------------------------------------ */

/** Validate a Stellar public key (G... ed25519). */
export function isValidPublicKey(key: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(key.trim());
  } catch {
    return false;
  }
}

export interface AmountValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate a payment amount against the available balance, leaving room for
 * the reserve + fee buffer.
 */
export function validateAmount(
  amountStr: string,
  balanceXlm: string,
): AmountValidation {
  const amount = Number(amountStr);
  if (!amountStr.trim() || Number.isNaN(amount)) {
    return { valid: false, error: "Enter a valid number." };
  }
  if (amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero." };
  }
  if (!/^\d+(\.\d{1,7})?$/.test(amountStr.trim())) {
    return { valid: false, error: "Max 7 decimal places allowed." };
  }
  const balance = Number(balanceXlm);
  const spendable = balance - RESERVE_BUFFER_XLM;
  if (amount > spendable) {
    return {
      valid: false,
      error: `Amount exceeds spendable balance (~${spendable.toFixed(
        4,
      )} XLM after reserve + fee).`,
    };
  }
  return { valid: true };
}

/**
 * Validate a full batch — total must not exceed spendable balance.
 */
export function validateBatch(
  recipients: RecipientEntry[],
  balanceXlm: string,
): { valid: boolean; error?: string } {
  if (recipients.length === 0) {
    return { valid: false, error: "Add at least one recipient." };
  }

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    if (!isValidPublicKey(r.address)) {
      return {
        valid: false,
        error: `Recipient ${i + 1} has an invalid address.`,
      };
    }
    const amt = Number(r.amount);
    if (!r.amount || Number.isNaN(amt) || amt <= 0) {
      return {
        valid: false,
        error: `Recipient ${i + 1} has an invalid amount.`,
      };
    }
    if (!/^\d+(\.\d{1,7})?$/.test(r.amount)) {
      return {
        valid: false,
        error: `Recipient ${i + 1}: max 7 decimal places.`,
      };
    }
  }

  const total = recipients.reduce((sum, r) => sum + Number(r.amount), 0);
  const balance = Number(balanceXlm);
  const spendable = balance - RESERVE_BUFFER_XLM;
  if (total > spendable) {
    return {
      valid: false,
      error: `Total ${total.toFixed(
        7,
      )} XLM exceeds spendable balance (~${spendable.toFixed(4)} XLM).`,
    };
  }

  return { valid: true };
}

/* ------------------------------------------------------------------ */
/*  Error parsing                                                     */
/* ------------------------------------------------------------------ */

/** True if the error is a Horizon 404 (account not found). */
function isNotFound(err: unknown): boolean {
  const e = err as { response?: { status?: number }; status?: number };
  return e?.response?.status === 404 || e?.status === 404;
}

/**
 * Turn a Horizon/SDK error into a readable message.
 */
export function parseHorizonError(err: unknown, fallback: string): string {
  const e = err as {
    response?: {
      data?: {
        title?: string;
        detail?: string;
        extras?: {
          result_codes?: {
            transaction?: string;
            operations?: string[];
          };
        };
      };
    };
    message?: string;
  };

  const data = e?.response?.data;
  if (data) {
    const codes = data.extras?.result_codes;
    if (codes) {
      const opCodes = (codes.operations ?? []).filter(Boolean);
      const txCode = codes.transaction;
      const parts: string[] = [];
      if (txCode && txCode !== "tx_failed") {
        parts.push(humanizeResultCode(txCode));
      }
      for (const op of opCodes) {
        parts.push(humanizeResultCode(op));
      }
      if (parts.length > 0) {
        return parts.join(" ");
      }
    }
    if (data.detail) return data.detail;
    if (data.title) return data.title;
  }

  if (e?.message) return e.message;
  return fallback;
}

/** Map common Stellar result codes to plain English. */
function humanizeResultCode(code: string): string {
  const map: Record<string, string> = {
    op_underfunded: "Insufficient balance to cover this payment.",
    op_no_destination:
      "The destination account doesn't exist. It must be funded first.",
    op_no_trust: "The destination doesn't trust this asset.",
    op_line_full: "The destination's balance limit would be exceeded.",
    op_malformed: "The payment operation is malformed.",
    tx_insufficient_balance: "Insufficient balance to cover the fee.",
    tx_bad_seq: "Bad sequence number — please retry.",
    tx_too_late: "The transaction expired before submission. Please retry.",
    tx_no_source_account: "The source account doesn't exist on the network.",
  };
  return map[code] ?? `Transaction error: ${code}`;
}
