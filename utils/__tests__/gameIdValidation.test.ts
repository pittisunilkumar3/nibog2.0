import { validateGameData } from '../gameIdValidation'

describe('validateGameData - multiple games', () => {
  test('validates multiple games with slotIds', () => {
    const gameIds = [5, 6]
    const gamePrices = [12.5, 8]
    const slotIds = [101, 102]
    const totalAmount = 20.5

    const result = validateGameData(gameIds, gamePrices, totalAmount, slotIds)

    expect(result.isValid).toBe(true)
    expect(result.validGames.length).toBe(2)

    expect(result.validGames[0]).toEqual({ gameId: 5, gamePrice: 12.5, slotId: 101 })
    expect(result.validGames[1]).toEqual({ gameId: 6, gamePrice: 8, slotId: 102 })
  })

  test('falls back to splitting totalAmount when prices missing', () => {
    const gameIds = [5, 6]
    const gamePrices: any[] = [undefined, undefined]
    const totalAmount = 40

    const result = validateGameData(gameIds, gamePrices, totalAmount)

    expect(result.isValid).toBe(true)
    expect(result.validGames.length).toBe(2)
    expect(result.validGames[0].gamePrice).toBeCloseTo(20)
    expect(result.validGames[1].gamePrice).toBeCloseTo(20)
  })
})
