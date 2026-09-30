import { FormEvent, useState } from 'react'
import {
  calculateRecommendation,
  type Recommendation,
  type WeightIncrementKg,
  WEIGHT_INCREMENTS_KG,
} from './strength-engine'
import './App.css'

const EXERCISES = [
  'Back Squat',
  'Bench Press',
  'Deadlift',
  'Front Squat',
  'Incline Bench Press',
  'Lat Pulldown',
  'Leg Press',
  'Overhead Press',
  'Romanian Deadlift',
]

interface FormValues {
  exercise: string
  weightKg: string
  currentReps: string
  currentRir: string
  targetSets: string
  targetReps: string
  targetRir: string
  incrementKg: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const INITIAL_VALUES: FormValues = {
  exercise: 'Bench Press',
  weightKg: '70',
  currentReps: '8',
  currentRir: '0',
  targetSets: '3',
  targetReps: '15',
  targetRir: '2',
  incrementKg: '2.5',
}

const formatKg = (value: number, decimals = 1) =>
  `${Number(value.toFixed(decimals))} kg`

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    const integerFields: Array<{
      field: keyof FormValues
      label: string
      min: number
      max: number
    }> = [
      { field: 'currentReps', label: 'Completed reps', min: 1, max: 20 },
      { field: 'currentRir', label: 'Completed RIR', min: 0, max: 5 },
      { field: 'targetSets', label: 'Target sets', min: 1, max: 5 },
      { field: 'targetReps', label: 'Target reps', min: 1, max: 20 },
      { field: 'targetRir', label: 'Target RIR', min: 0, max: 5 },
    ]

    if (!values.exercise.trim()) nextErrors.exercise = 'Enter an exercise.'

    const weightKg = Number(values.weightKg)
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      nextErrors.weightKg = 'Enter a weight greater than 0.'
    }

    for (const { field, label, min, max } of integerFields) {
      const value = Number(values[field])
      if (!Number.isInteger(value) || value < min || value > max) {
        nextErrors[field] = `${label} must be ${min}–${max}.`
      }
    }

    if (!WEIGHT_INCREMENTS_KG.includes(Number(values.incrementKg) as WeightIncrementKg)) {
      nextErrors.incrementKg = 'Choose a supported increment.'
    }

    return nextErrors
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setRecommendation(null)
      return
    }

    setRecommendation(
      calculateRecommendation({
        performance: {
          exercise: values.exercise,
          weightKg: Number(values.weightKg),
          reps: Number(values.currentReps),
          rir: Number(values.currentRir),
        },
        target: {
          sets: Number(values.targetSets),
          reps: Number(values.targetReps),
          rir: Number(values.targetRir),
        },
        incrementKg: Number(values.incrementKg) as WeightIncrementKg,
      }),
    )
  }

  const inputProps = (field: keyof FormValues) => ({
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      updateValue(field, event.target.value),
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Strength calculator home">
          <span className="brand-mark" aria-hidden="true">SC</span>
          Strength calculator
        </a>
        <span className="header-note">Evidence-informed estimates</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">Train with a better starting point</p>
        <h1>Turn one strong set into your next working weight.</h1>
        <p className="intro-copy">
          Enter a recent lift and your target. We’ll estimate your strength, account
          for reps in reserve and multi-set fatigue, then round to plates you can use.
        </p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-card" onSubmit={handleSubmit} noValidate>
          <div className="form-heading">
            <div>
              <p className="step-label">01</p>
              <h2>Your lift</h2>
            </div>
            <p>Use a recent, technically sound set.</p>
          </div>

          <div className="field full-width">
            <label htmlFor="exercise">Exercise</label>
            <input
              id="exercise"
              type="text"
              list="exercise-options"
              placeholder="e.g. Bench Press"
              {...inputProps('exercise')}
            />
            <datalist id="exercise-options">
              {EXERCISES.map((exercise) => <option key={exercise} value={exercise} />)}
            </datalist>
            {errors.exercise && <span className="error" id="exercise-error">{errors.exercise}</span>}
          </div>

          <div className="field-grid three-columns">
            <div className="field">
              <label htmlFor="weightKg">Weight <span>kg</span></label>
              <input id="weightKg" type="number" min="0.01" step="0.25" inputMode="decimal" {...inputProps('weightKg')} />
              {errors.weightKg && <span className="error" id="weightKg-error">{errors.weightKg}</span>}
            </div>
            <div className="field">
              <label htmlFor="currentReps">Reps</label>
              <input id="currentReps" type="number" min="1" max="20" step="1" inputMode="numeric" {...inputProps('currentReps')} />
              {errors.currentReps && <span className="error" id="currentReps-error">{errors.currentReps}</span>}
            </div>
            <div className="field">
              <label htmlFor="currentRir">RIR <span>0–5</span></label>
              <input id="currentRir" type="number" min="0" max="5" step="1" inputMode="numeric" {...inputProps('currentRir')} />
              {errors.currentRir && <span className="error" id="currentRir-error">{errors.currentRir}</span>}
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-heading">
            <div>
              <p className="step-label">02</p>
              <h2>Your target</h2>
            </div>
            <p>Choose the work you want to complete.</p>
          </div>

          <div className="field-grid three-columns">
            <div className="field">
              <label htmlFor="targetSets">Sets</label>
              <input id="targetSets" type="number" min="1" max="5" step="1" inputMode="numeric" {...inputProps('targetSets')} />
              {errors.targetSets && <span className="error" id="targetSets-error">{errors.targetSets}</span>}
            </div>
            <div className="field">
              <label htmlFor="targetReps">Reps</label>
              <input id="targetReps" type="number" min="1" max="20" step="1" inputMode="numeric" {...inputProps('targetReps')} />
              {errors.targetReps && <span className="error" id="targetReps-error">{errors.targetReps}</span>}
            </div>
            <div className="field">
              <label htmlFor="targetRir">RIR <span>0–5</span></label>
              <input id="targetRir" type="number" min="0" max="5" step="1" inputMode="numeric" {...inputProps('targetRir')} />
              {errors.targetRir && <span className="error" id="targetRir-error">{errors.targetRir}</span>}
            </div>
          </div>

          <fieldset className="increment-field">
            <legend>Available weight increment</legend>
            <div className="increment-options">
              {WEIGHT_INCREMENTS_KG.map((increment) => (
                <label key={increment}>
                  <input
                    type="radio"
                    name="incrementKg"
                    value={increment}
                    checked={values.incrementKg === String(increment)}
                    onChange={(event) => updateValue('incrementKg', event.target.value)}
                  />
                  <span>{increment} kg</span>
                </label>
              ))}
            </div>
            {errors.incrementKg && <span className="error" id="incrementKg-error">{errors.incrementKg}</span>}
          </fieldset>

          <button className="calculate-button" type="submit">
            Calculate working weight <span aria-hidden="true">→</span>
          </button>
        </form>

        <aside className={`results-card${recommendation ? ' has-results' : ''}`} aria-live="polite">
          {recommendation ? (
            <Results recommendation={recommendation} values={values} />
          ) : (
            <div className="empty-results">
              <div className="plate-graphic" aria-hidden="true"><span>KG</span></div>
              <p className="eyebrow">Your recommendation</p>
              <h2>Ready when you are.</h2>
              <p>Complete the calculator to see your suggested load, strength estimate, and rep table.</p>
            </div>
          )}
        </aside>
      </div>

      {recommendation && <RepTable recommendation={recommendation} />}

      <footer>
        <p><strong>Start smart.</strong> This is an estimate, not a guarantee.</p>
        <p>Sleep, rest time, technique, equipment, and daily readiness all affect performance. Adjust from training feedback.</p>
      </footer>
    </main>
  )
}

function Results({ recommendation, values }: { recommendation: Recommendation; values: FormValues }) {
  const [lowKg, highKg] = recommendation.suggestedRangeKg
  return (
    <div className="results-content">
      <p className="eyebrow">Suggested starting weight</p>
      <div className="primary-result">
        <strong>{formatKg(recommendation.suggestedWeightKg)}</strong>
        <span>{values.targetSets} sets × {values.targetReps} reps @ {values.targetRir} RIR</span>
      </div>
      <div className="range-result">
        <span>Expected range</span>
        <strong>{formatKg(lowKg)}–{formatKg(highKg)}</strong>
      </div>
      <div className="estimate-grid">
        <div>
          <span>Estimated 1RM</span>
          <strong>{formatKg(recommendation.oneRepMax.consensusKg)}</strong>
        </div>
        <div>
          <span>Estimate range</span>
          <strong>{formatKg(recommendation.oneRepMax.rangeKg[0])}–{formatKg(recommendation.oneRepMax.rangeKg[1])}</strong>
        </div>
      </div>
      <details>
        <summary>How this was calculated</summary>
        <p>
          Epley: {formatKg(recommendation.oneRepMax.epleyKg)} · Brzycki:{' '}
          {formatKg(recommendation.oneRepMax.brzyckiKg)}. Extra sets reduce the suggested
          load by 2.5% each after the first.
        </p>
      </details>
    </div>
  )
}

function RepTable({ recommendation }: { recommendation: Recommendation }) {
  return (
    <section className="rep-table-section" aria-labelledby="rep-table-title">
      <div className="table-heading">
        <div>
          <p className="eyebrow">Strength curve</p>
          <h2 id="rep-table-title">Estimated single-set rep maxes</h2>
        </div>
        <p>Based on a {formatKg(recommendation.oneRepMax.consensusKg)} estimated 1RM.</p>
      </div>
      <div className="rep-grid">
        {recommendation.repTable.map((entry) => (
          <div className="rep-entry" key={entry.reps}>
            <span>{entry.reps} {entry.reps === 1 ? 'rep' : 'reps'}</span>
            <strong>{formatKg(entry.estimatedWeightKg)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default App
