import React from 'react';
import { Link } from 'react-router-dom';
import { Department } from '../../../types';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import styles from './DepartmentList.module.scss';

interface DepartmentListProps {
  departments: Department[];
  canManage: boolean;
  onDelete: (id: number) => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  canManage,
  onDelete,
}) => {
  return (
    <Card className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Název</th>
            <th>Popis</th>
            <th>Počet zaměstnanců</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td><strong>{dept.name}</strong></td>
              <td>{dept.description || '-'}</td>
              <td>{dept.userCount || 0}</td>
              <td>
                <div className={styles.actions}>
                  <Link to={`/departments/${dept.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="details" size="sm">Detail</Button>
                  </Link>
                  {canManage && (
                    <Button variant="danger" size="sm" onClick={() => onDelete(dept.id)}>
                      Smazat
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.emptyState}>
                Žádná oddělení k zobrazení
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};
