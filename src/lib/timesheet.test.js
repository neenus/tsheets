import { describe, expect, test } from 'vitest';
import { buildTimesheet, createEntry, loadSchedule, timesheetText, totalMinutes } from './timesheet.js';

const entry = (overrides) => ({ id: '1', date: '2026-09-08', start: '09:00', end: '17:00', breakMinutes: '30', ...overrides });

describe('totalMinutes', () => {
  test('adds up valid entries and skips incomplete or invalid ones', () => {
    const entries = [
      entry(),
      entry({ id: '2', start: '22:00', end: '06:00', breakMinutes: '' }),
      entry({ id: '3', end: '' }),
      entry({ id: '4', end: '09:00' }),
    ];
    expect(totalMinutes(entries)).toBe(450 + 480);
  });
});

describe('buildTimesheet', () => {
  test('lists valid entries in date order with readable values', () => {
    const sheet = buildTimesheet(
      [
        entry({ id: '2', date: '2026-09-09', start: '22:00', end: '06:00', breakMinutes: '' }),
        entry(),
        entry({ id: '3', date: '' }),
      ],
      '  Jane Doe ',
    );

    expect(sheet.name).toBe('Jane Doe');
    expect(sheet.rows).toEqual([
      { date: 'Tue, Sep 8', start: '9:00 AM', end: '5:00 PM', break: '30 min', hours: '7h 30m' },
      { date: 'Wed, Sep 9', start: '10:00 PM', end: '6:00 AM (+1 day)', break: '—', hours: '8h' },
    ]);
    expect(sheet.total).toBe('15h 30m');
  });

  test('describes the date range and names the file after it', () => {
    const sheet = buildTimesheet([entry({ date: '2026-09-12' }), entry({ id: '2', date: '2026-09-08' })], '');
    expect(sheet.range).toBe('Sep 8 – Sep 12, 2026');
    expect(sheet.fileName).toBe('timesheet-2026-09-08-to-2026-09-12.pdf');
  });

  test('shows a single day without a range', () => {
    const sheet = buildTimesheet([entry()], '');
    expect(sheet.range).toBe('Sep 8, 2026');
    expect(sheet.fileName).toBe('timesheet-2026-09-08.pdf');
  });

  test('includes both years when the range crosses New Year', () => {
    const sheet = buildTimesheet([entry({ date: '2025-12-30' }), entry({ id: '2', date: '2026-01-02' })], '');
    expect(sheet.range).toBe('Dec 30, 2025 – Jan 2, 2026');
  });

  test('formats noon and midnight in 12-hour time', () => {
    const sheet = buildTimesheet([entry({ start: '00:00', end: '12:00', breakMinutes: '' })], '');
    expect(sheet.rows[0]).toMatchObject({ start: '12:00 AM', end: '12:00 PM' });
  });
});

describe('timesheetText', () => {
  test('renders a plain-text version for email bodies', () => {
    const sheet = buildTimesheet([entry()], 'Jane Doe');
    expect(timesheetText(sheet)).toBe(
      ['Timesheet – Jane Doe', 'Sep 8, 2026', '', 'Tue, Sep 8: 9:00 AM – 5:00 PM, break 30 min = 7h 30m', '', 'Total: 7h 30m'].join('\n'),
    );
  });

  test('leaves the name out of the heading when there is none', () => {
    const sheet = buildTimesheet([entry()], '');
    expect(timesheetText(sheet).split('\n')[0]).toBe('Timesheet');
  });
});

describe('createEntry', () => {
  test('starts on the day after the previous entry', () => {
    expect(createEntry(entry({ date: '2026-09-11' }), '2026-09-01')).toMatchObject({
      date: '2026-09-12',
      start: '',
      end: '',
      breakMinutes: '',
    });
  });

  test('uses today when there is no dated previous entry', () => {
    expect(createEntry(undefined, '2026-09-01').date).toBe('2026-09-01');
    expect(createEntry(entry({ date: '' }), '2026-09-01').date).toBe('2026-09-01');
  });

  test('gives each entry a distinct id', () => {
    expect(createEntry(undefined, '2026-09-01').id).not.toBe(createEntry(undefined, '2026-09-01').id);
  });
});

describe('loadSchedule', () => {
  test('restores a saved schedule', () => {
    const saved = { name: 'Jane', entries: [entry()] };
    expect(loadSchedule(JSON.stringify(saved))).toEqual(saved);
  });

  test('returns null for missing or corrupt data', () => {
    expect(loadSchedule(null)).toBeNull();
    expect(loadSchedule('{not json')).toBeNull();
    expect(loadSchedule(JSON.stringify({ name: 'Jane', entries: 'nope' }))).toBeNull();
  });
});
