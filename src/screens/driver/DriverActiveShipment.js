// ============================================================
// Driver App — Active Shipment Screen (example)
// ============================================================
// This is the piece that didn't exist yet: it's what runs on the DRIVER'S
// phone. When the driver taps "Accept", the shipment becomes visible on the
// company's Fleet screen. While the shipment is active, this screen streams
// the phone's GPS straight into Firebase every few seconds — that stream IS
// the "vehicle location" the company sees. There's no separate hardware
// tracker; the vehicle's location = wherever the driver's phone is.
//
// Requires: expo-location  (npx expo install expo-location)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { colors, radius } from '../../theme';
import { Btn, Card, Badge } from '../../components';
import { acceptShipment, updateDriverLocation } from '../../config/firebaseService';

export default function DriverActiveShipment({ route, navigation }) {
  const { shipment } = route.params; // { id, from, to, ... }
  const [accepted, setAccepted] = useState(!!shipment.accepted);
  const [tracking, setTracking] = useState(false);
  const [lastFix, setLastFix] = useState(null);
  const watchRef = useRef(null);

  const handleAccept = async () => {
    try {
      await acceptShipment(shipment.id, {
        driverName: 'Rajesh Kumar',   // pull from the logged-in driver's profile
        vehicleId: 'TN-01-AB-1234',   // pull from the driver's assigned vehicle
        transport: shipment.transport || 'truck',
      });
      setAccepted(true);
    } catch (e) {
      Alert.alert('Could not accept shipment', e.message);
    }
  };

  // Start/stop streaming GPS once the shipment is accepted
  useEffect(() => {
    if (!accepted) return;

    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission required', 'Turn on location access to share your GPS with the company.');
        return;
      }

      setTracking(true);
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,   // push an update at most every 5s
          distanceInterval: 25, // ...or every 25m moved, whichever first
        },
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude, heading, speed } = position.coords;
          setLastFix({ latitude, longitude });
          try {
            await updateDriverLocation(shipment.id, { lat: latitude, lng: longitude, heading, speed });
          } catch (e) {
            // Swallow transient write failures (e.g. brief connectivity loss);
            // the next tick will retry automatically.
          }
        }
      );
    })();

    return () => {
      isMounted = false;
      watchRef.current?.remove?.();
      setTracking(false);
    };
  }, [accepted, shipment.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
          {shipment.from} → {shipment.to}
        </Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 12 }}>
          {shipment.material} · {shipment.km} km
        </Text>

        {!accepted ? (
          <Btn label="Accept Shipment" onPress={handleAccept} />
        ) : (
          <>
            <Badge label={tracking ? 'Sharing GPS' : 'Starting GPS…'} type={tracking ? 'green' : 'yellow'} />
            {lastFix && (
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                Last sent: {lastFix.latitude.toFixed(5)}, {lastFix.longitude.toFixed(5)}
              </Text>
            )}
          </>
        )}
      </Card>
    </SafeAreaView>
  );
}