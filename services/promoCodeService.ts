export async function getPromoCodesByEventAndGames() {
  return []
}

export async function validatePromoCodePreview() {
  return [{ is_valid: false, discount_amount: 0, final_amount: 0, message: 'Promo codes disabled', promo_details: {} }]
}
