# strength-calculator

strength calculator + set/rep prescription engine

Yes. I’d treat this first as **requirements/design**, not coding. The core product is essentially a **strength calculator + set/rep prescription engine**.

The important distinction is that these are actually two related calculations:

1. **“70 kg × 8 → what is my estimated 1RM?”**
2. **“Given that strength level, what should I use for 3×12 / 3×15 / 4×10?”**

The second one is more complicated because a formula predicting a single 12RM does **not** mean you can necessarily do that weight for **three sets of 12**.

## 1. Core user flow

I would make the MVP extremely simple:

**Input**

> Exercise: Bench Press  
> Weight: 70 kg  
> Reps: 8  
> Sets: 1  
> RIR: optional, e.g. 0–3

Then calculate:

> Estimated 1RM: ~87–89 kg

And immediately generate a table roughly like:

| Goal   | Suggested starting weight |
| ------ | ------------------------: |
| 3 × 6  |                 ~70–75 kg |
| 3 × 8  |               ~67.5–70 kg |
| 3 × 10 |             ~62.5–67.5 kg |
| 3 × 12 |             ~57.5–62.5 kg |
| 3 × 15 |             ~52.5–57.5 kg |

Those numbers shouldn't be presented as physiologically exact. The app should say something like **“Suggested starting weight”**, because fatigue, exercise selection, rest time, training experience and individual rep endurance matter.

---

## 2. Calculation engine

For the first version, I'd support several established 1RM formulas internally.

For example, **Epley**:

\[
1RM = Weight \times (1 + Reps/30)
\]

Your example:

\[
70 \times (1 + 8/30) = 88.7kg
\]

**Brzycki** gives:

\[
1RM = Weight \times \frac{36}{37-Reps}
\]

So:

\[
70 \times \frac{36}{29} = 86.9kg
\]

Instead of pretending one formula knows your “true” maximum, the application could calculate multiple formulas and use a **consensus estimate**.

So you might see:

> Estimated 1RM: **87.5 kg**  
> Expected range: **86–89 kg**

That's more defensible than saying your 1RM is exactly 88.7 kg.

### Then reverse it

Once we have estimated 1RM, we can estimate an n-rep maximum.

Using Epley:

\[
Weight = \frac{1RM}{1 + Reps/30}
\]

But here's where your app becomes more useful than a normal 1RM calculator.

**12RM ≠ 3×12 training weight.**

If someone's estimated 12RM is 63 kg, they probably shouldn't be prescribed 63 kg for 3×12, because that's approximately their maximum weight for **one** set of 12.

So I'd introduce another layer:

**Estimated rep-max → multi-set adjustment → suggested training weight.**

---

# 3. Set-aware calculator

This should probably be the main differentiator.

User asks:

> I can bench 70 × 8.  
> What should I use for **3 × 15?**

The engine:

**Step 1:** estimate strength.

> e1RM ≈ 87.5 kg

**Step 2:** estimate 15RM.

Maybe approximately:

> 57–60 kg

**Step 3:** account for three sets.

Instead of prescribing the actual 15RM:

> Suggested starting weight: **52.5–55 kg**

Now you're answering the question lifters actually care about.

I'd allow:

> Target sets: `3`  
> Target reps: `15`  
> Target RIR: `2`  
> Rest: `2 min`

And eventually those variables can influence the recommendation.

---

# 4. RIR is important

I would add **Reps in Reserve** relatively early.

Consider:

> 70 × 8 @ 0 RIR

versus

> 70 × 8 @ 3 RIR

Those represent very different strength levels.

If you did 70 × 8 and could have done another three reps, the app can approximately treat the performance as:

> 70 × ~11 maximum reps

and estimate your strength from that.

Therefore input becomes:

**70 kg × 8 @ 2 RIR**

rather than simply:

**70 kg × 8**

This will make recommendations considerably more useful.

---

# 5. Exercise profiles

I would **not assume rep relationships are identical for every exercise**.

For example:

> Bench Press  
> Incline Bench Press  
> Lat Pulldown  
> Leg Press  
> Biceps Curl

Someone's ability to perform repetitions at a given percentage of 1RM can differ considerably between these exercises.

For MVP, use the same general formula.

Later, introduce **exercise-specific coefficients** based on the user's own history.

That's where the product can become genuinely interesting.

---

# 6. Personal calibration

Imagine initially the app predicts:

> Bench 3×15 → 52.5 kg

You train and report:

> 52.5 × 15  
> 52.5 × 15  
> 52.5 × 15  
> Final set: 3 RIR

The app now knows its prediction was conservative.

Next time it might recommend:

> **55 kg**

After perhaps 5–10 workouts, instead of relying primarily on Epley/Brzycki, it starts building **your personal strength curve**.

It could learn that _you_, for example, perform unusually well in higher rep ranges.

That gives us:

**generic model → observations → personalized model**

I think that's the direction I'd design the architecture around, even if personalization isn't in V1.

---

# 7. Backend?

For **V1: no.**

I would build it as:

**React + TypeScript + Vite**

with the calculation engine as pure TypeScript.

Something conceptually like:

```text
strength-engine/
    estimate1RM()
    estimateRepMax()
    estimateWorkingWeight()
    adjustForRIR()
    adjustForSets()
    roundToAvailableWeight()
```

Then React is merely the UI around this domain logic.

Everything can execute locally in the browser.

No authentication.  
No database.  
No API.  
No infrastructure.

That makes an MVP ridiculously easy to deploy.

### When would I introduce a backend?

When we add:

**Accounts → workout history → cross-device sync → analytics → personalized predictions.**

Then:

```text
React
   ↓
NestJS API
   ↓
PostgreSQL
```

Given your existing React/Nest experience, NestJS + Postgres would be completely reasonable, but I'd avoid creating them until we actually need persistence.

---

# 8. MVP requirements

I'd define **V1** around one central promise:

> **“Tell me what you can lift, and I'll estimate what weight to use for another set/rep scheme.”**

The first release needs:

1. **Exercise**
2. **Current weight**
3. **Current reps**
4. **RIR** — optional
5. **Target sets**
6. **Target reps**
7. **Target RIR**
8. **Weight increment** — 1 / 2 / 2.5 / 5 kg
9. **Estimated 1RM**
10. **Suggested target weight**
11. **Suggested range**, e.g. `52.5–55 kg`
12. A **rep table** showing estimated weights for perhaps 1–20 reps.

I wouldn't add accounts, workout programs, AI, social features, etc. yet.

---

## Then V2 becomes much more interesting

Save workouts:

> Bench  
> Sep 20 — 70 × 8, 7, 6  
> Sep 25 — 65 × 10, 9, 8  
> Sep 30 — 55 × 15, 15, 14

Now the app can calculate:

**Estimated strength trend**

> 84 → 86 → 88 → 90 kg e1RM

and more importantly:

**Personal rep profile**

> Your 15-rep performance is ~3% higher than our generic prediction.

Eventually the question changes from:

> “According to Epley, what should Anton bench for 15?”

to:

> “Based on Anton's previous bench sessions, what is he most likely to successfully complete for 3×15 @ 2 RIR?”

That's a much better product.

---

## One architectural decision I'd make immediately

Keep the **calculation engine completely independent of React**.

```text
UI
│
├── Exercise input
├── Current performance
├── Target performance
└── Results
        │
        ▼
Strength Engine
│
├── 1RM estimation
├── rep-max estimation
├── RIR adjustment
├── multi-set fatigue adjustment
├── exercise adjustment
└── plate rounding
```

Then later:

```text
                  ┌─ Generic formulas
                  │
User performance ─┼─ Personal history
                  │
                  └─ Exercise profile
                          ↓
                 Recommendation Engine
                          ↓
                   55 kg × 3 × 15
```

That means you can completely change the mathematical model later without rewriting the UI.

The next thing I'd define before giving anything to Codex is **the calculation specification**: exact formulas, how RIR modifies them, how we convert a single-set rep max into 2/3/4/5-set recommendations, rounding rules, confidence ranges, and several concrete test cases such as `70×8 → 3×15`. That's the part where we should be especially careful, because the UI is trivial compared with getting the recommendation model sensible.
