import { describe, expect, test } from 'vitest';
import { createTimesheetPdf, sendByEmail } from './export.js';
import { buildTimesheet } from './timesheet.js';

const sheet = buildTimesheet(
  [{ id: '1', date: '2026-09-08', start: '09:00', end: '17:00', breakMinutes: '30' }],
  'Jane Doe',
);

describe('createTimesheetPdf', () => {
  test('produces a PDF containing the name, rows and total', async () => {
    const blob = await createTimesheetPdf(sheet);
    const content = await blob.text();

    expect(blob.type).toBe('application/pdf');
    expect(content.startsWith('%PDF')).toBe(true);
    for (const text of ['Jane Doe', 'Sep 8, 2026', 'Tue, Sep 8', '9:00 AM', '7h 30m']) {
      expect(content).toContain(text);
    }
  });
});

describe('sendByEmail', () => {
  const pdf = new Blob(['%PDF'], { type: 'application/pdf' });

  const fakeNavigator = ({ canShareFiles, shareError } = {}) => {
    const shared = [];
    return {
      shared,
      canShare: ({ files }) => canShareFiles && files.every((file) => file instanceof File),
      share: async (data) => {
        if (shareError) throw shareError;
        shared.push(data);
      },
    };
  };

  test('shares the PDF through the share sheet when files can be shared', async () => {
    const nav = fakeNavigator({ canShareFiles: true });
    const opened = [];

    await sendByEmail(sheet, pdf, { navigator: nav, openUrl: (url) => opened.push(url) });

    expect(opened).toEqual([]);
    expect(nav.shared).toHaveLength(1);
    const [{ files, title, text }] = nav.shared;
    expect(files[0].name).toBe('timesheet-2026-09-08.pdf');
    expect(files[0].type).toBe('application/pdf');
    expect(title).toBe('Timesheet – Jane Doe – Sep 8, 2026');
    expect(text).toContain('Total: 7h 30m');
  });

  test('opens a mail draft with the text version when files cannot be shared', async () => {
    const opened = [];

    await sendByEmail(sheet, pdf, { navigator: {}, openUrl: (url) => opened.push(url) });

    expect(opened).toHaveLength(1);
    const url = new URL(opened[0]);
    expect(url.protocol).toBe('mailto:');
    expect(url.searchParams.get('subject')).toBe('Timesheet – Jane Doe – Sep 8, 2026');
    expect(url.searchParams.get('body')).toContain('Total: 7h 30m');
  });

  test('does nothing more when the user cancels the share sheet', async () => {
    const cancelled = new DOMException('cancelled', 'AbortError');
    const opened = [];

    await sendByEmail(sheet, pdf, {
      navigator: fakeNavigator({ canShareFiles: true, shareError: cancelled }),
      openUrl: (url) => opened.push(url),
    });

    expect(opened).toEqual([]);
  });

  test('falls back to a mail draft when sharing fails', async () => {
    const opened = [];

    await sendByEmail(sheet, pdf, {
      navigator: fakeNavigator({ canShareFiles: true, shareError: new DOMException('denied', 'NotAllowedError') }),
      openUrl: (url) => opened.push(url),
    });

    expect(opened).toHaveLength(1);
  });
});
