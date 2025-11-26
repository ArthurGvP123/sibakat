import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[40vh] grid place-items-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 max-w-xl">
            <div className="font-semibold mb-1">TERJADI KESALAHAN SAAT MERENDER.</div>
            <div className="text-xs">{String(this.state.error?.message ?? this.state.error)}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
