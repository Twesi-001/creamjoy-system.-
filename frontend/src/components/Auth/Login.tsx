import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../api/api';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await AuthAPI.login(email, password);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('user-updated'));
            navigate('/');
        } catch (err: any) {
            // Professional, company-appropriate error messages.
            // The user stays on the login page; no redirect occurs on failure.
            if (err.response?.status === 401) {
                setError('Invalid email or password. Please check your credentials and try again.');
            } else if (err.response?.status === 403) {
                setError('Your account has been suspended. Please contact your system administrator.');
            } else if (err.response?.status === 404) {
                setError('No account was found with this email address. Please contact support.');
            } else if (err.response?.status === 500) {
                setError('We are experiencing a technical issue. Please try again in a few minutes.');
            } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
                setError('Unable to reach the server. Please check your internet connection and try again.');
            } else {
                setError('Something went wrong while signing in. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <span className="login-icon" aria-hidden="true">
                        <i className="bi bi-shield-lock"></i>
                    </span>
                    <h1 className="login-title">CreamJoy</h1>
                    <p className="login-subtitle">Staff Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {error && (
                        <div className="login-error" role="alert" aria-live="polite">
                            <i className="bi bi-exclamation-circle error-icon" aria-hidden="true"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-with-icon">
                            <i className="bi bi-envelope input-icon" aria-hidden="true"></i>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@creamjoy.com"
                                autoComplete="username"
                                required
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <i className="bi bi-lock input-icon" aria-hidden="true"></i>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>

                    <div className="login-help">
                        <p>
                            <i className="bi bi-info-circle" aria-hidden="true"></i>
                            Contact your administrator if you need assistance accessing your account.
                        </p>
                    </div>

                    <p className="login-footer">
                        <i className="bi bi-building" aria-hidden="true"></i>
                        CreamJoy Yoghurt &mdash; Staff Portal
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;