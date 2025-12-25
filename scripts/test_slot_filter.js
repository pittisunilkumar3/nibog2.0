const { differenceInMonths } = require('date-fns');
const fs = require('fs');

const raw = fs.readFileSync('booking_info_clean.json','utf8');
const data = JSON.parse(raw);
const event = data.data[0].events[0];
const eventDate = new Date(event.event_date);

function testDob(dobStr) {
  const dob = new Date(dobStr);
  const ageMonths = differenceInMonths(eventDate, dob);
  console.log('---');
  console.log('EventDate:', event.event_date);
  console.log('DOB:', dobStr);
  console.log('Age (months):', ageMonths);
  console.log('Slots:');
  event.games_with_slots.forEach(s=>{
    const rawMin = Number(s.min_age||0);
    const rawMax = Number(s.max_age||0);
    const isEligibleMonths = ageMonths >= rawMin && ageMonths <= rawMax;
    const isEligibleYears = ageMonths >= rawMin*12 && ageMonths <= rawMax*12;
    console.log({slot_id:s.slot_id, game_name:s.game_name, rawMin, rawMax, isEligibleMonths, isEligibleYears});
  })
}

// Test DOBs
// DOB that should be ~23 months at event date (2026-11-23) -> 2024-12-23
testDob('2024-12-23');
// Test a few more
testDob('2023-11-23');
testDob('2025-12-23');
