import React, { createContext, useContext, useState } from 'react';
export const OfflineContext = createContext();
export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  return <OfflineContext.Provider value={{ isOnline, toggleOffline: () => setIsOnline(p => !p), cache: {} }}>{children}</OfflineContext.Provider>;
}
export function useOffline() { return useContext(OfflineContext); }
export function OfflineBanner() { return null; }
