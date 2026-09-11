import { useEffect, useRef } from 'react';

// A native <dialog> so focus trapping, Escape and the backdrop come from the browser.
const ConfirmDialog = ({ open, title, message, confirmLabel, onConfirm, onCancel }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => e.target === dialogRef.current && onCancel()}
      aria-labelledby="confirm-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-surface p-6 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <h2 id="confirm-title" className="text-xl font-extrabold">
        {title}
      </h2>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="h-12 rounded-full px-5 font-bold text-ink ring-1 ring-line hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-12 rounded-full bg-danger px-5 font-bold text-surface hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
