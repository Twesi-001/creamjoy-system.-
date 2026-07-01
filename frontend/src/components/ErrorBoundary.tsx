import { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

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

    private handleReload = (): void => {
        window.location.reload();
    };

    private handleGoToLogin = (): void => {
        window.location.href = '/login';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-boundary-box">
                        <div className="error-icon">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <h1 className="error-title">Unexpected Error</h1>
                        <p className="error-description">
                            We apologize for the inconvenience. Something unexpected went wrong.
                            Our team has been notified and is working on a fix.
                        </p>
                        {this.state.error && (
                            <div className="error-details">
                                <span className="error-details-label">Error Details</span>
                                <code className="error-message">
                                    {this.state.error.message || 'An unknown error occurred'}
                                </code>
                            </div>
                        )}
                        <div className="error-actions">
                            <button 
                                className="error-btn error-btn-primary"
                                onClick={this.handleReload}
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                                Reload Page
                            </button>
                            <button 
                                className="error-btn error-btn-secondary"
                                onClick={this.handleGoToLogin}
                            >
                                <i className="bi bi-box-arrow-in-right"></i>
                                Return to Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

