import React, { createContext, useContext, useState } from 'react';
export const NotifContext = createContext();
export function NotificationProvider({ children }) {
  const showToast = () => {};
  const requestPermission = async () => 'granted';
  const scheduleNotification = () => {};
  return <NotifContext.Provider value={{ showToast, requestPermission, scheduleNotification, permission: 'granted' }}>{children}</NotifContext.Provider>;
}
export function useNotifications() { return useContext(NotifContext); }
export function NotificationSetupBanner() { return null; }
