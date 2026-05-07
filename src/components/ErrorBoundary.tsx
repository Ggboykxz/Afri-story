import React, { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-brand-red" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-black uppercase">Oups !</h1>
            <p className="text-gray-500 max-w-md">
              Quelque chose s'est mal passé. Veuillez réessayer.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-black uppercase text-xs tracking-widest"
            >
              <Home className="w-4 h-4" /> Accueil
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}