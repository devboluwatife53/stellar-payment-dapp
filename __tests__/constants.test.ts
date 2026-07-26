import { describe, it, expect } from "vitest";
import { explorerTxUrl, EXPECTED_NETWORK, RESERVE_BUFFER_XLM } from "@/lib/constants";

describe("explorerTxUrl", () => {
  it("returns a valid Stellar Expert URL for a given hash", () => {
    const hash = "abc123def456";
    const url = explorerTxUrl(hash);
    expect(url).toBe(
      "https://stellar.expert/explorer/testnet/tx/abc123def456"
    );
  });
});

describe("constants", () => {
  it("EXPECTED_NETWORK is TESTNET", () => {
    expect(EXPECTED_NETWORK).toBe("TESTNET");
  });

  it("RESERVE_BUFFER_XLM is 1", () => {
    expect(RESERVE_BUFFER_XLM).toBe(1);
  });
});
