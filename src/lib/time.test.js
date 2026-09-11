import { describe, expect, test } from 'vitest';
import { computeEntry, formatDuration, nextDate } from './time.js';

const entry = (overrides) => ({ date: '2026-09-08', start: '09:00', end: '17:00', breakMinutes: '', ...overrides });

describe('computeEntry', () => {
  test('counts minutes between start and end', () => {
    expect(computeEntry(entry())).toEqual({ status: 'ok', minutes: 480, overnight: false });
  });

  test('subtracts the break', () => {
    expect(computeEntry(entry({ breakMinutes: '30' })).minutes).toBe(450);
  });

  test('treats an end time before the start as the next day', () => {
    expect(computeEntry(entry({ start: '22:00', end: '06:00' }))).toEqual({ status: 'ok', minutes: 480, overnight: true });
  });

  test('is incomplete until date, start and end are all set', () => {
    expect(computeEntry(entry({ date: '' })).status).toBe('incomplete');
    expect(computeEntry(entry({ start: '' })).status).toBe('incomplete');
    expect(computeEntry(entry({ end: '' })).status).toBe('incomplete');
  });

  test('rejects an end time equal to the start', () => {
    expect(computeEntry(entry({ end: '09:00' }))).toEqual({ status: 'invalid', error: 'End time is the same as start time' });
  });

  test('rejects a break as long as the shift', () => {
    expect(computeEntry(entry({ breakMinutes: '480' }))).toEqual({ status: 'invalid', error: 'Break is longer than the shift' });
  });

  test('rejects a negative break', () => {
    expect(computeEntry(entry({ breakMinutes: '-5' }))).toEqual({ status: 'invalid', error: "Break can't be negative" });
  });
});

describe('formatDuration', () => {
  test.each([
    [450, '7h 30m'],
    [480, '8h'],
    [45, '45m'],
    [0, '0h'],
    [1965, '32h 45m'],
  ])('%i minutes → %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});

describe('nextDate', () => {
  test('returns the following day', () => {
    expect(nextDate('2026-09-08')).toBe('2026-09-09');
  });

  test('rolls over months and years', () => {
    expect(nextDate('2026-02-28')).toBe('2026-03-01');
    expect(nextDate('2026-12-31')).toBe('2027-01-01');
  });

  test('crosses the DST change without skipping a day', () => {
    expect(nextDate('2026-11-01')).toBe('2026-11-02');
    expect(nextDate('2026-03-08')).toBe('2026-03-09');
  });
});
