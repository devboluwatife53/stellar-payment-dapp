"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isFreighterInstalled,
  isAppAllowed,
  connectWallet,
  getPublicKey,
  getNetworkDetails,
} from "@/lib/freighter";
import { EXPECTED_NETWORK } from "@/lib/constants";

export interface WalletState {
  /** Whether the Freighter extension is detected. `null` while checking. */
  installed: boolean | null;
  /** Connected public key, or null when disconnected. */
  publicKey: string | null;
  /** Network name reported by Freighter (e.g. "TESTNET"). */
  network: string | null;
  /** True when Freighter is on a network other than the expected one. */
  wrongNetwork: boolean;
  connecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  installed: null,
  publicKey: null,
  network: null,
  wrongNetwork: false,
  connecting: false,
  error: null,
};

/**
 * Manages Freighter wallet connection state: installation detection, connect,
 * disconnect (client-side only), and network verification.
 */
export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  // On mount, detect Freighter and silently reconnect if already allowed.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const installed = await isFreighterInstalled();
      if (cancelled) return;

      if (!installed) {
        setState((s) => ({ ...s, installed: false }));
        return;
      }

      setState((s) => ({ ...s, installed: true }));

      try {
        const allowed = await isAppAllowed();
        if (!allowed || cancelled) return;

        const publicKey = await getPublicKey();
        const { network } = await getNetworkDetails();
        if (cancelled) return;

        setState((s) => ({
          ...s,
          publicKey,
          network,
          wrongNetwork: network !== EXPECTED_NETWORK,
        }));
      } catch {
        // Silent reconnect failed; user can connect manually.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        setState((s) => ({
          ...s,
          installed: false,
          connecting: false,
          error: "Freighter extension not detected.",
        }));
        return;
      }

      const publicKey = await connectWallet();
      const { network } = await getNetworkDetails();

      setState((s) => ({
        ...s,
        installed: true,
        publicKey,
        network,
        wrongNetwork: network !== EXPECTED_NETWORK,
        connecting: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet.",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Freighter has no true disconnect — clear local state only.
    setState((s) => ({
      ...initialState,
      installed: s.installed,
    }));
  }, []);

  /** Re-read the network from Freighter (e.g. after the user switches it). */
  const refreshNetwork = useCallback(async () => {
    try {
      const { network } = await getNetworkDetails();
      setState((s) => ({
        ...s,
        network,
        wrongNetwork: network !== EXPECTED_NETWORK,
      }));
    } catch {
      // ignore — leave existing network state as-is
    }
  }, []);

  return { ...state, connect, disconnect, refreshNetwork };
}
