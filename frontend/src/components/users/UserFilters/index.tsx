import React from 'react';
import { UserRole } from '../../../types';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import styles from './UserFilters.module.scss';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Input
          placeholder="Hledat uživatele..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Hledat uživatele"
        />
      </div>
      <div className={styles.filter}>
        <Select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          aria-label="Filtr podle role"
        >
          <option value="">Všechny role</option>
          <option value={UserRole.EMPLOYEE}>Zaměstnanec</option>
          <option value={UserRole.MANAGER}>Manažer</option>
          <option value={UserRole.HR}>HR</option>
        </Select>
      </div>
    </div>
  );
};
