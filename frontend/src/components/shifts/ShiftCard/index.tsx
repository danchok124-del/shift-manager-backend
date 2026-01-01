import React from 'react';
import { Link } from 'react-router-dom';
import { Shift } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../../common/Card';
import styles from './ShiftCard.module.scss';

interface ShiftCardProps {
  shift: Shift;
  onSignUp?: (id: number) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onSignUp }) => {
  return (
    <Card>
      <CardHeader>
        <div className={styles.headerContent}>
          <h3>{shift.title}</h3>
          {shift.isPublic && <Badge variant="primary">Veřejná</Badge>}
        </div>
      </CardHeader>
      <CardBody>
        <p className={styles.time}>
          {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
        </p>
        {shift.department && (
          <p className={styles.dept}>{shift.department.name}</p>
        )}
        <p className={styles.slots}>
          {shift.assignedCount}/{shift.requiredEmployees} obsazeno
        </p>
      </CardBody>
      <CardFooter>
        <div className={styles.footerContent}>
          <Link to={`/shifts/${shift.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="details" size="sm">
              Detail
            </Button>
          </Link>
          {(shift.availableSlots ?? 0) > 0 && onSignUp && (
            <Button variant="primary" size="sm" onClick={() => onSignUp(shift.id)}>
              Přihlásit se
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
