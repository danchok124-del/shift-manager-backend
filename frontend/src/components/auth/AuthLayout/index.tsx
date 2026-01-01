import React from 'react';
import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  error?: string;
  successMessage?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  error,
  successMessage,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        
        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMessage}</div>}
        
        {children}
      </div>
    </div>
  );
};

export const AuthLinks: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.links}>{children}</div>
);

export const AuthFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.footer}>{children}</div>
);

export { styles as authStyles };
