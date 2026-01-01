import { useEffect, useState } from 'react';
import { UserFilters } from '../../components/users/UserFilters';
import { UserList } from '../../components/users/UserList';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({
        search,
        role: roleFilter as UserRole || undefined,
        limit: 50,
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se změnit roli');
    }
  };

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Uživatelé</h1>
        <p>Správa uživatelů a jejich rolí</p>
      </header>

      <UserFilters 
        search={search} 
        onSearchChange={setSearch} 
        roleFilter={roleFilter} 
        onRoleFilterChange={setRoleFilter} 
      />

      <UserList users={users} onRoleChange={handleRoleChange} />
    </div>
  );
}

export default Users;
