import  { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    flexDirection: 'column',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        padding: '40px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>😅</span>
                        <h2 style={{ color: '#1A1A1A', margin: '0 0 8px 0' }}>Oops! Something went wrong</h2>
                        <p style={{ color: '#555', margin: '0 0 20px 0' }}>
                            We're sorry, but something unexpected happened. Our team has been notified.
                        </p>
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>
                            Error: {this.state.error?.message || 'Unknown error'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#1D9E75',
                                color: 'white',
                                border: 'none',
                                padding: '10px 30px',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginTop: '16px'
                            }}
                        >
                            🔄 Reload Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/login'}
                            style={{
                                background: 'transparent',
                                color: '#1D9E75',
                                border: '2px solid #1D9E75',
                                padding: '10px 30px',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginTop: '12px',
                                marginLeft: '10px'
                            }}
                        >
                            🔐 Go to Login
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;