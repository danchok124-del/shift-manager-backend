import React from 'react';
import { Department } from '../../../types';
import { Select } from '../../common/Select';
import styles from './ShiftFilters.module.scss';

interface ShiftFiltersProps {
  departments: Department[];
  filter: { departmentId: string; showPublic: boolean };
  onChange: (filter: { departmentId: string; showPublic: boolean }) => void;
}

export const ShiftFilters: React.FC<ShiftFiltersProps> = ({
  departments,
  filter,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterItem}>
        <Select
          label="Filtrovat podle oddělení"
          value={filter.departmentId}
          onChange={(e) => onChange({ ...filter, departmentId: e.target.value })}
        >
          <option value="">Všechna oddělení</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.filterItem} style={{ paddingBottom: '0.625rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={filter.showPublic}
            onChange={(e) => onChange({ ...filter, showPublic: e.target.checked })}
          />
          Jen veřejné
        </label>
      </div>
    </div>
  );
};
