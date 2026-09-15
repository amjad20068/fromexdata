import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/30 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
