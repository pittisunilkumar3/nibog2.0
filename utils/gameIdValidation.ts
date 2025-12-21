/**
 * Utility functions for validating and processing game IDs throughout the application
 */

export interface ValidatedGameData {
  gameId: number;
  gamePrice: number;
  slotId?: number; // Add slot ID for proper game details lookup
}

export interface GameValidationResult {
  isValid: boolean;
  validGames: ValidatedGameData[];
  errors: string[];
}

/**
 * Validates a single game ID
 * @param gameId The game ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidGameId(gameId: any): boolean {
  if (gameId === null || gameId === undefined) {
    return false;
  }

  const numericId = Number(gameId);
  return !isNaN(numericId) && numericId > 0 && Number.isInteger(numericId);
}

/**
 * Validates a single game price
 * @param price The price to validate
 * @returns True if valid, false otherwise
 */
export function isValidGamePrice(price: any): boolean {
  if (price === null || price === undefined) {
    return false;
  }

  const numericPrice = Number(price);
  return !isNaN(numericPrice) && numericPrice >= 0;
}

/**
 * Validates an array of game IDs
 * @param gameIds Array of game IDs to validate
 * @returns Array of valid numeric game IDs
 */
export function validateGameIds(gameIds: any[]): number[] {
  if (!Array.isArray(gameIds)) {

    return [];
  }

  const validIds: number[] = [];
  const errors: string[] = [];

  gameIds.forEach((id, index) => {
    if (isValidGameId(id)) {
      validIds.push(Number(id));
    } else {
      errors.push(`Invalid game ID at index ${index}: ${id}`);
    }
  });

  if (errors.length > 0) {

  }


  return validIds;
}

/**
 * Validates an array of game prices
 * @param prices Array of prices to validate
 * @returns Array of valid numeric prices
 */
export function validateGamePrices(prices: any[]): number[] {
  if (!Array.isArray(prices)) {

    return [];
  }

  const validPrices: number[] = [];
  const errors: string[] = [];

  prices.forEach((price, index) => {
    if (isValidGamePrice(price)) {
      validPrices.push(Number(price));
    } else {
      errors.push(`Invalid game price at index ${index}: ${price}`);
    }
  });

  if (errors.length > 0) {

  }


  return validPrices;
}

/**
 * Validates and pairs game IDs with their prices and slot IDs
 * @param gameIds Array of game IDs
 * @param gamePrices Array of game prices
 * @param totalAmount Total amount for fallback price calculation
 * @param slotIds Optional array of slot IDs
 * @returns Validation result with paired game data
 */
export function validateGameData(
  gameIds: any[],
  gamePrices: any[],
  totalAmount: number = 0,
  slotIds?: any[]
): GameValidationResult {


  const errors: string[] = [];

  // Validate inputs
  if (!Array.isArray(gameIds)) {
    errors.push('Game IDs must be an array');
    return { isValid: false, validGames: [], errors };
  }

  if (!Array.isArray(gamePrices)) {
    errors.push('Game prices must be an array');
    return { isValid: false, validGames: [], errors };
  }

  if (gameIds.length === 0) {
    errors.push('At least one game ID is required');
    return { isValid: false, validGames: [], errors };
  }

  // Validate each game ID and pair with price
  const validGames: ValidatedGameData[] = [];

  gameIds.forEach((gameId, index) => {
    if (!isValidGameId(gameId)) {
      errors.push(`Invalid game ID at index ${index}: ${gameId}`);
      return;
    }

    const numericGameId = Number(gameId);
    let gamePrice = 0;

    // Try to get corresponding price
    if (gamePrices[index] !== undefined && isValidGamePrice(gamePrices[index])) {
      gamePrice = Number(gamePrices[index]);
    } else {
      // Fallback: divide total amount equally among valid games
      if (totalAmount > 0) {
        gamePrice = totalAmount / gameIds.length;
      } else {
        errors.push(`No valid price found for game ID ${numericGameId} at index ${index}`);
        return;
      }
    }

    // Get corresponding slot ID if available
    let slotId: number | undefined;
    if (slotIds && slotIds[index] !== undefined && !isNaN(Number(slotIds[index]))) {
      slotId = Number(slotIds[index]);
    }

    validGames.push({
      gameId: numericGameId,
      gamePrice: gamePrice,
      ...(slotId && { slotId })
    });
  });

  const isValid = validGames.length > 0 && errors.length === 0;



  if (errors.length > 0) {

  }

  return {
    isValid,
    validGames,
    errors
  };
}

/**
 * Formats validated game data for API consumption
 * @param validatedGames Array of validated game data
 * @returns Array formatted for API
 */
export function formatGamesForAPI(validatedGames: ValidatedGameData[]): Array<{ slot_id: number, game_id: number, game_price: number }> {
  return validatedGames.map(game => ({
    slot_id: game.slotId || 0, // Include slot_id as required field, default to 0 if not available
    game_id: game.gameId,
    game_price: game.gamePrice
  }));
}

/**
 * Creates a safe fallback game entry when no valid games are found
 * @param totalAmount Total amount to use as price
 * @returns Single fallback game entry
 */
export function createFallbackGame(totalAmount: number = 0): { slot_id: number, game_id: number, game_price: number } {

  return {
    slot_id: 0, // Default slot_id for fallback
    game_id: 1, // Assuming game ID 1 exists in the system
    game_price: totalAmount
  };
}
