"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBalance, fundWithFriendbot } from "@/lib/stellar";

export interface BalanceState {
  xlm: string | null;
  funded: boolean;
  loading: boolean;
  funding: boolean;
  error: string | null;
}

const initialState: BalanceState = {
  xlm: null,
  funded: false,
  loading: false,
  funding: false,
  error: null,
};

/**
 * Fetches and tracks the native XLM balance for a public key. Re-fetches when
 * the key changes; exposes a manual refresh and a Friendbot funding helper.
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
      const { xlm, funded } = await fetchBalance(publicKey);
      setState((s) => ({ ...s, xlm, funded, loading: false }));
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
      const { xlm, funded } = await fetchBalance(publicKey);
      setState((s) => ({ ...s, xlm, funded, funding: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        funding: false,
        error: err instanceof Error ? err.message : "Friendbot funding failed.",
      }));
    }
  }, [publicKey]);

  // Auto-fetch whenever the connected key changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh, fund };
}
