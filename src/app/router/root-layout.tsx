import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Outlet } from '@tanstack/react-router';
import { useI18n } from '@/shared/i18n/i18n-provider';

export function RootLayout() {
  const { t } = useI18n();

  return (
    <>
      <RouteErrorBoundary
        fallbackText={t('error.rootFallback')}
      >
        <Outlet />
      </RouteErrorBoundary>
    </>
  );
}

class RouteErrorBoundary extends Component<
  {
    children: ReactNode;
    fallbackText: string;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="m-0 text-danger text-[0.92rem] font-bold">
          {this.props.fallbackText}
        </p>
      );
    }

    return this.props.children;
  }
}
