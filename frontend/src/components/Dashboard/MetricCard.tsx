import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    /** A Bootstrap Icon class name, e.g. "bi bi-factory" */
    icon: string;
    /** Optional icon to display where the title normally appears */
    titleIcon?: string;
    color?: 'primary' | 'warning' | 'danger' | 'info' | 'success' | 'secondary';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    titleIcon,
    color = 'primary'
}) => {
    return (
        <div className={`metric-card metric-${color}`}>
            <div className="metric-icon">
                <i className={icon} aria-hidden="true"></i>
            </div>
            <div className="metric-body">
                <span className="metric-value">{value}</span>
                <span className="metric-title">
                    {titleIcon && <i className={`metric-title-icon ${titleIcon}`} aria-hidden="true"></i>}
                    <span className="metric-title-text">{title}</span>
                </span>
            </div>
        </div>
    );
};

export default MetricCard;