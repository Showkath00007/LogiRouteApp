import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput
} from 'react-native';
import { colors, radius, fonts } from '../../theme';
import { Card, Btn, BackBtn, SectionLabel, Badge } from '../../components';
import { listenAvailableDrivers, sendBookingRequest } from '../../config/DriverService';
import { getProfile } from '../../config/UserStore';
import { getCityDetails, calculateDistance } from '../../data';

const RATE_PER_KM = 12; // ₹12 per km base rate

const MATERIALS = [
  { id: 'steel',     label: 'Steel',     icon: '🔩', mult: 1.4 },
  { id: 'cement',    label: 'Cement',    icon: '🏗️', mult: 1.0 },
  { id: 'coal',      label: 'Coal',      icon: '⚫', mult: 0.9 },
  { id: 'grains',    label: 'Grains',    icon: '🌾', mult: 0.8 },
  { id: 'aluminium', label: 'Aluminium', icon: '🥈', mult: 1.5 },
  { id: 'wood',      label: 'Wood',      icon: '🪵', mult: 1.1 },
];

const VEHICLE_MULT = { Heavy: 1.0, Container: 1.2, Medium: 0.85, Light: 0.7 };

// Geocode city name to [lon, lat] using live geocoder with offline fallback
async function geocodeCity(cityName) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&countrycodes=in&limit=1`, {
      headers: { 'User-Agent': 'LogiRouteApp' }
    });
    const list = await res.json();
    if (list && list.length > 0) {
      return [parseFloat(list[0].lon), parseFloat(list[0].lat)];
    }
  } catch (err) {
    console.log('Live geocode error in SelectDriverScreen:', err);
  }
  const details = getCityDetails(cityName);
  return details.coords; // [lon, lat]
}

// Get driving distance in km using live OSRM routing with offline fallback
async function getDrivingDistance(fromCoords, toCoords) {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return Math.round(data.routes[0].distance / 1000);
    }
  } catch (err) {
    console.log('Live routing distance error in SelectDriverScreen:', err);
  }
  return calculateDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
}

function calcCost(distKm, weightTons, matMult, vehicleType) {
  const base = distKm * RATE_PER_KM * weightTons * matMult * (VEHICLE_MULT[vehicleType] || 1.0);
  const gst = base * 0.18;
  const insurance = 200;
  return Math.round(base + gst + insurance);
}

export default function SelectDriverScreen({ navigation, route }) {
  const params = route?.params || {};
  const [step, setStep] = useState(params.source ? 2 : 1);
  const [origin, setOrigin] = useState(params.source || '');
  const [destination, setDestination] = useState(params.destination || '');
  const [material, setMaterial] = useState('steel');
  const [weight, setWeight] = useState('10');
  const [distKm, setDistKm] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(false);

  const selMat = MATERIALS.find(m => m.id === material) || MATERIALS[0];

  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      const unsub = listenAvailableDrivers(origin, destination, (data) => {
        setDrivers(data);
        setLoading(false);
      });
      return unsub;
    }
  }, [step]);

  const handleFind = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert('Missing', 'Please enter both origin and destination.');
      return;
    }
    if (!weight || isNaN(weight) || Number(weight) <= 0) {
      Alert.alert('Missing', 'Please enter a valid cargo weight.');
      return;
    }
    setCalculating(true);
    try {
      const [fromCoords, toCoords] = await Promise.all([
        geocodeCity(origin.trim()),
        geocodeCity(destination.trim()),
      ]);
      const km = await getDrivingDistance(fromCoords, toCoords);
      setDistKm(km);
      setStep(2);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not calculate distance. Check city names.');
    }
    setCalculating(false);
  };

  const getDriverCost = (driver) =>
    distKm ? calcCost(distKm, Number(weight) || 10, selMat.mult, driver.vehicleType) : 0;

  const handleBook = (driver) => {
    const cost = getDriverCost(driver);
    navigation.navigate('BookingSummary', {
      ...params,
      driver,
      source: origin,
      destination,
      material: selMat.label,
      weight,
      cost,
      distKm,
      transport: driver.vehicleType?.toLowerCase() || 'truck',
    });
  };

  const handleNotify = async (driver) => {
    const cost = getDriverCost(driver);
    setSelected(driver.uid);
    setBooking(true);
    try {
      const profile = await getProfile();
      await sendBookingRequest(driver.uid, {
        source: origin, destination,
        material: selMat.label, weight, cost, distKm,
        companyName: profile.company || profile.name,
      });
      Alert.alert('✅ Sent!', `Notification sent to ${driver.name}!`,
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]);
    } catch (e) {
      Alert.alert('Error', 'Could not send request.');
    }
    setBooking(false);
    setSelected(null);
  };

  const vColor = { Heavy: colors.blue, Medium: colors.purple, Light: colors.green, Container: colors.orange };

  // ── STEP 1: Route Input ───────────────────────────────────
  if (step === 1) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Find Drivers</Text>
        <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginBottom: 24 }}>Enter any city in India — we'll calculate the real road distance</Text>

        {/* Route input */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14 }}>ROUTE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.green, marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: fonts.base, fontWeight: '600', borderBottomWidth: 1.5, borderColor: colors.border, paddingVertical: 8 }}
              placeholder="Origin — any city in India"
              placeholderTextColor={colors.textMuted}
              value={origin} onChangeText={setOrigin} autoCapitalize="words"
            />
          </View>
          <View style={{ width: 2, height: 20, backgroundColor: colors.border, marginLeft: 5, marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.blue, marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: fonts.base, fontWeight: '600', borderBottomWidth: 1.5, borderColor: colors.border, paddingVertical: 8 }}
              placeholder="Destination — any city in India"
              placeholderTextColor={colors.textMuted}
              value={destination} onChangeText={setDestination} autoCapitalize="words"
            />
          </View>
        </Card>

        {/* Material */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 }}>MATERIAL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MATERIALS.map(m => (
              <TouchableOpacity key={m.id} onPress={() => setMaterial(m.id)}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, borderWidth: 2, borderColor: material === m.id ? colors.accent : colors.border, backgroundColor: material === m.id ? colors.accent + '15' : colors.surface2, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 13 }}>{m.icon}</Text>
                <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: material === m.id ? colors.accent : colors.textSub }}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Weight */}
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 }}>CARGO WEIGHT (TONS)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => setWeight(String(Math.max(1, Number(weight) - 1)))}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, color: colors.accent, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={{ flex: 1, textAlign: 'center', fontSize: 32, fontWeight: '900', color: colors.text }}
              value={weight} onChangeText={v => setWeight(v.replace(/[^0-9]/g, ''))} keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => setWeight(String(Number(weight) + 1))}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, color: colors.accent, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: fonts.xs, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
            Base rate: ₹{RATE_PER_KM}/km × {selMat.mult}x ({selMat.label}) × {weight}T
          </Text>
        </Card>

        <Btn
          label={calculating ? "Calculating real distance..." : "Calculate Distance & Find Drivers →"}
          onPress={handleFind}
          loading={calculating}
        />

        <View style={{ backgroundColor: colors.accent + '10', borderRadius: 12, padding: 14, marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Text style={{ fontSize: 18 }}>📍</Text>
          <Text style={{ fontSize: fonts.xs, color: colors.textSub, flex: 1, lineHeight: 18 }}>
            We use real road distance via OpenRouteService. Enter any city, town or village in India — cost is calculated at ₹{RATE_PER_KM}/km base rate.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // ── STEP 2: Driver List ───────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 }}>
        <BackBtn onPress={() => params.source ? navigation.goBack() : setStep(1)} style={{ marginBottom: 8 }} />
        <Text style={{ fontSize: fonts.xl, fontWeight: '900', color: colors.text }}>Available Drivers</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: fonts.sm, color: colors.green, fontWeight: '700' }}>📍 {origin}</Text>
          <Text style={{ color: colors.textMuted }}>→</Text>
          <Text style={{ fontSize: fonts.sm, color: colors.blue, fontWeight: '700' }}>📍 {destination}</Text>
        </View>
        {distKm && (
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
            <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>🛣️ {distKm} km (actual road)</Text>
            <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>⚖️ {weight}T · {selMat.icon} {selMat.label}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textSub, marginTop: 12 }}>Finding drivers...</Text>
          </View>
        ) : drivers.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🚫</Text>
            <Text style={{ fontSize: fonts.lg, fontWeight: '800', color: colors.text }}>No Drivers Available</Text>
            <Btn label="← Change Route" onPress={() => setStep(1)} style={{ marginTop: 20 }} variant="outline" />
          </View>
        ) : (
          <>
            <SectionLabel label={`${drivers.length} Drivers Available`} />
            {drivers.map((driver, i) => {
              const c = vColor[driver.vehicleType] || colors.blue;
              const isMock = driver.uid?.startsWith('mock');
              const dCost = getDriverCost(driver);
              const driverDistCost = distKm ? distKm * RATE_PER_KM : 0;

              return (
                <Card key={driver.uid || i} style={{ marginBottom: 14 }}>
                  {/* Driver info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: c + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 2, borderColor: c + '30' }}>
                      <Text style={{ fontSize: 24 }}>🧑‍✈️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fonts.md, fontWeight: '800', color: colors.text }}>{driver.name}</Text>
                      <Text style={{ fontSize: fonts.sm, color: colors.textSub }}>{driver.phone}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>⭐ {driver.rating?.toFixed(1) || '5.0'}</Text>
                      <Badge label={driver.vehicleType || 'Heavy'} color={c} />
                    </View>
                  </View>

                  {/* Cost breakdown */}
                  <View style={{ backgroundColor: colors.accent + '10', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1.5, borderColor: colors.accent + '25' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <View>
                        <Text style={{ fontSize: fonts.xs, color: colors.textMuted, fontWeight: '700', marginBottom: 2 }}>TOTAL BOOKING COST</Text>
                        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.accent }}>₹{dCost.toLocaleString()}</Text>
                        <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>incl. 18% GST + ₹200 insurance</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: fonts.xs, color: colors.textSub, fontWeight: '700' }}>🛣️ {distKm} km</Text>
                        <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>₹{RATE_PER_KM}/km × {selMat.mult}x</Text>
                        <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>× {weight}T × {VEHICLE_MULT[driver.vehicleType] || 1}x</Text>
                      </View>
                    </View>
                    {/* Mini breakdown */}
                    <View style={{ marginTop: 10, borderTopWidth: 1, borderColor: colors.accent + '20', paddingTop: 8, gap: 3 }}>
                      {[
                        ['Base fare', `₹${Math.round(driverDistCost * selMat.mult * Number(weight) * (VEHICLE_MULT[driver.vehicleType] || 1)).toLocaleString()}`],
                        ['GST (18%)', `₹${Math.round(driverDistCost * selMat.mult * Number(weight) * (VEHICLE_MULT[driver.vehicleType] || 1) * 0.18).toLocaleString()}`],
                        ['Insurance', '₹200'],
                      ].map(([label, val]) => (
                        <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>{label}</Text>
                          <Text style={{ fontSize: fonts.xs, color: colors.textSub, fontWeight: '700' }}>{val}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Vehicle & location */}
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[['🚛', driver.vehicle || driver.vehicleType], ['📍', driver.city || origin], ['⏱', `${driver.experience || 5}yr`], ['🛣️', `${driver.trips || 0} trips`]].map(([icon, val]) => (
                      <View key={val} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 12 }}>{icon}</Text>
                        <Text style={{ fontSize: fonts.xs, color: colors.textSub, fontWeight: '600' }}>{val}</Text>
                      </View>
                    ))}
                  </View>

                  {!isMock && (
                    <View style={{ backgroundColor: colors.green + '12', borderRadius: 8, padding: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text>✅</Text>
                      <Text style={{ fontSize: fonts.xs, color: colors.green, fontWeight: '700' }}>Verified driver · Real push notification</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Btn label="Book →" onPress={() => handleBook(driver)} style={{ flex: 1 }} />
                    {!isMock && (
                      <Btn label="📲 Notify" onPress={() => handleNotify(driver)}
                        loading={booking && selected === driver.uid} variant="outline" style={{ flex: 1 }} />
                    )}
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}