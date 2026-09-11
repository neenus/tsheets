import { computeEntry, formatDuration } from '../lib/time.js';
import { formatDay } from '../lib/timesheet.js';
import { CalendarIcon, TrashIcon } from './icons.jsx';

const inputClass =
  'block h-12 w-full min-w-0 rounded-xl border border-line bg-canvas px-3 text-base tabular-nums text-ink ' +
  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger';

const Field = ({ label, badge, children }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-muted">
      {label}
      {badge}
    </span>
    {children}
  </label>
);

const EntryCard = ({ entry, onChange, onRemove }) => {
  const result = computeEntry(entry);
  const invalid = result.status === 'invalid';
  const dayLabel = entry.date ? formatDay(entry.date) : 'Pick a date';
  const errorId = `${entry.id}-error`;

  return (
    <li className="rounded-2xl bg-surface p-4 shadow-[0_1px_2px_rgb(27_30_44/0.06)] ring-1 ring-line">
      <div className="mb-3 flex items-center gap-3">
        {/* The native date input sits invisibly over the heading so tapping it opens the phone's picker */}
        <div className="relative -mx-2 flex min-h-11 flex-1 items-center gap-2 rounded-lg px-2 focus-within:outline-2 focus-within:outline-accent">
          <CalendarIcon className="size-5 text-accent" />
          <span className={`text-lg font-bold ${entry.date ? '' : 'text-muted'}`}>{dayLabel}</span>
          <input
            type="date"
            aria-label="Date"
            value={entry.date}
            onChange={(e) => onChange({ date: e.target.value })}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${dayLabel}`}
          className="-mr-2 grid size-11 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_7rem_6rem]">
        <Field label="Start">
          <input
            type="time"
            value={entry.start}
            onChange={(e) => onChange({ start: e.target.value })}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className={inputClass}
          />
        </Field>
        <Field
          label="End"
          badge={
            result.overnight && (
              <span className="rounded-full bg-accent-soft px-2 text-xs font-semibold text-accent">+1 day</span>
            )
          }
        >
          <input
            type="time"
            value={entry.end}
            onChange={(e) => onChange({ end: e.target.value })}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Break (min)">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="5"
            placeholder="0"
            value={entry.breakMinutes}
            onChange={(e) => onChange({ breakMinutes: e.target.value })}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className={inputClass}
          />
        </Field>
        <div className="flex flex-col items-end justify-end text-right">
          <span className="mb-1.5 text-sm font-medium text-muted">Hours</span>
          <span
            className={`flex h-12 items-center text-2xl font-extrabold tracking-tight tabular-nums ${
              result.status === 'ok' ? 'text-accent' : 'text-muted/60'
            }`}
          >
            {result.status === 'ok' ? formatDuration(result.minutes) : '–'}
          </span>
        </div>
      </div>

      {invalid && (
        <p id={errorId} className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {result.error}
        </p>
      )}
    </li>
  );
};

export default EntryCard;
