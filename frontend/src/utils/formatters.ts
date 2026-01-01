export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
