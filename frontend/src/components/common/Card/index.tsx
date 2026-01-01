import React from 'react';
import styles from './Card.module.scss';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
};

export const CardBody: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};
