import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class GlobalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <AlertTriangle size={64} color="var(--danger-color)" style={{ marginBottom: '1rem' }} />
                    <h1>Something went wrong.</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
