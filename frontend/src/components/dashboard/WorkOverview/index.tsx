import React from 'react';
import styles from './WorkOverview.module.scss';

interface WorkOverviewProps {
  stats: {
    totalHours: number;
    shiftsThisWeek: number;
  };
}

export const WorkOverview: React.FC<WorkOverviewProps> = ({ stats }) => {
  return (
    <div className={styles.stats}>
      <div className={styles.card}>
        <span className={styles.cardValue}>{stats.shiftsThisWeek}</span>
        <span className={styles.cardLabel}>Směn tento týden</span>
      </div>
      <div className={styles.card}>
        <span className={styles.cardValue}>{stats.totalHours}h</span>
        <span className={styles.cardLabel}>Odpracováno tento měsíc</span>
      </div>
    </div>
  );
};
