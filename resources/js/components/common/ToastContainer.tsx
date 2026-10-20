import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    error: 'border-rose-200 bg-rose-50 text-rose-950',
    info: 'border-indigo-200 bg-indigo-50 text-indigo-950'
  };

  return (
    <div
      id="global-toast-notification"
      className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div
        className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-sm ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 pr-2">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">{toast.title}</p>
          <p className="text-sm font-medium mt-0.5 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
