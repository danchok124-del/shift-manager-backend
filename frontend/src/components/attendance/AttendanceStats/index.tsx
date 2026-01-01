import React from 'react';
import styles from './AttendanceStats.module.scss';

interface AttendanceStatsProps {
  monthName: string;
  year: number;
  totalHours: number;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  monthName,
  year,
  totalHours,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <h2>Výkaz práce</h2>
        <p>{monthName} {year}</p>
      </div>
      <div className={styles.total}>
        <span className={styles.totalLabel}>Celkem odpracováno</span>
        <span className={styles.totalValue}>{totalHours}h</span>
      </div>
    </div>
  );
};
