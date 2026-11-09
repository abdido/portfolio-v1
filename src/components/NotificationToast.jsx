import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const NotificationToast = () => {
  const { toast } = usePortfolio();

  if (!toast) return null;

  return (
    <div className="toast-container" role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
      <div className={`toast ${toast.type}`}>
        {toast.type === 'error' ? (
          <AlertCircle size={20} className="text-danger" />
        ) : toast.type === 'info' ? (
          <Info size={20} className="text-accent" />
        ) : (
          <CheckCircle2 size={20} className="text-success" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default NotificationToast;
