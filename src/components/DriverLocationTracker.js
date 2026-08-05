// ============================================================
// DriverLocationTracker
// ============================================================
// Mount this ONCE near the root of the app (inside App.js, alongside
// <NavigationContainer>). It has no UI. What it does:
//
//   1. Watches whether the currently logged-in driver has an active
//      (confirmed) booking — via listenActiveBookingForDriver.
//   2. If yes, starts streaming the phone's GPS into that booking every
//      few seconds via updateDriverLocation. This is what the company's
//      Fleet screen displays as the vehicle's live location.
//   3. If the booking ends (or there isn't one), it stops.
//
// Because this lives at the app root instead of inside JobsScreen or
// TripDetailScreen, GPS keeps streaming no matter which screen the driver
// navigates to while a trip is active.
//
// Safe to mount even for company users / logged-out state — it silently
// does nothing unless auth.currentUser is a driver with an active booking.
//
// Requires: expo-location  (npx expo install expo-location)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as Location from 'expo-location';
import { listenActiveBookingForDriver, updateDriverLocation } from '../config/DriverService';

export default function DriverLocationTracker() {
  const [driverUid, setDriverUid] = useState(auth.currentUser?.uid || null);
  const watchRef = useRef(null);

  // Track auth state (driver logs in/out)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setDriverUid(user?.uid || null));
    return unsub;
  }, []);

  // Watch for this driver's active booking
  useEffect(() => {
    if (!driverUid) return;
    const unsub = listenActiveBookingForDriver(driverUid, (booking) => {
      startOrStopTracking(booking);
    });
    return () => {
      unsub();
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverUid]);

  const startOrStopTracking = async (booking) => {
    if (!booking) {
      stopTracking();
      return;
    }
    if (watchRef.current) return; // already tracking

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('DriverLocationTracker: location permission denied');
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 25 },
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        updateDriverLocation(booking.id, { lat: latitude, lng: longitude, heading, speed })
          .catch(() => {}); // transient write failures retry on the next tick
      }
    );
  };

  const stopTracking = () => {
    watchRef.current?.remove?.();
    watchRef.current = null;
  };

  return null; // no UI
}