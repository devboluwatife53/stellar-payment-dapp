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
  USDC_ISSUER,
  USDC_ASSET_CODE,
} from "./constants";
import { signTransactionXdr } from "./freighter";

const server = new Horizon.Server(HORIZON_URL);

export type AssetCode = "XLM" | "USDC";

/** Resolve an AssetCode into the SDK Asset object used in operations. */
export function getAsset(code: AssetCode): Asset {
  return code === "USDC" ? new Asset(USDC_ASSET_CODE, USDC_ISSUER) : Asset.native();
}

export interface AccountBalance {
  /** Native XLM balance as a string, e.g. "1234.5678900". */
  xlm: string;
  /** USDC balance as a string, or null if no trustline exists yet. */
  usdc: string | null;
  /** Whether the account exists/is funded on the network. */
  funded: boolean;
}

/**
 * Fetch the native XLM and USDC balances for an account. If the account
 * isn't funded yet (404 from Horizon), returns { funded: false } instead of
 * throwing. `usdc` is null when the account has no USDC trustline.
 */
export async function fetchBalance(publicKey: string): Promise<AccountBalance> {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    const usdcLine = account.balances.find(
      (b) =>
        (b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12") &&
        b.asset_code === USDC_ASSET_CODE &&
        b.asset_issuer === USDC_ISSUER,
    );
    return {
      xlm: native ? native.balance : "0",
      usdc: usdcLine ? usdcLine.balance : null,
      funded: true,
    };
  } catch (err: unknown) {
    if (isNotFound(err)) {
      return { xlm: "0", usdc: null, funded: false };
    }
    throw new Error(parseHorizonError(err, "Failed to fetch balance."));
  }
}

/**
 * Establish a trustline to the USDC asset so the account can hold and
 * receive it. Requires ~0.5 XLM of additional reserve.
 */
export async function addUsdcTrustline(publicKey: string): Promise<void> {
  let sourceAccount;
  try {
    sourceAccount = await server.loadAccount(publicKey);
  } catch (err) {
    if (isNotFound(err)) {
      throw new Error("Your account isn't funded on testnet yet.");
    }
    throw new Error(parseHorizonError(err, "Could not load your account."));
  }

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE || Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: getAsset("USDC") }))
    .setTimeout(180)
    .build();

  const signedXdr = await signTransactionXdr(
    tx.toXDR(),
    NETWORK_PASSPHRASE || Networks.TESTNET,
    publicKey,
  );
  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE || Networks.TESTNET,
  );

  try {
    await server.submitTransaction(signedTx);
  } catch (err) {
    throw new Error(parseHorizonError(err, "Failed to add USDC trustline."));
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
  asset?: AssetCode;
}

export interface BatchPaymentResult {
  hash: string;
  recipientCount: number;
  totalAmount: string;
  asset: AssetCode;
  /** Per-recipient results for UI tracking. */
  perRecipient: { address: string; amount: string; ok: boolean }[];
}

/**
 * Build a single multi-operation transaction containing one Payment op per
 * recipient, have Freighter sign it, and submit to Horizon.  This is atomic —
 * either all payments succeed or the whole transaction is rejected. The
 * transaction fee is always paid in XLM regardless of the asset sent.
 */
export async function sendBatchPayment({
  sourcePublicKey,
  recipients,
  asset = "XLM",
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

  const paymentAsset = getAsset(asset);

  // Build one transaction with N payment operations.
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BigInt(BASE_FEE) * BigInt(recipients.length)),
    networkPassphrase: NETWORK_PASSPHRASE || Networks.TESTNET,
  });

  for (const r of recipients) {
    txBuilder.addOperation(
      Operation.payment({
        destination: r.address,
        asset: paymentAsset,
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
      totalAmount: total.toFixed(7),
      asset,
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
  totalAmount: string;
  asset: AssetCode;
  timestamp: string;
  perRecipient: { address: string; amount: string; ok: boolean }[];
}

const HISTORY_KEY = "stellar_payroll_history";

/** Older entries were saved before USDC support, with `totalXlm` and no `asset`. */
type LegacyHistoryEntry = Partial<HistoryEntry> & {
  totalXlm?: string;
};

function _loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegacyHistoryEntry[];
    return parsed.map((entry) => ({
      hash: entry.hash ?? "",
      recipientCount: entry.recipientCount ?? 0,
      totalAmount: entry.totalAmount ?? entry.totalXlm ?? "0",
      asset: entry.asset ?? "XLM",
      timestamp: entry.timestamp ?? new Date(0).toISOString(),
      perRecipient: entry.perRecipient ?? [],
    }));
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
 * Validate a full batch — total must not exceed the spendable balance of the
 * selected asset. For USDC, `balance` is null when no trustline exists yet;
 * the XLM reserve buffer only applies to native XLM sends since the reserve
 * itself is held in XLM regardless of what asset is being sent.
 */
export function validateBatch(
  recipients: RecipientEntry[],
  balance: string | null,
  asset: AssetCode = "XLM",
): { valid: boolean; error?: string } {
  if (recipients.length === 0) {
    return { valid: false, error: "Add at least one recipient." };
  }

  if (asset === "USDC" && balance === null) {
    return {
      valid: false,
      error: "Add a USDC trustline before sending USDC.",
    };
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
  const spendable =
    asset === "XLM" ? Number(balance) - RESERVE_BUFFER_XLM : Number(balance);
  if (total > spendable) {
    return {
      valid: false,
      error: `Total ${total.toFixed(7)} ${asset} exceeds spendable balance (~${spendable.toFixed(
        4,
      )} ${asset}${asset === "XLM" ? " after reserve + fee" : ""}).`,
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
    op_low_reserve: "Not enough XLM to cover the reserve for this trustline.",
    tx_insufficient_balance: "Insufficient balance to cover the fee.",
    tx_bad_seq: "Bad sequence number — please retry.",
    tx_too_late: "The transaction expired before submission. Please retry.",
    tx_no_source_account: "The source account doesn't exist on the network.",
  };
  return map[code] ?? `Transaction error: ${code}`;
}
