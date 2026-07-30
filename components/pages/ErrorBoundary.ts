import { cloneElement, Component } from "react";
import { isDev } from "utils/functions";

const RELOAD_COUNT_KEY = "pyhdra-error-reloads";
const MAX_RELOADS = 3;

type ErrorBoundaryProps = {
  FallbackRender?: React.ReactNode;
  onError?: (error: Error) => void;
};

type ErrorBoundaryState = {
  error?: Error;
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  React.PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  public constructor(props: React.PropsWithChildren<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  public override componentDidMount(): void {
    try {
      sessionStorage.removeItem(RELOAD_COUNT_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  public override shouldComponentUpdate(
    _nextProps: React.PropsWithChildren<ErrorBoundaryProps>,
    nextState: ErrorBoundaryState
  ): boolean {
    const { hasError } = this.state;
    return hasError !== nextState.hasError;
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  public override componentDidCatch(error: Error): void {
    const { onError, FallbackRender } = this.props;
    onError?.(error);

    if (!FallbackRender && !isDev()) {
      try {
        const count = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || "0");
        if (count < MAX_RELOADS) {
          sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
          localStorage.removeItem("pyhdra-os-booted");
          window.location.reload();
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  private resetError = (): void => {
    this.setState({ error: undefined, hasError: false });
  };

  public override render(): React.ReactNode {
    const {
      props: { children, FallbackRender },
      state: { hasError, error },
    } = this;

    if (hasError && FallbackRender) {
      return cloneElement(
        FallbackRender as React.ReactElement<{ error?: Error; onRetry?: () => void }>,
        { error, onRetry: this.resetError }
      );
    }

    if (hasError) {
      return undefined;
    }

    return children;
  }
}
