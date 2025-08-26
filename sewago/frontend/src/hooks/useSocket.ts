'use client';
import 'client-only';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = async () => {
    if (socketRef.current?.connected) return;
    
    // Skip during SSR or build
    if (typeof window === 'undefined') return;

    try {
      const { io } = await import('socket.io-client');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      
      socketRef.current = io(backendUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });
    } catch (error) {
      console.error('Failed to load socket.io-client:', error);
      return;
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Auto-connect when hook is used
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}
