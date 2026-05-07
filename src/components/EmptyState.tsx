import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-xl font-display font-black uppercase tracking-tight text-gray-400">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-600 mt-2 max-w-xs">{description}</p>
      )}
      {actionLabel && (
        actionHref ? (
          <Link
            to={actionHref}
            className="mt-6 px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-6 px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform"
          >
            {actionLabel}
          </button>
        )
      )}
    </motion.div>
  );
}

export function LoadingState({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{text}</p>
    </div>
  );
}

export function ErrorState({ 
  message = 'Une erreur est survenue', 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-display font-black uppercase text-brand-red">
        Erreur
      </h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}