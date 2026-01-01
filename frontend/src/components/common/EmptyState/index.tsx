import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  message,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      
      {actionText && (actionLink || onAction) && (
        <div className={styles.action}>
          {actionLink ? (
            <Link to={actionLink}>
              <Button variant="primary">{actionText}</Button>
            </Link>
          ) : (
            <Button onClick={onAction} variant="primary">{actionText}</Button>
          )}
        </div>
      )}
    </div>
  );
};
