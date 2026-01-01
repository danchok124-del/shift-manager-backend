import React from 'react';
import { Link } from 'react-router-dom';
import { Shift } from '../../../types';
import { Button } from '../../common/Button';
import styles from './ScheduleView.module.scss';

interface ScheduleViewProps {
  shifts: Shift[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ shifts }) => {
  // We need specific formatting not provided by formatDateTime directly as it does full string.
  // But we can reuse helpers if appropriate or keep local formatters.
  // formatDateTime is "weekday, day. month. year time".
  // Here we split day and time. Functional duplication is acceptable for specific UI needs,
  // or we can export date/time formatters from utils.
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <h2>Nadcházející směny</h2>
        <Link to="/shifts" style={{ textDecoration: 'none' }}>
           <Button variant="outline" size="sm">Všechny směny</Button>
        </Link>
      </div>
      
      {shifts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nemáte žádné naplánované směny</p>
          <Link to="/shifts" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Prohlédnout směny</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {shifts.slice(0, 5).map((shift) => (
            <Link key={shift.id} to={`/shifts/${shift.id}`} className={styles.item}>
              <div className={styles.date}>
                <span className={styles.day}>{formatDate(shift.startTime)}</span>
                <span className={styles.time}>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </span>
              </div>
              <div className={styles.info}>
                <span className={styles.title}>{shift.title}</span>
                {shift.department && (
                  <span className={styles.dept}>{shift.department.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
