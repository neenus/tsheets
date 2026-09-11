import { PlusIcon } from './icons.jsx';

// Pinned to the bottom of the screen, within thumb reach on phones.
const TotalBar = ({ total, onAdd, children }) => (
  <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg print:hidden">
    <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-muted">Total hours</p>
        <p className="text-3xl leading-tight font-extrabold tracking-tight tabular-nums" aria-live="polite">
          {total}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-on-accent shadow-lg shadow-accent/25 active:scale-[0.98]"
      >
        <PlusIcon />
        Add day
      </button>
    </div>
    {children}
  </div>
);

export default TotalBar;
