import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface User {
    name: string;
    role: string;
}

const Header: React.FC = () => {
    const [userName, setUserName] = useState<string>('John Doe');
    const [userRole, setUserRole] = useState<string>('Manager');
    const [today, setToday] = useState<string>('');
    const navigate = useNavigate();
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        // ✅ Only run if component is mounted
        if (!isMounted.current) return;

        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const parsed: User = JSON.parse(userStr);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUserName(parsed.name || 'John Doe');
                setUserRole(parsed.role || 'Manager');
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }

        // Set date
        const now = new Date();
        setToday(now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));

        // Cleanup
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleLogout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-logo">🥛 CreamJoy</h1>
            </div>
            <div className="header-center">
                <span className="header-date">{today}</span>
            </div>
            <div className="header-right">
                <div className="header-user">
                    <span className="user-name">{userName}</span>
                    <span className={`user-role role-${userRole.toLowerCase()}`}>
                        {userRole}
                    </span>
                </div>
                <button className="change-password-btn" onClick={() => navigate('/change-password')}>
                    🔑 Change Password
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;