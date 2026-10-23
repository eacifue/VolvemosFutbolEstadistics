import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StateView } from './vaf/states';

interface State { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error de interfaz:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="vf-login-wrap">
        <StateView
          kind="error"
          title="Se nos cayó el balón"
          body="Algo falló al mostrar esta pantalla. Vuelve a intentarlo; si sigue pasando, avísale al admin."
          action="Reintentar"
          onAction={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
        />
      </div>
    );
  }
}
