import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import EntryCard from './components/EntryCard.jsx';
import ExportMenu from './components/ExportMenu.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import PrintView from './components/PrintView.jsx';
import TotalBar from './components/TotalBar.jsx';
import { MoonIcon, SunIcon } from './components/icons.jsx';
import { useSchedule } from './hooks/useSchedule.js';
import { useTheme } from './hooks/useTheme.js';
import { createTimesheetPdf, downloadFile, sendByEmail } from './lib/export.js';
import { buildTimesheet } from './lib/timesheet.js';

function App() {
  const schedule = useSchedule();
  const { theme, toggleTheme } = useTheme();
  const sheet = buildTimesheet(schedule.entries, schedule.name);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Building the PDF as soon as the menu opens means it's ready when an option is tapped.
  // The share sheet only opens straight from a tap, so it can't wait on a slow build.
  const preparePdf = () => {
    pdfRef.current = createTimesheetPdf(sheet);
    pdfRef.current.catch(() => {}); // surfaced when an option actually uses it
  };

  const handleExport = async (action) => {
    if (action === 'print') {
      window.print();
      return;
    }
    setBusy(true);
    try {
      const pdf = await (pdfRef.current ?? createTimesheetPdf(sheet));
      if (action === 'pdf') {
        downloadFile(pdf, sheet.fileName);
      } else {
        await sendByEmail(sheet, pdf, {
          navigator,
          openUrl: (url) => {
            window.location.href = url;
          },
        });
      }
    } catch {
      setNotice("Couldn't create the PDF. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const clearSchedule = () => {
    schedule.clearEntries();
    setConfirmingClear(false);
    setNotice('Schedule cleared');
  };

  return (
    <>
      <div className="flex min-h-dvh flex-col print:hidden">
        <Header>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            aria-label="Clear schedule"
            className="h-11 rounded-full px-3 text-sm font-bold text-muted hover:bg-danger-soft hover:text-danger"
          >
            Clear<span className="hidden sm:inline"> schedule</span>
          </button>
          <ExportMenu disabled={sheet.rows.length === 0} busy={busy} onOpen={preparePdf} onSelect={handleExport} />
        </Header>

        <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-40">
          <label className="block">
            <span className="text-sm font-medium text-muted">Timesheet for</span>
            <input
              type="text"
              value={schedule.name}
              onChange={(e) => schedule.setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="mt-1 block w-full border-b-2 border-line bg-transparent pb-1 text-3xl font-extrabold tracking-tight placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </label>
          <p className="mt-3 text-muted">
            {sheet.rows.length > 0
              ? `${sheet.range}, ${sheet.rows.length} ${sheet.rows.length === 1 ? 'day' : 'days'} logged`
              : 'Enter a start and end time for each day you worked.'}
          </p>

          {schedule.entries.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {schedule.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onChange={(changes) => schedule.updateEntry(entry.id, changes)}
                  onRemove={() => schedule.removeEntry(entry.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border-2 border-dashed border-line p-8 text-center text-muted">
              No days yet. Tap <strong className="text-ink">Add day</strong> to log a shift.
            </p>
          )}
        </main>

        <TotalBar total={sheet.total} onAdd={schedule.addEntry}>
          <Footer />
        </TotalBar>
      </div>

      {notice && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-36 z-30 mx-auto max-w-sm rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-canvas shadow-lg print:hidden"
        >
          {notice}
        </p>
      )}

      <ConfirmDialog
        open={confirmingClear}
        title="Clear this schedule?"
        message="All the days you've entered will be removed from this device. Your name stays."
        confirmLabel="Clear schedule"
        onConfirm={clearSchedule}
        onCancel={() => setConfirmingClear(false)}
      />

      <PrintView sheet={sheet} />
    </>
  );
}

export default App;
