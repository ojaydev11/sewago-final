'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useSocket } from '@/hooks/useSocket';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

interface NotificationToastProps {
  className?: string;
}

export default function NotificationToast({ className }: NotificationToastProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for notifications from the server
      socket.on('notification', (data) => {
        console.log('Received notification:', data);
        const newNotification: Notification = {
          id: data.id || Date.now().toString(),
          message: data.message,
          type: data.type || 'info',
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 5000);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, isConnected]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = 'flex items-start p-4 mb-2 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
      default:
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 max-w-sm ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getToastClasses(notification.type)}
          role="alert"
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
