import { ToastEventData } from '../components/ui/Toast';

/**
 * Displays a toast notification
 * @param message The message to display
 * @param type The type of toast (success, error, info, warning)
 * @param duration Duration in milliseconds
 */
export const showToast = (
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration: number = 3000
) => {
  const toastEvent = new CustomEvent<ToastEventData>('show-toast', {
    detail: {
      message,
      type,
      duration
    }
  });
  
  window.dispatchEvent(toastEvent as Event);
};