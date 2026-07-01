import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-box">
                <div className="not-found-icon">
                    <i className="bi bi-compass"></i>
                </div>
                <h1 className="not-found-code">404</h1>
                <h2 className="not-found-title">Page Not Found</h2>
                <p className="not-found-description">
                    The page you are looking for does not exist or has been moved.
                    Please check the URL or navigate to one of the pages below.
                </p>
                <div className="not-found-actions">
                    <Link to="/" className="not-found-btn not-found-btn-primary">
                        <i className="bi bi-speedometer2"></i>
                        Go to Dashboard
                    </Link>
                    <Link to="/login" className="not-found-btn not-found-btn-secondary">
                        <i className="bi bi-box-arrow-in-right"></i>
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

