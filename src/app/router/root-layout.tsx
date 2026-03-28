import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Outlet } from '@tanstack/react-router';

export function RootLayout() {
  return (
    <RouteErrorBoundary>
      <Outlet />
    </RouteErrorBoundary>
  );
}

class RouteErrorBoundary extends Component<
  { children: ReactNode },
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
        <p className="error-copy">
          Something went wrong. Reload the page.
        </p>
      );
    }

    return this.props.children;
  }
}
