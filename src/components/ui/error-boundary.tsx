"use client";

import { useRouter } from "next/navigation";
import { Component, ErrorInfo, startTransition, type ReactNode } from "react";
import { ErrorState } from "./error-state";

type ErrorBoundaryProps = {
  /** Texto para el usuario. No se muestra `error.message`: en producción Next lo oculta. */
  message: string;
  children: ReactNode;
};

export function ErrorBoundary({ message, children }: ErrorBoundaryProps) {
  const router = useRouter();

  return (
    <Boundary
      message={message}
      // Los Server Components hijos solo se vuelven a ejecutar si se refresca
      // la ruta; reset() limpia el estado de error del boundary.
      onRetry={(reset) =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
    >
      {children}
    </Boundary>
  );
}

type BoundaryProps = {
  message: string;
  onRetry: (reset: () => void) => void;
  children: ReactNode;
};

type BoundaryState = {
  hasError: boolean;
};

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error capturado:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message={this.props.message}
          onRetry={() => this.props.onRetry(this.reset)}
        />
      );
    }

    return this.props.children;
  }
}
