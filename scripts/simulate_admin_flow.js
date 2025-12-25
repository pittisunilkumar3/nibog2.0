const fs = require('fs');
const { differenceInMonths } = require('date-fns');
const data = JSON.parse(fs.readFileSync('booking_info_clean3.json','utf8'));
const bookingData = data.data;

// Convert bookingData to apiEvents as in handleCityChange
const cityData = bookingData[0];
const convertedEvents = cityData.events.map(event => ({
  event_id: event.id,
  event_title: event.title,
  event_description: event.description,
  event_date: event.event_date,
  event_status: event.status,
  event_created_at: event.created_at,
  event_updated_at: event.updated_at,
  city_id: event.city_id,
  city_name: cityData.city_name,
  state: cityData.state,
  city_is_active: cityData.is_active === 1,
  venue_id: event.venue_id,
  venue_name: event.venue_name,
  venue_address: event.venue_address,
  venue_capacity: event.venue_capacity,
  games_with_slots: event.games_with_slots
}));

let apiEvents = convertedEvents;
let selectedEventType = 'testttt';
let childDateOfBirth = '2024-12-23';

// Age effect
function calculateAgeAndLoad() {
  if (!childDateOfBirth) { console.log('No DOB'); return; }
  const selectedEvent = apiEvents.find(e => e.event_title === selectedEventType);
  let ageMonths;
  if (!selectedEvent || !selectedEvent.event_date) {
    ageMonths = differenceInMonths(new Date(), new Date(childDateOfBirth));
  } else {
    ageMonths = differenceInMonths(new Date(selectedEvent.event_date), new Date(childDateOfBirth));
  }
  console.log('Calculated ageMonths:', ageMonths);

  // Simulate fetchGamesByEventAndAge which returns empty (remote no data)
  const gamesData = [];
  if (gamesData && gamesData.length > 0) {
    console.log('API returned games');
  } else {
    console.log('API returned empty - falling back');
    const selectedApiEvent = apiEvents.find(ev => ev.event_id === selectedEvent.event_id);
    if (selectedApiEvent) {
      const eligible = loadGamesForEvent(selectedApiEvent, ageMonths);
      console.log('Fallback eligible count', eligible.length, 'examples', eligible.slice(0,2));
    }
  }
}

// reuse loadGamesForEvent logic
function loadGamesForEvent(event, childAgeMonths) {
  if (!event.games_with_slots || event.games_with_slots.length === 0) { return [] }
  const eligibleSlots = event.games_with_slots.filter((slot) => {
    const rawMin = Number(slot.min_age || 0);
    const rawMax = Number(slot.max_age || 0);
    const minMonthsCandidate = rawMin;
    const maxMonthsCandidate = rawMax;
    const minMonthsFromYears = rawMin * 12;
    const maxMonthsFromYears = rawMax * 12;
    const isEligibleIfRawMonths = childAgeMonths >= minMonthsCandidate && childAgeMonths <= maxMonthsCandidate;
    const isEligibleIfYears = childAgeMonths >= minMonthsFromYears && childAgeMonths <= maxMonthsFromYears;
    return isEligibleIfRawMonths || isEligibleIfYears;
  });
  return eligibleSlots;
}

calculateAgeAndLoad();
