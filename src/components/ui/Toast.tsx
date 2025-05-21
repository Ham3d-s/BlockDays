import React, { useState, useEffect } from 'react';

interface ToastProps {
  id?: string;
}

// Define toast event types
export interface ToastEventData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id = 'toast-container' }) => {
  const [toasts, setToasts] = useState<(ToastEventData & { id: number })[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Listen for toast events
    const handleToastEvent = (event: CustomEvent<ToastEventData>) => {
      const { message, type, duration = 3000 } = event.detail;
      const toastId = counter;
      
      // Add new toast
      setToasts(prev => [...prev, { message, type, duration, id: toastId }]);
      setCounter(prev => prev + 1);
      
      // Remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, duration);
    };

    // Add event listener
    window.addEventListener('show-toast' as any, handleToastEvent as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('show-toast' as any, handleToastEvent as EventListener);
    };
  }, [counter]);

  const getToastClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      id={id}
      className="toast toast-center toast-top z-50"
    >
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`alert ${getToastClass(toast.type)}`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;