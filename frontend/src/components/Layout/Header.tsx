
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const [userName, setUserName] = useState('John Doe');
    const [userRole, setUserRole] = useState('Manager');
    const [today, setToday] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Get user from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setUserName(parsed.name || 'John Doe');
                setUserRole(parsed.role || 'Manager');
            } catch (e) {
                console.error('Error parsing user:', e);
            }
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
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Navigate to login using React Router
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
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
