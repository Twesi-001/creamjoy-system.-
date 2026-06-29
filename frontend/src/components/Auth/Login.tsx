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
            // ✅ Professional error messages
            if (err.response?.status === 401) {
                setError('❌ Invalid email or password. Please check your credentials and try again.');
            } else if (err.response?.status === 403) {
                setError('🚫 Your account has been suspended. Please contact your administrator.');
            } else if (err.response?.status === 404) {
                setError('🔍 Account not found. Please check your email address or contact support.');
            } else if (err.response?.status === 500) {
                setError('⚠️ We\'re experiencing technical difficulties. Please try again in a few minutes.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('🌐 Unable to connect to the server. Please check your internet connection.');
            } else {
                setError('😕 Something went wrong. Please try again or contact support if the problem persists.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <span className="login-icon">🥛</span>
                    <h1 className="login-title">CreamJoy</h1>
                    <p className="login-subtitle">Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="login-help">
                        <p>Contact your administrator if you need assistance.</p>
                    </div>

                    <p className="login-footer">
                        CreamJoy Yoghurt - Staff Portal
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
