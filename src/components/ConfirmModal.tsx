import React from 'react';
import { X } from 'lucide-react';

export const ConfirmModal: React.FC<{
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0b0b0d] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div>
            <h4 className="text-sm font-mono font-bold text-zinc-200">{title || 'Confirm'}</h4>
          </div>
          <button onClick={onCancel} className="p-2 rounded border border-zinc-800 text-zinc-300"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 text-[13px] text-zinc-300">
          <p>{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-800">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border border-zinc-800 text-zinc-200">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-md bg-[#FF6B00] text-black font-bold">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
