/**
 * Network configuration. Values come from public env vars (see .env.example)
 * with sensible Testnet defaults so the app works out of the box.
 */

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ??
  "Test SDF Network ; September 2015";

export const FRIENDBOT_URL =
  process.env.NEXT_PUBLIC_FRIENDBOT_URL ?? "https://friendbot.stellar.org";

/** Freighter reports network by name; we expect this one. */
export const EXPECTED_NETWORK = "TESTNET";

/** Base reserve buffer (XLM) we hold back so the account keeps its minimum
 * reserve + can cover the transaction fee. 1 XLM is a comfortable cushion for
 * a basic account (2 base reserves = 1 XLM) plus fees. */
export const RESERVE_BUFFER_XLM = 1;

/** Stellar Expert testnet explorer, transaction view. */
export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

/** Install page for the Freighter browser extension. */
export const FREIGHTER_INSTALL_URL = "https://www.freighter.app/";
