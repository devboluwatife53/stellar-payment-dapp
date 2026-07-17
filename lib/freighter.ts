/**
 * Thin wrappers around @stellar/freighter-api (v4).
 *
 * The v4 API returns result objects that may carry an `error` field instead of
 * throwing. We normalize that here: every function either resolves with clean
 * data or throws an Error with a readable message, so callers can rely on
 * try/catch uniformly.
 */

import {
  isConnected as fIsConnected,
  isAllowed as fIsAllowed,
  requestAccess as fRequestAccess,
  getAddress as fGetAddress,
  getNetwork as fGetNetwork,
  signTransaction as fSignTransaction,
} from "@stellar/freighter-api";

/** Is the Freighter extension installed and detectable? */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await fIsConnected();
    return Boolean(res?.isConnected);
  } catch {
    return false;
  }
}

/** Has the user already granted this site access? */
export async function isAppAllowed(): Promise<boolean> {
  try {
    const res = await fIsAllowed();
    return Boolean(res?.isAllowed);
  } catch {
    return false;
  }
}

/**
 * Prompt the user to grant access and return their public key.
 * Throws if the user rejects or Freighter returns an error.
 */
export async function connectWallet(): Promise<string> {
  const res = await fRequestAccess();
  if (res.error) {
    throw new Error(normalizeFreighterError(res.error));
  }
  if (!res.address) {
    throw new Error("Freighter did not return an address. Is it unlocked?");
  }
  return res.address;
}

/** Get the currently selected public key (assumes access already granted). */
export async function getPublicKey(): Promise<string> {
  const res = await fGetAddress();
  if (res.error) {
    throw new Error(normalizeFreighterError(res.error));
  }
  return res.address;
}

export interface NetworkDetails {
  network: string;
  networkPassphrase: string;
}

/** Read the network the wallet is currently pointed at. */
export async function getNetworkDetails(): Promise<NetworkDetails> {
  const res = await fGetNetwork();
  if (res.error) {
    throw new Error(normalizeFreighterError(res.error));
  }
  return { network: res.network, networkPassphrase: res.networkPassphrase };
}

/**
 * Ask Freighter to sign a transaction (XDR string). Returns the signed XDR.
 */
export async function signTransactionXdr(
  xdr: string,
  networkPassphrase: string,
  address: string,
): Promise<string> {
  const res = await fSignTransaction(xdr, {
    networkPassphrase,
    address,
  });
  if (res.error) {
    throw new Error(normalizeFreighterError(res.error));
  }
  return res.signedTxXdr;
}

/** Freighter errors can be strings or objects; produce a readable message. */
function normalizeFreighterError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const maybe = error as { message?: string };
    if (maybe.message) return maybe.message;
  }
  return "Freighter request failed.";
}
