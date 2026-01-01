import React, { useEffect, useState } from 'react';
import { Department } from '../../../types';
import { Button } from '../../common/Button';
import { Card, CardBody, CardHeader } from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import styles from './CreateShiftForm.module.scss';

interface CreateShiftFormProps {
  departments: Department[];
  defaultDepartmentId?: number;
  isHR?: boolean;
  onSubmit: (shiftData: any) => Promise<void>;
  onCancel?: () => void;
}

export const CreateShiftForm: React.FC<CreateShiftFormProps> = ({
  departments,
  defaultDepartmentId,
  isHR,
  onSubmit,
  onCancel,
}) => {
  const [newShift, setNewShift] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    departmentId: defaultDepartmentId || '',
    isPublic: false,
    requiredEmployees: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultDepartmentId) {
      setNewShift((prev) => ({ ...prev, departmentId: defaultDepartmentId }));
    }
  }, [defaultDepartmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...newShift,
        departmentId: Number(newShift.departmentId),
        requiredEmployees: Number(newShift.requiredEmployees),
      });
      // Reset form
      setNewShift({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        departmentId: defaultDepartmentId || '',
        isPublic: false,
        requiredEmployees: 1,
      });
    } catch (error) {
      // Error handled by parent usually
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDeptSelect = isHR || !defaultDepartmentId;

  return (
    <Card className={styles.container}>
      <CardHeader>
        <h2>Vytvořit směnu</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          {showDeptSelect && (
            <Select
              label="Oddělení"
              value={newShift.departmentId}
              onChange={(e) =>
                setNewShift({ ...newShift, departmentId: Number(e.target.value) })
              }
              required
            >
              <option value="">Vyberte oddělení</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          )}

          <div className={styles.formRow}>
            <Input
              label="Název"
              value={newShift.title}
              onChange={(e) => setNewShift({ ...newShift, title: e.target.value })}
              required
              placeholder="Např. Ranní směna"
            />
            <Input
              label="Potřeba zaměstnanců"
              type="number"
              min="1"
              value={newShift.requiredEmployees}
              onChange={(e) =>
                setNewShift({ ...newShift, requiredEmployees: Number(e.target.value) })
              }
              required
            />
          </div>

          <Input
            label="Popis"
            value={newShift.description}
            onChange={(e) => setNewShift({ ...newShift, description: e.target.value })}
            placeholder="Volitelný popis práce"
          />

          <div className={styles.formRow}>
            <Input
              label="Začátek"
              type="datetime-local"
              value={newShift.startTime}
              onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              required
            />
            <Input
              label="Konec"
              type="datetime-local"
              value={newShift.endTime}
              onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              required
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={newShift.isPublic}
                onChange={(e) =>
                  setNewShift({ ...newShift, isPublic: e.target.checked })
                }
              />
              Veřejná směna (viditelná pro všechna oddělení)
            </label>
          </div>

          <div className={styles.actions}>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Zrušit
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Vytvořit
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};
