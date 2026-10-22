import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glass = false,
  title,
  subtitle,
  headerAction,
  className = '',
  ...props
}) => {
  const interactiveClass = interactive ? 'card-interactive' : '';
  const glassClass = glass ? 'card-glass' : '';

  return (
    <div className={`card ${interactiveClass} ${glassClass} ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
