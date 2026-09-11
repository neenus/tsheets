const MINUTES_PER_DAY = 24 * 60;

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Works out the minutes worked for one entry.
// Returns { status: 'ok', minutes, overnight }, { status: 'invalid', error } or { status: 'incomplete' }.
export const computeEntry = ({ date, start, end, breakMinutes }) => {
  if (!date || !start || !end) return { status: 'incomplete' };

  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes === endMinutes) {
    return { status: 'invalid', error: 'End time is the same as start time' };
  }

  const breakTime = Number(breakMinutes) || 0;
  if (breakTime < 0) return { status: 'invalid', error: "Break can't be negative" };

  const overnight = endMinutes < startMinutes;
  const shift = endMinutes - startMinutes + (overnight ? MINUTES_PER_DAY : 0);
  if (breakTime >= shift) return { status: 'invalid', error: 'Break is longer than the shift' };

  return { status: 'ok', minutes: shift - breakTime, overnight };
};

export const formatDuration = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  return minutes ? `${minutes}m` : `${hours}h`;
};

// Dates are "YYYY-MM-DD" strings (what <input type="date"> uses). UTC keeps DST out of it.
export const nextDate = (date) => {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
};
