import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../../../types';
import styles from './QuickActions.module.scss';

interface QuickActionsProps {
  userRole?: UserRole; // Optional because user might be loading, but we usually render this when loaded
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  return (
    <section className={styles.root} aria-labelledby="quick-actions-title">
      <div className={styles.header}>
        <h2 id="quick-actions-title">Rychlé odkazy</h2>
      </div>
      <div className={styles.grid}>
        <Link to="/attendance" className={styles.link}>
          <span className={styles.linkIcon}>📊</span>
          <span>Moje docházka</span>
        </Link>
        <Link to="/profile" className={styles.link}>
          <span className={styles.linkIcon}>👤</span>
          <span>Můj profil</span>
        </Link>
        {(userRole === UserRole.MANAGER || userRole === UserRole.HR) && (
          <Link to="/departments" className={styles.link}>
            <span className={styles.linkIcon}>🏢</span>
            <span>Oddělení</span>
          </Link>
        )}
      </div>
    </section>
  );
};
