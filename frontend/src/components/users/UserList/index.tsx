import React, { useState } from 'react';
import { User, UserRole } from '../../../types';
import { Badge } from '../../common/Badge';
import { Card } from '../../common/Card';
import { UserPreview } from '../UserPreview';
import styles from './UserList.module.scss';

interface UserListProps {
  users: User[];
  onRoleChange: (userId: number, newRole: UserRole) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onRoleChange }) => {
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);

  return (
    <Card className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>E-mail</th>
            <th>Oddělení</th>
            <th>Role</th>
            <th>Stav</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              onMouseEnter={() => setHoveredUserId(u.id)}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <td>
                <div style={{ position: 'relative' }}>
                  <strong>{u.firstName} {u.lastName}</strong>
                  {hoveredUserId === u.id && <UserPreview user={u} />}
                </div>
              </td>
              <td>{u.email}</td>
              <td>{u.department?.name || '-'}</td>
              <td>
                <select
                  className={styles.roleSelect}
                  value={u.role}
                  onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)}
                  aria-label={`Změnit roli pro uživatele ${u.firstName} ${u.lastName}`}
                >
                  <option value={UserRole.EMPLOYEE}>Zaměstnanec</option>
                  <option value={UserRole.MANAGER}>Manažer</option>
                  <option value={UserRole.HR}>HR</option>
                </select>
              </td>
              <td>
                <Badge variant={u.isActive ? 'success' : 'danger'}>
                  {u.isActive ? 'Aktivní' : 'Neaktivní'}
                </Badge>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.emptyState}>
                Žádní uživatelé nenalezeni
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};
