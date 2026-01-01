import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Department, User, UserRole } from '../../types';
import styles from './DepartmentDetail.module.scss';

function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [deptData, usersData] = await Promise.all([
        api.getDepartment(Number(id)),
        api.getDepartmentUsers(Number(id)),
      ]);
      setDepartment(deptData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load department:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await api.getUsers({ search: searchUser, limit: 50 });
      // Filter out users already in department
      setAllUsers(response.data.filter((u: User) => !users.find((du) => du.id === u.id)));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    if (showAddUser) {
      loadAllUsers();
    }
  }, [showAddUser, searchUser]);

  const handleAddUser = async (userId: number) => {
    try {
      await api.addUserToDepartment(Number(id), userId);
      loadData();
      loadAllUsers();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se přidat uživatele');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await api.removeUserFromDepartment(Number(id), userId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se odebrat uživatele');
    }
  };

  const canManage = currentUser?.role === UserRole.HR;

  if (isLoading) {
    return <div className="loading">Načítání...</div>; // Keep legacy loading or refactor
  }

  if (!department) {
    return <div className="empty-state"><p>Oddělení nenalezeno</p></div>; // TODO: Style empty state
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{department.name}</h1>
        <p>{department.description || 'Bez popisu'}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Zaměstnanci ({users.length})</h2>
          {canManage && (
            <Button variant="primary" size="sm" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? 'Zavřít' : '+ Přidat zaměstnance'}
            </Button>
          )}
        </div>

        {showAddUser && (
          <Card className={styles.userSearch}>
            <CardBody>
              <Input
                placeholder="Hledat uživatele..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <div className={styles.searchResults}>
                {allUsers.map((u) => (
                  <div key={u.id} className={styles.searchItem}>
                    <span>{u.firstName} {u.lastName} ({u.email})</span>
                    <Button variant="primary" size="sm" onClick={() => handleAddUser(u.id)}>
                      Přidat
                    </Button>
                  </div>
                ))}
                {allUsers.length === 0 && <p className="text-muted" style={{ padding: '0.5rem 0' }}>Žádní uživatelé k přidání</p>}
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Jméno</th>
                <th>E-mail</th>
                <th>Role</th>
                {canManage && <th>Akce</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td><Badge variant="primary">{u.role}</Badge></td>
                  {canManage && (
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveUser(u.id)}>
                        Odebrat
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 4 : 3} style={{ textAlign: 'center', padding: '1rem' }}>
                    Žádní zaměstnanci v tomto oddělení
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

export default DepartmentDetail;
