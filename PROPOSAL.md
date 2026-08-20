# Stellar Payroll — Off-Ramp Expansion Proposal

## Problem Statement

DAOs and grant programs pay African contributors in XLM/USDC, but recipients
often can't spend it directly. They lose time and money finding P2P off-ramps
manually. My Level 3 project, Stellar Payroll (batch payment dApp with
Soroban record-keeping, live on testnet), solves the sending side. It doesn't
yet solve the "get it into local currency" side.

## Why Stellar?

Stellar is the only major chain with native anchor rails (SEP-24/31), so
fiat off-ramp isn't a bolt-on integration, it's protocol-level. Combined with
sub-cent fees and the existing Soroban contract already deployed, extending
into anchor territory is a natural next step rather than a new build.

## Target Users

DAOs, grant/bounty programs, and remote-first startups paying distributed
African contributors — the same payer profile Stellar Payroll already
serves.

## Technical Architecture

- **Frontend**: Extend the existing batch payment UI (WalletBar,
  BatchPaymentForm) with a recipient payout-mode toggle: hold on-chain vs.
  off-ramp to bank/mobile money.
- **Contract**: Extend the deployed `batch_payroll` Soroban contract with
  multi-asset support and event emission for reconciliation.
- **Data flow**: Payer batch-sends via the existing flow, recipient triggers
  a SEP-24 interactive withdrawal, the anchor handles KYC and local
  settlement, and an off-chain indexer reconciles anchor confirmations
  against on-chain contract events for the payer's audit trail.

> **Note:** SEP-24 is not active on Stellar testnet, so the interactive
> withdrawal flow will be demonstrated with a demo withdrawal flow standing
> in for a live anchor.

## Complexity Evaluation

- Integrating SEP-24's interactive auth flow into the existing batch UX
  without breaking it.
- Reconciling on-chain contract events with off-chain anchor settlement
  status, since anchors don't write back on-chain.
- Handling partial-failure states: batch settles on-chain but one
  recipient's anchor withdrawal fails KYC.

## Roadmap

- **MVP**: Wire one testnet SEP-24 anchor into the existing dApp, demo one
  NGN off-ramp corridor for a single recipient path.
- **User acquisition**: Pilot with programs I already have ties to (Midnight
  community, Stellar DeGrants, Savitura/CrowdPay), which already pay African
  contributors.
- **Mainnet vision**: Multi-corridor anchor support (NGN, KES, GHS),
  recurring/vesting payroll, positioned as a default payroll rail for Web3
  teams paying African talent.
