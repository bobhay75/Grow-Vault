# Grow Vault

**Grow Vault is a cash-flow stability prototype for people and small businesses with uneven income.** It automatically models setting aside a chosen percentage of incoming money before the rest is treated as available to spend.

> Protect part of every inflow before the money disappears into the month.

The public MVP is intentionally simulation-only: **no real customer funds, custody, investments, bank transfers, or card issuance are handled by this repository.** It is a product and workflow prototype, not a financial institution.

## Problem

People with variable income often know they should save, but the amount available changes week to week. A fixed monthly savings target can fail when income is irregular. Grow Vault instead models a proportional rule: when money comes in, a configurable percentage is protected automatically.

## Current MVP

- Configurable percentage-based vaulting on deposits.
- Manual deposit and purchase entry for realistic scenarios.
- Separate protected/vaulted and spendable balances.
- Emergency-runway view based on the protected balance.
- Visible spending boundary so users can see what is actually available.
- Local transaction ledger and audit trail.
- PWA/offline behavior for a lightweight installable demo.
- Watch-Dawg-compatible transaction records for deterministic audit and anomaly detection.

## Why it matters

The product is designed around a simple behavioral advantage: **make the protective decision at the moment income arrives instead of relying on whatever is left later.**

That makes Grow Vault useful as the financial workflow layer while **Watch-Dawg AI** serves as the independent audit layer that verifies allocations, reconciles records, and flags anomalies for human review.

## Demonstration flow

1. Set the vault percentage.
2. Add an incoming payment.
3. Confirm the protected and spendable amounts are calculated separately.
4. Add ordinary purchases and watch the spendable balance change without silently consuming the protected balance.
5. Review emergency runway and the transaction ledger.
6. Run the same ledger through Watch-Dawg to verify allocation and reconciliation behavior.

## Prototype boundary

The current code demonstrates product behavior only. Any production version that moves or safeguards real money would require regulated financial partners, strong authentication and authorization, encrypted data handling, fraud controls, audit logging, privacy controls, and jurisdiction-specific legal/compliance review.

## Product direction

The strongest near-term use case is uneven-income operators—contractors, freelancers, gig workers, and small service businesses—who need a simple way to reserve money for taxes, emergencies, payroll gaps, equipment, or other protected goals without manually recalculating every deposit.

Grow Vault + Watch-Dawg form a complementary system:

- **Grow Vault:** apply the user's protective cash-flow rule.
- **Watch-Dawg:** independently verify the math and records, detect anomalies, and surface exceptions.

That separation is deliberate: one layer performs the workflow; the other audits it.
