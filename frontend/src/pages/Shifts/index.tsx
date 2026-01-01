import { useEffect, useState } from 'react';
import './Shifts.scss';

import { Button } from '../../components/common/Button';
import { CreateShiftForm } from '../../components/shifts/CreateShiftForm';
import { ShiftFilters } from '../../components/shifts/ShiftFilters';
import { ShiftList } from '../../components/shifts/ShiftList';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Department, Shift, UserRole } from '../../types';

// Styles could be modularized for the page wrapper if needed
// import styles from './Shifts.module.scss'; 

function Shifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ departmentId: '', showPublic: true });
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Handled inside CreateShiftForm now? No, we need default for context but form handles its state.
  // We just need to pass defaultDepartmentId

  useEffect(() => {
    loadShifts();
    loadDepartments();
  }, [filter]);

  const loadDepartments = async () => {
    try {
      const response = await api.getDepartments({ limit: 100 });
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadShifts = async () => {
    try {
      const response = await api.getShifts({
        departmentId: filter.departmentId ? Number(filter.departmentId) : undefined,
        isPublic: filter.showPublic ? true : undefined,
      });
      setShifts(response.data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShift = async (shiftData: any) => {
    try {
      await api.createShift(shiftData);
      setShowCreateForm(false);
      loadShifts();
    } catch (err) {
      console.error('Failed to create shift:', err);
      alert('Nepodařilo se vytvořit směnu.');
    }
  };

  const handleSignUp = async (shiftId: number) => {
    try {
      await api.assignToShift(shiftId);
      loadShifts();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se přihlásit na směnu');
    }
  };

  const canManageShifts = user?.role === UserRole.MANAGER || user?.role === UserRole.HR;
  const isHR = user?.role === UserRole.HR;

  if (isLoading) {
    return <div className="loading">Načítání...</div>; // Keep legacy class or refactor
  }

  return (
    <div style={{ paddingBottom: '2rem' }}> {/* Inline style or module */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Směny</h1>
          <p>Přehled a správa směn</p>
        </div>
        {canManageShifts && (
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Zrušit' : '+ Nová směna'}
          </Button>
        )}
      </header>

      <ShiftFilters 
        departments={departments} 
        filter={filter} 
        onChange={setFilter} 
      />

      {showCreateForm && (
        <div style={{ marginBottom: '2rem' }}>
          <CreateShiftForm
            departments={departments}
            defaultDepartmentId={user?.departmentId || undefined}
            isHR={isHR}
            onSubmit={handleCreateShift}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <ShiftList shifts={shifts} onSignUp={handleSignUp} />
    </div>
  );
}

export default Shifts;
