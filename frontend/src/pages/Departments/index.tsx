import { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { DepartmentForm } from '../../components/departments/DepartmentForm';
import { DepartmentList } from '../../components/departments/DepartmentList';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Department, UserRole } from '../../types';

function Departments() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await api.getDepartments({});
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      await api.createDepartment(data);
      setShowCreateForm(false);
      loadDepartments();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se vytvořit oddělení');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete deaktivovat toto oddělení?')) return;
    try {
      await api.deleteDepartment(id);
      loadDepartments();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se smazat oddělení');
    }
  };

  const canManage = user?.role === UserRole.HR;

  if (isLoading) {
    return <div className="loading">Načítání...</div>; 
    // "loading" class is in variables or main.scss? It was in main.scss, needs to be preserved or refactored.
    // Ideally put into common loading component or use main.scss global class.
    // For now, it works as main.scss is imported in app.
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Oddělení</h1>
          <p>Správa oddělení a přiřazování zaměstnanců</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Zrušit' : '+ Nové oddělení'}
          </Button>
        )}
      </header>

      {showCreateForm && (
        <DepartmentForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      )}

      <DepartmentList 
        departments={departments} 
        canManage={canManage} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

export default Departments;
