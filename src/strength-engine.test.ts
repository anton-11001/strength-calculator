import { describe, expect, it } from 'vitest'
import {
  calculateRecommendation,
  estimateOneRepMax,
  estimateWorkingWeight,
  roundToIncrement,
  type RecommendationInput,
} from './strength-engine'

const referenceInput: RecommendationInput = {
  performance: {
    exercise: 'Bench Press',
    weightKg: 70,
    reps: 8,
    rir: 0,
  },
  target: { sets: 3, reps: 15, rir: 2 },
  incrementKg: 2.5,
}

describe('strength engine', () => {
  it('matches the reference estimate and prescription', () => {
    const result = calculateRecommendation(referenceInput)

    expect(result.oneRepMax.epleyKg).toBeCloseTo(88.7, 1)
    expect(result.oneRepMax.brzyckiKg).toBeCloseTo(86.9, 1)
    expect(result.oneRepMax.consensusKg).toBeCloseTo(87.8, 1)
    expect(result.suggestedWeightKg).toBe(52.5)
    expect(result.suggestedRangeKg).toEqual([52.5, 55])
    expect(result.repTable).toHaveLength(20)
    expect(result.repTable[0].estimatedWeightKg).toBe(87.5)
  })

  it('increases the estimate when the completed set has more RIR', () => {
    expect(estimateOneRepMax(70, 8, 3).consensusKg).toBeGreaterThan(
      estimateOneRepMax(70, 8, 0).consensusKg,
    )
  })

  it('lowers working weight for more sets and higher target RIR', () => {
    const oneSet = estimateWorkingWeight(100, { sets: 1, reps: 10, rir: 0 })
    const threeSets = estimateWorkingWeight(100, { sets: 3, reps: 10, rir: 0 })
    const higherRir = estimateWorkingWeight(100, { sets: 1, reps: 10, rir: 3 })

    expect(threeSets).toBeLessThan(oneSet)
    expect(higherRir).toBeLessThan(oneSet)
  })

  it.each([
    [71.2, 1, 71],
    [71.2, 2, 72],
    [71.2, 2.5, 70],
    [71.2, 5, 70],
  ] as const)('rounds %s kg to a %s kg increment', (weight, increment, expected) => {
    expect(roundToIncrement(weight, increment)).toBe(expected)
  })

  it('rejects values outside the supported ranges', () => {
    expect(() => estimateOneRepMax(0, 8)).toThrow('Weight')
    expect(() => estimateOneRepMax(70, 21)).toThrow('Reps')
    expect(() => estimateWorkingWeight(100, { sets: 6, reps: 8, rir: 0 })).toThrow('Sets')
    expect(() => calculateRecommendation({
      ...referenceInput,
      performance: { ...referenceInput.performance, exercise: ' ' },
    })).toThrow('Exercise')
  })
})
