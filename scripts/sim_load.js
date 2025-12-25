const fs = require('fs');
const data = JSON.parse(fs.readFileSync('booking_info_clean3.json','utf8'));
const event = data.data[0].events[0];

function loadGamesForEvent(event, childAgeMonths) {
  if (!event.games_with_slots || event.games_with_slots.length === 0) {
    console.log('No games_with_slots'); return [];
  }
  const eligibleSlots = event.games_with_slots.filter((slot) => {
    const rawMin = Number(slot.min_age || 0);
    const rawMax = Number(slot.max_age || 0);
    const minMonthsCandidate = rawMin;
    const maxMonthsCandidate = rawMax;
    const minMonthsFromYears = rawMin * 12;
    const maxMonthsFromYears = rawMax * 12;
    const isEligibleIfRawMonths = childAgeMonths >= minMonthsCandidate && childAgeMonths <= maxMonthsCandidate;
    const isEligibleIfYears = childAgeMonths >= minMonthsFromYears && childAgeMonths <= maxMonthsFromYears;
    const isAgeEligible = isEligibleIfRawMonths || isEligibleIfYears;
    return isAgeEligible;
  });
  console.log('eligibleSlots length', eligibleSlots.length);
  const formattedGames = eligibleSlots.map((slot) => {
    const rawMin = Number(slot.min_age || 0);
    const rawMax = Number(slot.max_age || 0);
    const minAgeMonths = rawMin >= 24 ? rawMin : (rawMin * 12 > 0 && rawMin <= 20 && rawMax <= 20 && rawMax * 12 < 120 ? rawMin * 12 : rawMin);
    const maxAgeMonths = rawMax >= 24 ? rawMax : (rawMax * 12 > 0 && rawMax <= 20 && rawMax * 12 < 120 ? rawMax * 12 : rawMax);
    return {
      id: slot.slot_id,
      game_id: slot.game_id,
      title: slot.custom_title || slot.game_name,
      min_age_months: minAgeMonths,
      max_age_months: maxAgeMonths
    };
  });
  return formattedGames;
}

const result = loadGamesForEvent(event, 23);
console.log('Result', result);
