import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-sm animate-slide-up rounded-xl border border-white/[0.08] bg-obsidian p-5 shadow-2xl"
        style={{ boxShadow: '0 0 40px 0 rgba(99,102,241,0.12)' }}
      >
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
              isDanger ? 'bg-rose-500/15 text-rose-400' : 'bg-violet-500/15 text-violet-400'
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h2 id="confirm-title" className="font-display text-sm font-bold text-white">
              {title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.98] ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-violet-600 hover:bg-violet-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
