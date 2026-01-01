import React from 'react'
import styles from './Button.module.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'details' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    block ? styles.block : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
