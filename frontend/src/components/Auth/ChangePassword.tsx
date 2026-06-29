import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../api/api';
import './ChangePassword.css';

// ✅ Define error response type
interface ApiError {
    response?: {
        data?: {
            error?: string;
        };
        status?: number;
    };
    message?: string;
}

const ChangePassword: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await AuthAPI.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: unknown) {
            // ✅ Proper error handling without 'any'
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as ApiError;
                setError(apiError.response?.data?.error || 'Failed to change password');
            } else if (err instanceof Error) {
                setError(err.message || 'Failed to change password');
            } else {
                setError('Failed to change password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-box">
                <h2>🔐 Change Password</h2>
                <p className="subtitle">Update your password to keep your account secure</p>

                <form onSubmit={handleSubmit} className="change-password-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;