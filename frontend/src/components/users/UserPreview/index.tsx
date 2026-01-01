import React from 'react';
import { User } from '../../../types';
import { Badge } from '../../common/Badge';
import styles from './UserPreview.module.scss';

interface UserPreviewProps {
  user: User;
}

export const UserPreview: React.FC<UserPreviewProps> = ({ user }) => {
  return (
    <div className={styles.preview}>
      <div className={styles.item}>
        <strong>Jméno</strong>
        {user.firstName} {user.lastName}
      </div>
      <div className={styles.item}>
        <strong>E-mail</strong>
        {user.email}
      </div>
      {user.phone && (
        <div className={styles.item}>
          <strong>Telefon</strong>
          {user.phone}
        </div>
      )}
      <div className={styles.item}>
        <strong>Role</strong>
        <Badge variant="primary">{user.role}</Badge>
      </div>
      <div className={styles.item}>
        <strong>Oddělení</strong>
        {user.department?.name || 'Nepřiřazeno'}
      </div>
    </div>
  );
};
