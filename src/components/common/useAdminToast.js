import { useContext } from 'react';
import { AdminToastContext } from './adminToastContext';

export function useAdminToast() {
  const context = useContext(AdminToastContext);

  if (!context) {
    throw new Error('useAdminToast must be used inside AdminToastProvider');
  }

  return context;
}
