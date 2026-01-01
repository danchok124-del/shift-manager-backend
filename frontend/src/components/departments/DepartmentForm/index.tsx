import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { Card, CardBody, CardHeader } from '../../common/Card';
import { Input } from '../../common/Input';
import styles from './DepartmentForm.module.scss';

interface DepartmentFormProps {
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  onCancel?: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ onSubmit, onCancel }) => {
  const [data, setData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={styles.container}>
      <CardHeader>
        <h2>Vytvořit oddělení</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Input
            label="Název"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
          <Input
            label="Popis"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
          <div className={styles.actions}>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} style={{ marginRight: '0.5rem' }}>
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
