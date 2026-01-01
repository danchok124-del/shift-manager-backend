import React from 'react';
import { Shift } from '../../../types';
import { ShiftCard } from '../ShiftCard';
import styles from './ShiftList.module.scss';

interface ShiftListProps {
  shifts: Shift[];
  onSignUp?: (id: number) => void;
}

export const ShiftList: React.FC<ShiftListProps> = ({ shifts, onSignUp }) => {
  if (shifts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Žádné směny k zobrazení</p>
      </div>
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
