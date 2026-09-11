import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, FileIcon, MailIcon, PrinterIcon, ShareIcon } from './icons.jsx';

const OPTIONS = [
  { action: 'pdf', label: 'Save as PDF', Icon: FileIcon },
  { action: 'email', label: 'Send to email', Icon: MailIcon },
  { action: 'print', label: 'Print', Icon: PrinterIcon },
];

const ExportMenu = ({ disabled, busy, onOpen, onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);

  const close = ({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const toggle = () => {
    if (!open) onOpen();
    setOpen(!open);
  };

  const onMenuKeyDown = (e) => {
    const items = itemRefs.current;
    const index = items.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close({ restoreFocus: true });
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        title={disabled ? 'Complete at least one day to export' : undefined}
        className="flex h-11 items-center gap-1.5 rounded-full bg-accent pr-3 pl-4 text-sm font-bold text-on-accent disabled:opacity-40"
      >
        <ShareIcon className="size-4" />
        {busy ? 'Preparing…' : 'Export'}
        <ChevronDownIcon className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Export timesheet"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-2xl bg-surface p-1.5 shadow-xl ring-1 ring-line motion-safe:animate-[menu-in_120ms_ease-out]"
        >
          {OPTIONS.map(({ action, label, Icon }, i) => (
            <li key={action} role="none">
              <button
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                role="menuitem"
                onClick={() => {
                  close({ restoreFocus: true });
                  onSelect(action);
                }}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold hover:bg-accent-soft focus:bg-accent-soft focus:outline-none"
              >
                <Icon className="size-5 text-accent" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExportMenu;
