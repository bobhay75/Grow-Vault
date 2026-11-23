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

## Run and validate

Serve this folder with a static web server, for example `python -m http.server 8080`, then open `http://localhost:8080`. No account, API key, build step, or external service is needed for the simulator.

```bash
node --check engine.js
node --check app.js
node --check sw.js
node --test tests/*.test.cjs
```

The ledger now calculates in integer cents and replays saved transactions before accepting stored balances. Purchase totals include the chosen extra Vault transfer. The protected balance cannot fund a purchase. The on-screen reconciliation label verifies the simulation math; it is not an external Watch-Dawg service attestation.

Entries are saved to this browser only. Export makes a JSON copy, including notes. A blocked or full storage area produces an explicit error before balances change. Invalid existing data is preserved and new entries are blocked until it is exported or the user confirms a reset. Changing browsers or clearing site data loses local history unless it was exported. Use one active tab when recording transactions; localStorage does not provide transactional locking across tabs.

The service worker caches only this application's exact static assets and deletes only old `grow-vault-` caches. It never substitutes the app page for API or external requests. The Pages workflow uploads only the five runtime assets, rather than repository reports and tests.

### Validation recorded 2026-11-23

- All 11 Node regression tests passed, covering cent arithmetic, insufficient funds, hostile/corrupt saved data, balance limits, failed saves, versioned offline asset coverage, and cache isolation.
- JavaScript syntax and `git diff --check` passed.
- A local Chromium end-to-end launch was attempted but the execution environment denied its required process socket. Browser/device visual and installation checks remain release checks; they are not claimed as completed.
- This is a usable simulation prototype. Banking, payments, investment returns, live account connections, and external audit services are not implemented here.
