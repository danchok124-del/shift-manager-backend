import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar} role="navigation" aria-label="Hlavní navigace">
        <div className={styles.header}>
          <h1>Směny</h1>
        </div>
        
        <ul className={styles.nav}>
          <li className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}>
            <Link to="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className={`${styles.navItem} ${isActive('/shifts') ? styles.active : ''}`}>
            <Link to="/shifts">
              Směny
            </Link>
          </li>
          <li className={`${styles.navItem} ${isActive('/attendance') ? styles.active : ''}`}>
            <Link to="/attendance">
              Docházka
            </Link>
          </li>
          
          {(user?.role === UserRole.MANAGER || user?.role === UserRole.HR) && (
            <>
              <li className={styles.divider}></li>
              <li className={`${styles.navItem} ${isActive('/departments') ? styles.active : ''}`}>
                <Link to="/departments">
                  Oddělení
                </Link>
              </li>
            </>
          )}
          
          {user?.role === UserRole.HR && (
            <li className={`${styles.navItem} ${isActive('/users') ? styles.active : ''}`}>
              <Link to="/users">
                Uživatelé
              </Link>
            </li>
          )}
        </ul>
        
        <div className={styles.footer}>
          <Link to="/profile" className={styles.userLink}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <div className={styles.userRole}>
              <Badge variant="primary">{user?.role}</Badge>
            </div>
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm" block>
            Odhlásit se
          </Button>
        </div>
      </nav>
      
      <main className={styles.mainContent} role="main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
