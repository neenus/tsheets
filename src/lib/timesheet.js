import { computeEntry, formatDuration, nextDate } from './time.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseDate = (date) => new Date(`${date}T00:00:00Z`);

export const formatDay = (date) => {
  const day = parseDate(date);
  return `${DAYS[day.getUTCDay()]}, ${MONTHS[day.getUTCMonth()]} ${day.getUTCDate()}`;
};

const formatMonthDay = (date) => {
  const day = parseDate(date);
  return `${MONTHS[day.getUTCMonth()]} ${day.getUTCDate()}`;
};

const formatClock = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const formatRange = (first, last) => {
  const firstYear = first.slice(0, 4);
  const lastYear = last.slice(0, 4);
  if (first === last) return `${formatMonthDay(first)}, ${firstYear}`;
  if (firstYear === lastYear) return `${formatMonthDay(first)} – ${formatMonthDay(last)}, ${lastYear}`;
  return `${formatMonthDay(first)}, ${firstYear} – ${formatMonthDay(last)}, ${lastYear}`;
};

const validEntries = (entries) =>
  entries
    .map((entry) => ({ entry, result: computeEntry(entry) }))
    .filter(({ result }) => result.status === 'ok');

export const totalMinutes = (entries) =>
  validEntries(entries).reduce((sum, { result }) => sum + result.minutes, 0);

// Everything the PDF, print view and email need, built from the valid entries only.
export const buildTimesheet = (entries, name) => {
  const valid = validEntries(entries).sort(
    (a, b) => a.entry.date.localeCompare(b.entry.date) || a.entry.start.localeCompare(b.entry.start),
  );
  const first = valid[0]?.entry.date;
  const last = valid.at(-1)?.entry.date;
  const breakTime = (entry) => Number(entry.breakMinutes) || 0;

  return {
    name: name.trim(),
    range: first ? formatRange(first, last) : '',
    fileName: first === last ? `timesheet-${first}.pdf` : `timesheet-${first}-to-${last}.pdf`,
    rows: valid.map(({ entry, result }) => ({
      date: formatDay(entry.date),
      start: formatClock(entry.start),
      end: formatClock(entry.end) + (result.overnight ? ' (+1 day)' : ''),
      break: breakTime(entry) ? `${breakTime(entry)} min` : '—',
      hours: formatDuration(result.minutes),
    })),
    total: formatDuration(valid.reduce((sum, { result }) => sum + result.minutes, 0)),
  };
};

export const timesheetTitle = (sheet) => (sheet.name ? `Timesheet – ${sheet.name}` : 'Timesheet');

export const timesheetText = (sheet) =>
  [
    timesheetTitle(sheet),
    sheet.range,
    '',
    ...sheet.rows.map((row) => {
      const breakText = row.break === '—' ? '' : `, break ${row.break}`;
      return `${row.date}: ${row.start} – ${row.end}${breakText} = ${row.hours}`;
    }),
    '',
    `Total: ${sheet.total}`,
  ].join('\n');

// crypto.randomUUID needs a secure context, which a plain-http LAN deploy isn't.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createEntry = (previous, today) => ({
  id: newId(),
  date: previous?.date ? nextDate(previous.date) : today,
  start: '',
  end: '',
  breakMinutes: '',
});

// Parses what was saved to localStorage; anything unexpected is treated as no saved schedule.
export const loadSchedule = (raw) => {
  try {
    const saved = JSON.parse(raw);
    if (typeof saved?.name === 'string' && Array.isArray(saved.entries)) return saved;
  } catch {
    // corrupt data falls through
  }
  return null;
};
