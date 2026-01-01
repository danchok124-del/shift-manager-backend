import React from 'react';
import styles from './Select.module.scss';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select id={selectId} className={styles.select} {...props}>
        {children
          ? children
          : options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
