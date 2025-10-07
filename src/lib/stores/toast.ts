import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { ...toast, id };
  
  toasts.update(current => [...current, newToast]);
  
  return id;
}

export function removeToast(id: string) {
  toasts.update(current => current.filter(toast => toast.id !== id));
}

export function showSuccess(message: string, duration = 3000) {
  return addToast({ type: 'success', message, duration });
}

export function showError(message: string, duration = 5000) {
  return addToast({ type: 'error', message, duration });
}

export function showInfo(message: string, duration = 3000) {
  return addToast({ type: 'info', message, duration });
}