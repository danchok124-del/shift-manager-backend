import React from 'react'
import { Shift } from '../../../types'
import { EmptyState } from '../../common/EmptyState'
import { ShiftCard } from '../ShiftCard'
import styles from './ShiftList.module.scss'

interface ShiftListProps {
  shifts: Shift[];
  onSignUp?: (id: number) => void;
}

export const ShiftList: React.FC<ShiftListProps> = ({ shifts, onSignUp }) => {
  if (shifts.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="Žádné směny k zobrazení"
        message="Momentálně nejsou k dispozici žádné směny odpovídající vašim filtrům."
      />
    );
  }

  return (
    <div className={styles.grid}>
      {shifts.map((shift) => (
        <ShiftCard key={shift.id} shift={shift} onSignUp={onSignUp} />
      ))}
    </div>
  );
};
