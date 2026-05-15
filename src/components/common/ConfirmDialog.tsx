import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'warning',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-8 h-8 text-brand-red" />,
      bg: 'bg-brand-red/10',
      confirmBg: 'bg-brand-red',
      confirmHover: 'hover:bg-brand-red/90',
    },
    warning: {
      icon: <AlertTriangle className="w-8 h-8 text-brand-gold" />,
      bg: 'bg-brand-gold/10',
      confirmBg: 'bg-brand-gold',
      confirmHover: 'hover:bg-brand-gold/90',
    },
    info: {
      icon: <CheckCircle className="w-8 h-8 text-brand-green" />,
      bg: 'bg-brand-green/10',
      confirmBg: 'bg-brand-green',
      confirmHover: 'hover:bg-brand-green/90',
    },
  };

  const style = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card w-full max-w-md p-8 relative z-10 space-y-6"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 ${style.bg} rounded-full flex items-center justify-center mx-auto`}>
              {style.icon}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-display font-black">{title}</h3>
              <p className="text-sm text-gray-400">{message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 ${style.confirmBg} text-brand-black rounded-xl font-black uppercase tracking-wider text-sm ${style.confirmHover} transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
