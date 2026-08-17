"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBalance, fundWithFriendbot, addUsdcTrustline } from "@/lib/stellar";

export interface BalanceState {
  xlm: string | null;
  usdc: string | null;
  funded: boolean;
  loading: boolean;
  funding: boolean;
  addingTrustline: boolean;
  error: string | null;
}

const initialState: BalanceState = {
  xlm: null,
  usdc: null,
  funded: false,
  loading: false,
  funding: false,
  addingTrustline: false,
  error: null,
};

/**
 * Fetches and tracks the native XLM and USDC balances for a public key.
 * Re-fetches when the key changes; exposes a manual refresh, a Friendbot
 * funding helper, and a USDC trustline helper.
 */
export function useBalance(publicKey: string | null) {
  const [state, setState] = useState<BalanceState>(initialState);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setState(initialState);
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { xlm, usdc, funded } = await fetchBalance(publicKey);
      setState((s) => ({ ...s, xlm, usdc, funded, loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch balance.",
      }));
    }
  }, [publicKey]);

  const fund = useCallback(async () => {
    if (!publicKey) return;
    setState((s) => ({ ...s, funding: true, error: null }));
    try {
      await fundWithFriendbot(publicKey);
      const { xlm, usdc, funded } = await fetchBalance(publicKey);
      setState((s) => ({ ...s, xlm, usdc, funded, funding: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        funding: false,
        error: err instanceof Error ? err.message : "Friendbot funding failed.",
      }));
    }
  }, [publicKey]);

  const addTrustline = useCallback(async () => {
    if (!publicKey) return;
    setState((s) => ({ ...s, addingTrustline: true, error: null }));
    try {
      await addUsdcTrustline(publicKey);
      const { xlm, usdc, funded } = await fetchBalance(publicKey);
      setState((s) => ({ ...s, xlm, usdc, funded, addingTrustline: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        addingTrustline: false,
        error: err instanceof Error ? err.message : "Failed to add USDC trustline.",
      }));
    }
  }, [publicKey]);

  // Auto-fetch whenever the connected key changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh, fund, addTrustline };
}
