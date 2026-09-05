# Grow Vault — Competitive Master Build

## One-line pitch

Grow Vault helps people and small operators with uneven income protect a percentage of every inflow before the rest becomes spendable, while Watch-Dawg independently verifies the allocation and ledger.

## Master demo path

1. Set a vault percentage and trigger rule.
2. Add an incoming payment.
3. Show the split between protected and spendable funds.
4. Add a purchase and show the spending boundary.
5. Show emergency runway and transaction history.
6. Point out the Watch-Dawg verification result on every ledger entry.
7. Explain that the MVP is simulation-only and does not hold or move real funds.

## What is real in this repository

- Percentage-based deposit allocation.
- Optional allocation on spending events.
- Manual deposits and purchases.
- Protected and spendable balances.
- Emergency-runway calculation.
- User-set spending boundary.
- Local persistence.
- PWA/offline support.
- Deterministic Watch-Dawg-compatible audit values.
- GitHub Actions validation for JavaScript syntax, manifest validity, and required UI hooks.

## What is intentionally not claimed

The prototype does not provide banking, custody, investing, card issuance, money transmission, tax advice, or regulated financial services. No real customer money moves through this code.

## Competitive differentiation

Most budgeting demos only report what happened. Grow Vault demonstrates a rule that acts at the moment income arrives. The paired architecture also separates execution from verification:

- **Grow Vault applies the rule.**
- **Watch-Dawg audits the rule.**

That separation creates a stronger trust story than letting the same component both change and certify financial records.

## Best initial customer

A contractor, freelancer, gig worker, or small service operator whose income arrives irregularly and who needs to reserve money for taxes, emergency runway, payroll gaps, equipment, or another protected target.

## Productization path

1. Keep the standalone simulation as the public judge/demo build.
2. Add authenticated accounts and encrypted cloud sync.
3. Add receipt/job tagging for contractor workflows.
4. Integrate read-only bank data before considering money movement.
5. Keep Watch-Dawg as an independent reconciliation and exception layer.
6. Use regulated financial partners for any production custody or transfer capability.

## Master-build standard

A release is considered competition-ready when:

- the static demo loads without external secrets;
- the core flow works offline after first load;
- no real-money capability is implied;
- every transaction exposes a deterministic verification status;
- CI passes on `main`;
- the README and this file match the behavior actually present in the code.
