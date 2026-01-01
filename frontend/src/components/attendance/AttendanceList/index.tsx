import React from 'react'
import { Attendance } from '../../../types'
import { Badge } from '../../common/Badge'
import { EmptyState } from '../../common/EmptyState'
import styles from './AttendanceList.module.scss'

interface AttendanceListProps {
  records: Attendance[];
}

export const AttendanceList: React.FC<AttendanceListProps> = ({ records }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateHours = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return '-';
    const hours = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 3600000;
    return `${Math.round(hours * 100) / 100}h`;
  };

  if (records.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Žádné záznamy"
        message="Za vybrané období nebyly nalezeny žádné záznamy o docházce."
      />
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table} aria-label="Záznamy o docházce">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Příchod</th>
            <th>Odchod</th>
            <th>Odpracováno</th>
            <th>Směna</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{formatDate(record.clockIn)}</td>
              <td>{formatTime(record.clockIn)}</td>
              <td>
                {record.clockOut ? (
                  formatTime(record.clockOut)
                ) : (
                  <Badge variant="warning">Aktivní</Badge>
                )}
              </td>
              <td>{calculateHours(record.clockIn, record.clockOut)}</td>
              <td>{record.shift?.title || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
