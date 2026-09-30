# Strength Calculator

A browser-only strength calculator and set/rep prescription engine. Enter a recent lift, reps in reserve (RIR), and a target set/rep scheme to get an estimated 1RM and a practical starting weight.

## Features

- Consensus estimated 1RM using Epley and Brzycki formulas
- Optional completed-set RIR adjustment
- Target sets, reps, and RIR prescription
- Multi-set fatigue adjustment
- Configurable 1, 2, 2.5, or 5 kg rounding
- Suggested range based on formula uncertainty
- Estimated single-set weights for 1–20 reps
- Responsive, accessible calculator UI
- All calculations run locally; there is no account, backend, or tracking

## Calculation model

Completed-set RIR is added to completed reps before estimating 1RM:

```text
effective reps = completed reps + completed RIR
```

The app calculates two estimates and uses their arithmetic mean:

```text
Epley:   1RM = weight × (1 + effective reps / 30)
Brzycki: 1RM = weight × 36 / (37 - effective reps)
```

The target load uses the inverse Epley curve. Target RIR is added to target reps, then the load is reduced by 2.5% for every set after the first:

```text
single-set load = estimated 1RM / (1 + (target reps + target RIR) / 30)
working load = single-set load × (1 - 0.025 × (target sets - 1))
```

The final recommendation and range are rounded to the selected available weight increment. These are generic estimates, not physiological guarantees; rest time, technique, equipment, recovery, and individual rep endurance all matter.

### Reference case

`70 kg × 8 @ 0 RIR` produces an Epley estimate of about `88.7 kg`, a Brzycki estimate of about `86.9 kg`, and a consensus e1RM of about `87.8 kg`. For `3 × 15 @ 2 RIR`, rounded to 2.5 kg, the suggested starting weight is `52.5 kg` with a `52.5–55 kg` range.

## Supported inputs

- Weight: any positive kilogram value
- Completed and target reps: 1–20
- Completed and target RIR: 0–5
- Target sets: 1–5
- Weight increments: 1, 2, 2.5, or 5 kg

Exercise names are descriptive in V1 and do not alter the calculation.

## Development

Requires Node.js and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm test
pnpm lint
pnpm build
```

The calculation engine lives in `src/strength-engine.ts` and is independent of React. This keeps future exercise profiles, workout history, and personal calibration separate from the interface.
