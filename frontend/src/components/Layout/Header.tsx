import React, { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
    const [userName, setUserName] = useState('John Doe');
    const [userRole, setUserRole] = useState('Manager');
    const [today, setToday] = useState('');

    useEffect(() => {
        // Get user from localStorage or API
        const user = localStorage.getItem('user');
        if (user) {
            const parsed = JSON.parse(user);
            setUserName(parsed.name || 'John Doe');
            setUserRole(parsed.role || 'Manager');
        }

        const now = new Date();
        setToday(now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;