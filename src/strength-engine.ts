export const WEIGHT_INCREMENTS_KG = [1, 2, 2.5, 5] as const

export type WeightIncrementKg = (typeof WEIGHT_INCREMENTS_KG)[number]

export interface PerformanceInput {
  exercise: string
  weightKg: number
  reps: number
  rir: number
}

export interface TargetInput {
  sets: number
  reps: number
  rir: number
}

export interface RecommendationInput {
  performance: PerformanceInput
  target: TargetInput
  incrementKg: WeightIncrementKg
}

export interface OneRepMaxEstimate {
  epleyKg: number
  brzyckiKg: number
  consensusKg: number
  rangeKg: [number, number]
}

export interface RepTableEntry {
  reps: number
  estimatedWeightKg: number
}

export interface Recommendation {
  exercise: string
  oneRepMax: OneRepMaxEstimate
  suggestedWeightKg: number
  suggestedRangeKg: [number, number]
  repTable: RepTableEntry[]
}

const assertFinitePositive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be greater than 0.`)
  }
}

const assertIntegerInRange = (
  value: number,
  minimum: number,
  maximum: number,
  label: string,
) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be between ${minimum} and ${maximum}.`)
  }
}

export function estimateOneRepMax(
  weightKg: number,
  reps: number,
  rir = 0,
): OneRepMaxEstimate {
  assertFinitePositive(weightKg, 'Weight')
  assertIntegerInRange(reps, 1, 20, 'Reps')
  assertIntegerInRange(rir, 0, 5, 'RIR')

  const effectiveReps = reps + rir
  const epleyKg = weightKg * (1 + effectiveReps / 30)
  const brzyckiKg = weightKg * (36 / (37 - effectiveReps))
  const consensusKg = (epleyKg + brzyckiKg) / 2

  return {
    epleyKg,
    brzyckiKg,
    consensusKg,
    rangeKg: [Math.min(epleyKg, brzyckiKg), Math.max(epleyKg, brzyckiKg)],
  }
}

export function estimateRepMax(
  oneRepMaxKg: number,
  reps: number,
  rir = 0,
): number {
  assertFinitePositive(oneRepMaxKg, 'Estimated 1RM')
  assertIntegerInRange(reps, 1, 20, 'Reps')
  assertIntegerInRange(rir, 0, 5, 'RIR')

  const effectiveReps = reps + rir
  return effectiveReps === 1
    ? oneRepMaxKg
    : oneRepMaxKg / (1 + effectiveReps / 30)
}

export function estimateWorkingWeight(
  oneRepMaxKg: number,
  target: TargetInput,
): number {
  assertIntegerInRange(target.sets, 1, 5, 'Sets')
  const singleSetWeightKg = estimateRepMax(oneRepMaxKg, target.reps, target.rir)
  const fatigueFactor = 1 - (target.sets - 1) * 0.025

  return singleSetWeightKg * fatigueFactor
}

export function roundToIncrement(
  weightKg: number,
  incrementKg: WeightIncrementKg,
): number {
  assertFinitePositive(weightKg, 'Weight')
  if (!WEIGHT_INCREMENTS_KG.includes(incrementKg)) {
    throw new RangeError('Unsupported weight increment.')
  }

  return Number((Math.round(weightKg / incrementKg) * incrementKg).toFixed(2))
}

export function calculateRecommendation({
  performance,
  target,
  incrementKg,
}: RecommendationInput): Recommendation {
  if (!performance.exercise.trim()) {
    throw new RangeError('Exercise is required.')
  }

  const oneRepMax = estimateOneRepMax(
    performance.weightKg,
    performance.reps,
    performance.rir,
  )
  const suggestedWeightKg = roundToIncrement(
    estimateWorkingWeight(oneRepMax.consensusKg, target),
    incrementKg,
  )
  const rangeCandidates = oneRepMax.rangeKg.map((estimateKg) =>
    roundToIncrement(estimateWorkingWeight(estimateKg, target), incrementKg),
  ) as [number, number]
  const suggestedRangeKg: [number, number] = [
    Math.min(...rangeCandidates),
    Math.max(...rangeCandidates),
  ]
  const repTable = Array.from({ length: 20 }, (_, index) => {
    const reps = index + 1
    return {
      reps,
      estimatedWeightKg: roundToIncrement(
        estimateRepMax(oneRepMax.consensusKg, reps),
        incrementKg,
      ),
    }
  })

  return {
    exercise: performance.exercise.trim(),
    oneRepMax,
    suggestedWeightKg,
    suggestedRangeKg,
    repTable,
  }
}
