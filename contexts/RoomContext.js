import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [activeRoom, setActiveRoom] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedRoom = localStorage.getItem('activeRoom');
    if (storedRoom) {
      setActiveRoom(storedRoom);
    }
  }, []);

  const checkAndUpdateRoom = useCallback(() => {
    const path = router.asPath;
    const match = path.match(/\/room\/([^\/]+)/);
    if (match && match[1]) {
      setActiveRoom(match[1]);
    }
  }, [router.asPath]);

  useEffect(() => {
    checkAndUpdateRoom();
  }, [checkAndUpdateRoom]);

  useEffect(() => {
    if (!isClient) return;
    
    if (activeRoom) {
      localStorage.setItem('activeRoom', activeRoom);
    } else {
      localStorage.removeItem('activeRoom');
    }
  }, [activeRoom, isClient]);

  const leaveRoom = useCallback(() => {
    setActiveRoom(null);
    if (isClient) {
      localStorage.removeItem('activeRoom');
    }
    router.push('/');
  }, [router, isClient]);

  return (
    <RoomContext.Provider value={{ activeRoom, setActiveRoom, leaveRoom }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
} 