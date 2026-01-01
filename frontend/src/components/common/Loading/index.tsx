import React from 'react';
import styles from './Loading.module.scss';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Načítání...' }) => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
};
