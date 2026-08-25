import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, RefreshControl, Platform, Dimensions, Image, Modal
} from 'react-native';
import { colors, radius, fonts, spacing } from '../../theme';
import { Btn, Card, StatCard, Badge, SectionLabel, BackBtn, BottomNav, Input } from '../../components';
import { db, auth } from '../../config/firebase';
import { ref, set, get, push, update, onValue, off } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const screen = (pt = 60) => ({ padding: 20, paddingTop: pt, flexGrow: 1 });
const h1 = { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 4 };
const sub = { fontSize: 13, color: colors.textSub, marginBottom: 20 };

// ── Helper: resolve a stable driver id even without real Firebase Auth ──
// If your login/register flow doesn't call Firebase Auth sign-in yet,
// auth.currentUser will always be null. Falling back to a fixed id lets
// you test save/status/jobs end-to-end while you wire up real auth.
export function decodeVehicleNumber(num = '', driver = null) {
  if (!num) return { make: 'Unknown Vehicle', rto: 'N/A', state: 'N/A' };
  const clean = num.replace(/[^A-Z0-9]/ig, '').toUpperCase();
  
  // Specific vehicle number overrides (trained accurate matching)
  const overrides = {
    'DL1LAH8608': { make: 'Eicher Pro 2059XP Box Truck', rto: 'Delhi Central', state: 'Delhi' },
    'DL1LAH8068': { make: 'Eicher Pro 2059XP Box Truck', rto: 'Delhi Central', state: 'Delhi' },
    'UP14HT8453': { make: 'Tata 1613 Heavy Lorry', rto: 'Ghaziabad', state: 'Uttar Pradesh' },
    'MH04GR9986': { make: 'Tata 2518c Cargo Carrier', rto: 'Thane', state: 'Maharashtra' },
    'AP02SU0910': { make: 'Ashok Leyland 3520 Lorry', rto: 'Anantapur', state: 'Andhra Pradesh' }
  };
  
  if (overrides[clean]) {
    return overrides[clean];
  }
  
  const stateCode = clean.substring(0, 2);
  let state = 'India';
  if (stateCode === 'AP') state = 'Andhra Pradesh';
  else if (stateCode === 'TN') state = 'Tamil Nadu';
  else if (stateCode === 'KA') state = 'Karnataka';
  else if (stateCode === 'MH') state = 'Maharashtra';
  else if (stateCode === 'DL') state = 'Delhi';
  else if (stateCode === 'TS') state = 'Telangana';
  else if (stateCode === 'KL') state = 'Kerala';
  else if (stateCode === 'UP') state = 'Uttar Pradesh';
  
  const rtoDigits = clean.substring(2, 4);
  let rtoCity = 'RTO Jurisdiction';
  if (stateCode === 'AP') {
    if (rtoDigits === '02') rtoCity = 'Anantapur';
    else if (rtoDigits === '26') rtoCity = 'Nellore';
    else if (rtoDigits === '16') rtoCity = 'Vijayawada';
    else if (rtoDigits === '03') rtoCity = 'Chittoor';
    else if (rtoDigits === '31') rtoCity = 'Visakhapatnam';
  } else if (stateCode === 'TN') {
    const val = parseInt(rtoDigits, 10);
    if (!isNaN(val) && val <= 22) rtoCity = 'Chennai';
    else if (rtoDigits === '37') rtoCity = 'Coimbatore';
    else if (rtoDigits === '58') rtoCity = 'Madurai';
  } else if (stateCode === 'KA') {
    const val = parseInt(rtoDigits, 10);
    if (!isNaN(val) && (val <= 5 || val === 51 || val === 53)) rtoCity = 'Bengaluru';
  } else if (stateCode === 'MH') {
    const val = parseInt(rtoDigits, 10);
    if (!isNaN(val) && (val <= 4 || val === 47)) rtoCity = 'Mumbai';
    else if (rtoDigits === '12') rtoCity = 'Pune';
  } else if (stateCode === 'DL') {
    rtoCity = 'Delhi Central';
  } else if (stateCode === 'TS') {
    const val = parseInt(rtoDigits, 10);
    if (!isNaN(val) && val >= 9 && val <= 14) rtoCity = 'Hyderabad';
  }

  const lastChar = clean[clean.length - 1];
  const charCode = lastChar ? lastChar.charCodeAt(0) : 0;
  const models = [
    'Tata Prima 4028.S Container',
    'Ashok Leyland 3520 Lorry',
    'BharatBenz 2823C Tipper',
    'Mahindra Blazo X 35 Lorry',
    'Eicher Pro 6035 Box Truck',
    'Tata Signa 2821 Cargo Carrier',
    'Ashok Leyland Ecomet LCV',
    'Eicher Pro 3015 Box Lorry',
  ];
  const make = (driver && driver.vehicleModel) ? driver.vehicleModel : models[charCode % models.length];

  return { make, rto: rtoCity, state };
}

let lastLoggedInDriverUid = null;

function getDriverUid() {
  if (auth.currentUser?.uid) {
    // Basic verification: if current user is logged in, cache it
    lastLoggedInDriverUid = auth.currentUser.uid;
  }
  return lastLoggedInDriverUid || 'demo_driver';
}

// ── Helper: get/save driver profile from Firebase ─────────────
async function getDriverProfile() {
  const uid = getDriverUid();
  if (uid && uid !== 'demo_driver') {
    lastLoggedInDriverUid = uid;
  }
  try {
    const snap = await get(ref(db, `drivers/${uid}`));
    let profile = snap.exists() ? snap.val() : null;
    
    // Sync avatar from users/profile if not set on driver node
    try {
      const uSnap = await get(ref(db, `users/${uid}/profile`));
      if (uSnap.exists()) {
        const uData = uSnap.val();
        if (profile) {
          if (!profile.avatar && uData.avatar) {
            profile.avatar = uData.avatar;
          }
        } else {
          profile = {
            uid,
            name: uData.name || '',
            phone: uData.phone || '',
            city: uData.city || '',
            avatar: uData.avatar || '',
          };
        }
      }
    } catch (err) {}
    
    return profile;
  } catch (e) {
    console.warn('getDriverProfile error:', e);
    return null;
  }
}

async function saveDriverProfile(data) {
  const uid = getDriverUid();
  try {
    await update(ref(db, `drivers/${uid}`), { ...data, uid, updatedAt: Date.now() });
    return true;
  } catch (e) {
    console.warn('saveDriverProfile error:', e);
    return false;
  }
}

function listenBookingRequests(driverUid, callback) {
  if (!driverUid) return () => {};
  
  let mainList = [];
  let fallbackList = [];
  
  const mergeAndCallback = () => {
    const combined = [...mainList, ...fallbackList];
    const seen = new Set();
    const unique = [];
    for (const item of combined) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(unique);
  };

  const r1 = ref(db, `driverNotifications/${driverUid}`);
  const unsub1 = onValue(r1, snap => {
    if (!snap.exists()) { mainList = []; }
    else {
      mainList = Object.values(snap.val()).filter(n => n.type === 'booking_request' || n.type === 'payment_received' || n.type === 'booking_accepted');
    }
    mergeAndCallback();
  });

  let unsub2 = () => {};
  if (driverUid !== 'demo_driver') {
    const r2 = ref(db, `driverNotifications/demo_driver`);
    unsub2 = onValue(r2, snap => {
      if (!snap.exists()) { fallbackList = []; }
      else {
        fallbackList = Object.values(snap.val()).filter(n => n.type === 'booking_request' || n.type === 'payment_received' || n.type === 'booking_accepted');
      }
      mergeAndCallback();
    });
  }

  return () => {
    unsub1();
    unsub2();
  };
}

async function respondToBooking(bookingId, driverUid, accepted) {
  try {
    let companyUid = null;
    try {
      const snap = await get(ref(db, `bookings/${bookingId}`));
      if (snap.exists()) {
        companyUid = snap.val().companyUid;
      }
    } catch (err) {
      console.warn('Error reading booking in driver respondToBooking:', err);
    }

    let payoutDetails = null;
    if (accepted) {
      try {
        const uSnap = await get(ref(db, `users/${driverUid}/profile`));
        if (uSnap.exists()) {
          const uData = uSnap.val();
          payoutDetails = {
            upiId: uData.selectedUpiId || (uData.upiAccounts && uData.upiAccounts[0]?.id) || 'Not Configured',
            bankName: (uData.bankAccounts && uData.bankAccounts[0]?.bankName) || 'Not Configured',
            accountNumber: (uData.bankAccounts && uData.bankAccounts[0]?.accountNumber) || 'Not Configured',
            ifsc: (uData.bankAccounts && uData.bankAccounts[0]?.ifsc) || 'Not Configured',
          };
        }
      } catch (err) {
        console.warn('Error reading driver profile for payment details:', err);
      }
    }

    await update(ref(db, `bookings/${bookingId}`), {
      status: accepted ? 'confirmed' : 'rejected',
      respondedAt: Date.now(),
      ...(payoutDetails ? { payoutDetails } : {}),
    });

    if (companyUid) {
      await update(ref(db, `users/${companyUid}/bookings/${bookingId}`), {
        status: accepted ? 'Confirmed' : 'Cancelled',
        updatedAt: Date.now(),
        ...(payoutDetails ? { payoutDetails } : {}),
      });

      const notifRef = push(ref(db, `driverNotifications/${companyUid}`));
      await set(notifRef, {
        id: notifRef.key,
        type: accepted ? 'booking_accepted' : 'booking_rejected',
        bookingId,
        title: accepted ? '✅ Driver Accepted!' : '❌ Driver Declined',
        message: accepted
          ? 'Your driver has accepted the booking and is on the way.'
          : 'The driver declined. Please select another driver.',
        read: false,
        createdAt: Date.now(),
        ...(payoutDetails ? { payoutDetails } : {}),
      });
    }
    return true;
  } catch (e) {
    console.warn('respondToBooking error:', e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// S19 — Driver Dashboard
// ═══════════════════════════════════════════════════════════════
export function DriverDashboard({ navigation }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'trips', icon: '📦', label: 'Trips' },
    { id: 'jobs', icon: '🔔', label: 'Jobs' },
    { id: 'earn', icon: '💰', label: 'Earn' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  const mockDriver = {
    name: 'Driver', phone: '', vehicle: '', vehicleType: 'Heavy',
    city: '', status: 'available', trips: 0, rating: 5.0, earnings: 0,
  };

  const loadDriver = async () => {
    const uid = getDriverUid();
    const profile = await getDriverProfile();
    setDriver(profile || { ...mockDriver, uid });
    setLoading(false);
  };

  const [driverUid, setDriverUid] = useState(getDriverUid());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setDriverUid(user.uid);
      } else {
        setDriverUid('demo_driver');
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // Initial load — works whether or not a real Firebase Auth user exists
    loadDriver();

    const unsubBookings = listenBookingRequests(driverUid, setBookingRequests);

    // Re-fetch every time this screen comes back into focus
    // (e.g. returning from DriverProfileSetup after saving)
    const unsubFocus = navigation.addListener('focus', loadDriver);

    return () => {
      unsubBookings();
      unsubFocus();
    };
  }, [navigation, driverUid]);

  const handleTab = (id) => {
    const routes = { trips: 'MyTrips', jobs: 'Jobs', earn: 'Earnings', profile: 'Profile' };
    if (routes[id]) navigation.navigate(routes[id]);
    else setActiveTab(id);
  };

  const handleAcceptBooking = async (booking) => {
    const uid = getDriverUid();
    if (Platform.OS === 'web') {
      const yes = window.confirm(`Accept Booking?\n\n${booking.from} → ${booking.to}\n${booking.material}\nCost: ₹${booking.cost?.toLocaleString()}`);
      if (yes) {
        const ok = await respondToBooking(booking.bookingId, uid, true);
        window.alert(ok ? '✅ Accepted!\n\nYou have accepted the booking.' : 'Error updating booking.');
        if (ok) loadDriver();
      } else {
        const ok = await respondToBooking(booking.bookingId, uid, false);
        window.alert(ok ? '❌ Declined!\n\nBooking request declined.' : 'Error updating booking.');
        loadDriver();
      }
      return;
    }
    Alert.alert(
      'Accept Booking?',
      `${booking.from} → ${booking.to}\n${booking.material}\nCost: ₹${booking.cost?.toLocaleString()}`,
      [
        { text: 'Decline', style: 'destructive', onPress: async () => {
          const ok = await respondToBooking(booking.bookingId, uid, false);
          Alert.alert(ok ? 'Declined' : 'Error', ok ? 'Booking request declined.' : 'Could not update booking. Check your connection.');
        }},
        { text: 'Accept ✓', onPress: async () => {
          const ok = await respondToBooking(booking.bookingId, uid, true);
          Alert.alert(ok ? '✅ Accepted!' : 'Error', ok ? 'You have accepted the booking. Get ready to depart!' : 'Could not update booking. Check your connection.');
          if (ok) loadDriver();
        }},
      ]
    );
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading dashboard...</Text>
    </SafeAreaView>
  );

  const pendingRequests = bookingRequests.filter(b => b.type === 'booking_request' && !b.responded);
  const paymentAlerts = bookingRequests.filter(b => b.type === 'payment_received' || b.type === 'booking_accepted');
  const statusColor = { available: colors.green, busy: colors.orange, pending: colors.yellow, offline: colors.textMuted };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen(60)}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: fonts.sm, color: colors.textSub }}>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'} 🙏</Text>
            <Text style={h1}>{driver?.name || 'Driver'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor[driver?.status] || colors.green }} />
              <Text style={{ fontSize: fonts.sm, color: statusColor[driver?.status] || colors.green, fontWeight: '700', textTransform: 'capitalize' }}>{driver?.status || 'Available'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
              if (Platform.OS === 'web') {
                const yes = window.confirm('Sign Out?\n\nAre you sure you want to sign out?');
                if (yes) {
                  auth.signOut().then(() => navigation.replace('Login'));
                }
              } else {
                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: () => auth.signOut().then(() => navigation.replace('Login')) }
                ]);
              }
            }}
              style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.red + '12', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.red + '30' }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('DriverProfileSetup')}
              style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.accent + '30', overflow: 'hidden' }}>
              {driver?.avatar && !(Platform.OS !== 'web' && driver.avatar.startsWith('blob:')) ? (
                <Image source={{ uri: driver.avatar }} style={{ width: 52, height: 52 }} />
              ) : (
                <Text style={{ fontSize: 26 }}>🧑‍✈️</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending booking requests */}
        {pendingRequests.length > 0 && (
          <>
            <View style={{ backgroundColor: colors.orange + '15', borderRadius: 14, borderWidth: 1.5, borderColor: colors.orange + '40', padding: 4, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                <Text style={{ fontSize: fonts.base, fontWeight: '800', color: colors.orange, flex: 1 }}>{pendingRequests.length} New Booking Request{pendingRequests.length > 1 ? 's' : ''}!</Text>
              </View>
              {pendingRequests.slice(0, 2).map((req, i) => (
                <View key={req.id || i} style={{ backgroundColor: colors.surface, borderRadius: 10, margin: 8, marginTop: 0, padding: 14 }}>
                  <Text style={{ fontSize: fonts.base, fontWeight: '800', color: colors.text, marginBottom: 4 }}>{req.from} → {req.to}</Text>
                  <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginBottom: 4 }}>{req.material} · ₹{req.cost?.toLocaleString()}</Text>
                  <Text style={{ fontSize: fonts.xs, color: colors.textMuted, marginBottom: 10 }}>From: {req.companyName || 'A Company'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Btn label="✓ Accept" onPress={async () => {
                      const uid = getDriverUid();
                      const bookingId = req.bookingId || req.id;
                      await respondToBooking(bookingId, uid, true);
                      try { await update(ref(db, `driverNotifications/${uid}/${req.id}`), { responded: true, accepted: true }); } catch(e) {}
                      setBookingRequests(prev => prev.filter(b => b.id !== req.id));
                      const title = '✅ Accepted!';
                      const msg = 'Booking accepted. Get ready to depart!';
                      if (Platform.OS === 'web') {
                        window.alert(`${title}\n\n${msg}`);
                      } else {
                        Alert.alert(title, msg);
                      }
                    }} style={{ flex: 1 }} />
                    <Btn label="✗ Decline" onPress={async () => {
                      const uid = getDriverUid();
                      const bookingId = req.bookingId || req.id;
                      await respondToBooking(bookingId, uid, false);
                      try { await update(ref(db, `driverNotifications/${uid}/${req.id}`), { responded: true, accepted: false }); } catch(e) {}
                      setBookingRequests(prev => prev.filter(b => b.id !== req.id));
                      const title = 'Declined';
                      const msg = 'Booking request declined.';
                      if (Platform.OS === 'web') {
                        window.alert(`${title}\n\n${msg}`);
                      } else {
                        Alert.alert(title, msg);
                      }
                    }} variant="ghost" style={{ flex: 1 }} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {paymentAlerts.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel label="🔔 Recent Notifications" style={{ marginTop: 0 }} />
            {paymentAlerts.map((al, idx) => (
              <View key={al.id || idx} style={{ paddingVertical: 10, borderBottomWidth: idx < paymentAlerts.length - 1 ? 1 : 0, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: fonts.sm, fontWeight: '800', color: colors.text }}>{al.title || 'Notification'}</Text>
                  <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>
                    {al.createdAt ? new Date(al.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </Text>
                </View>
                <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginTop: 4 }}>{al.message}</Text>
              </View>
            ))}
          </Card>
        )}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard icon="🛣️" value={driver?.trips || 0} label="Total Trips" color={colors.blue} style={{ flex: 1 }} />
          <StatCard icon="⭐" value={(driver?.rating || 5.0).toFixed(1)} label="Rating" color={colors.yellow} style={{ flex: 1 }} />
          <StatCard icon="💰" value={`₹${((driver?.earnings || 0) / 1000).toFixed(0)}K`} label="Earned" color={colors.green} style={{ flex: 1 }} />
        </View>

        {/* Vehicle info */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel label="My Vehicle" />
          {driver?.vehicle ? (() => {
            const vDetails = decodeVehicleNumber(driver.vehicle, driver);
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 36 }}>🚛</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fonts.md, fontWeight: '800', color: colors.text }}>{driver.vehicle}</Text>
                    <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.accent }}>{vDetails.make.split(' ')[0]}</Text>
                  </View>
                  <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: colors.accent, marginTop: 1 }}>{vDetails.make}</Text>
                  <Text style={{ fontSize: fonts.xs, color: colors.textSub, marginTop: 2 }}>Origin: {vDetails.rto} ({vDetails.state})</Text>
                </View>
              </View>
            );
          })() : (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ color: colors.textMuted, marginBottom: 10 }}>No vehicle details added yet</Text>
              <Btn label="Add Vehicle Details" onPress={() => navigation.navigate('DriverProfileSetup')} variant="outline" />
            </View>
          )}
        </Card>

        {/* Status toggle */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel label="Availability" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['available', 'offline'].map(s => (
              <TouchableOpacity key={s} onPress={async () => {
                // Update UI immediately, then persist
                setDriver(prev => ({ ...prev, status: s }));
                const ok = await saveDriverProfile({ status: s });
                if (!ok) {
                  Alert.alert('Not saved', 'Status changed locally but failed to save to the server. Check your connection.');
                }
              }}
                style={{ flex: 1, padding: 12, borderRadius: radius.md, alignItems: 'center', backgroundColor: driver?.status === s ? (s === 'available' ? colors.green : colors.textMuted) + '22' : colors.surface2, borderWidth: 2, borderColor: driver?.status === s ? (s === 'available' ? colors.green : colors.textMuted) : colors.border }}>
                <Text style={{ fontSize: fonts.sm, fontWeight: '800', color: driver?.status === s ? (s === 'available' ? colors.green : colors.textMuted) : colors.textSub, textTransform: 'capitalize' }}>
                  {s === 'available' ? '✓ Available' : '✗ Offline'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Route Safety & Weather Checker */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RoadAlerts')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: radius.lg,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3
          }}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>🛣️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>Route Safety & Weather Checker</Text>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#059669' }}>FEASIBILITY</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 2 }}>
                  Enter source & destination to verify highway weather, road alerts & safety
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, color: colors.accent, fontWeight: '900', marginLeft: 8 }}>→</Text>
          </View>
        </TouchableOpacity>

        {(!driver?.upiId || !driver?.bankName || !driver?.accountNumber) && (
          <TouchableOpacity
            onPress={() => navigation.navigate('PaymentMethods')}
            style={{
              backgroundColor: '#FFF8F2',
              borderColor: '#FFC085',
              borderWidth: 1.5,
              borderRadius: radius.lg,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#D97706',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2
            }}
            activeOpacity={0.8}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#D97706' }}>Configure Payout Accounts</Text>
              <Text style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
                Please add your Bank Account or UPI ID to receive payments from companies.
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: '#D97706', fontWeight: '900' }}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <SectionLabel label="Quick Actions" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            ['📋', 'My Trips', () => navigation.navigate('MyTrips')],
            ['🔔', 'Jobs', () => navigation.navigate('Jobs')],
            ['💰', 'Earnings', () => navigation.navigate('Earnings')],
            ['🚛', 'Vehicle', () => navigation.navigate('Vehicle')],
          ].map(([icon, label, onPress]) => (
            <TouchableOpacity key={label} onPress={onPress}
              style={{ width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border }}>
              <Text style={{ fontSize: 28 }}>{icon}</Text>
              <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: colors.text }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={tabs} activeTab={activeTab} onTabPress={handleTab} />
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// Driver Profile Setup — fill details after registration
// ═══════════════════════════════════════════════════════════════
export function DriverProfileSetup({ navigation }) {
  const [form, setForm] = useState({
    name: '', phone: '', license: '', vehicle: '', vehicleModel: '',
    vehicleType: 'Heavy', experience: '', city: '', address: '',
    upiId: '', bankName: '', accountNumber: '', ifsc: '',
  });
  const [saving, setSaving] = useState(false);
  const vehicleTypes = ['Light', 'Medium', 'Heavy', 'Container'];

  const set_ = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    // Pre-fill if profile exists
    getDriverProfile().then(p => {
      if (p) setForm(f => ({
        ...f,
        name: p.name || '',
        phone: p.phone || '',
        license: p.license || '',
        vehicle: p.vehicle || '',
        vehicleModel: p.vehicleModel || '',
        vehicleType: p.vehicleType || 'Heavy',
        experience: p.experience || '',
        city: p.city || '',
        address: p.address || '',
        upiId: p.upiId || '',
        bankName: p.bankName || '',
        accountNumber: p.accountNumber || '',
        ifsc: p.ifsc || '',
      }));
    });
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.vehicle || !form.license || !form.vehicleModel) {
      Alert.alert('Missing', 'Please fill name, phone, vehicle number, vehicle model and license.');
      return;
    }
    setSaving(true);
    const uid = getDriverUid();
    const profileData = {
      ...form,
      uid,
      status: 'pending',
      type: 'driver',
      rating: 5.0,
      trips: 0,
      earnings: 0,
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await set(ref(db, `drivers/${uid}`), profileData);
      
      // Also sync directly to users/${uid}/profile node for checkout validation!
      await update(ref(db, `users/${uid}/profile`), {
        name: form.name,
        phone: form.phone,
        city: form.city,
        type: 'driver',
        selectedUpiId: form.upiId,
        upiAccounts: [{ id: form.upiId, label: 'UPI Payout', app: 'UPI', primary: true, icon: '📱' }],
        bankAccounts: [{ id: 'bank_payout', label: 'Bank Payout', bankName: form.bankName, accountNumber: form.accountNumber, ifsc: form.ifsc, icon: '🏦' }],
        updatedAt: Date.now(),
      });

      navigation.navigate('Success', {
        type: 'driver',
        title: 'Profile Submitted successfully!',
        desc: 'Your details have been submitted for admin approval. You will be notified once approved.',
        buttonLabel: 'Enter Dashboard →',
        target: 'DriverDashboard',
        replace: true
      });
    } catch (e) {
      console.warn('DriverProfileSetup save error:', e);
      Alert.alert(
        '❌ Save Failed',
        'Could not save your profile. Please check your internet connection and try again.\n\n' + (e?.message || ''),
      );
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Driver Profile</Text>
        <Text style={sub}>Fill your details to appear in the driver marketplace</Text>

        <SectionLabel label="Personal Details" />
        <Input label="Full Name *" placeholder="Your full name" value={form.name} onChangeText={v => set_('name', v)} />
        <Input label="Phone Number *" placeholder="+91 XXXXX XXXXX" value={form.phone} onChangeText={v => set_('phone', v)} keyboardType="phone-pad" />
        <Input label="City / Base Location *" placeholder="e.g. Chennai, Hyderabad" value={form.city} onChangeText={v => set_('city', v)} />
        <Input label="Full Address" placeholder="House no, Street, Area, City" value={form.address} onChangeText={v => set_('address', v)} multiline />

        <SectionLabel label="Vehicle & License" style={{ marginTop: 8 }} />
        <Input label="Driving License Number *" placeholder="e.g. TN01 20210012345" value={form.license} onChangeText={v => set_('license', v)} autoCapitalize="characters" />
        <Input label="Vehicle Number *" placeholder="e.g. TN 01 AB 1234" value={form.vehicle} onChangeText={v => set_('vehicle', v)} autoCapitalize="characters" />
        <Input label="Vehicle Model / Brand *" placeholder="e.g. Tata 1613 Lorry, Eicher Pro 2059XP" value={form.vehicleModel} onChangeText={v => set_('vehicleModel', v)} />
        <Input label="Years of Experience" placeholder="e.g. 5" value={form.experience} onChangeText={v => set_('experience', v)} keyboardType="numeric" />

        <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>VEHICLE TYPE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {vehicleTypes.map(t => (
            <TouchableOpacity key={t} onPress={() => set_('vehicleType', t)}
              style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.full, borderWidth: 2, borderColor: form.vehicleType === t ? colors.accent : colors.border, backgroundColor: form.vehicleType === t ? colors.accent + '15' : colors.surface2 }}>
              <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: form.vehicleType === t ? colors.accent : colors.textSub }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionLabel label="Payout Account Details (For Shipments)" style={{ marginTop: 8 }} />
        <Input label="UPI ID" placeholder="e.g. name@okaxis" value={form.upiId} onChangeText={v => set_('upiId', v)} />
        <Input label="Bank Name" placeholder="e.g. State Bank of India, HDFC" value={form.bankName} onChangeText={v => set_('bankName', v)} />
        <Input label="Account Number" placeholder="Enter bank account number" value={form.accountNumber} onChangeText={v => set_('accountNumber', v)} keyboardType="numeric" />
        <Input label="IFSC Code" placeholder="e.g. SBIN0001234" value={form.ifsc} onChangeText={v => set_('ifsc', v)} autoCapitalize="characters" />

        <View style={{ backgroundColor: colors.blue + '12', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.blue + '30' }}>
          <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: colors.blue, marginBottom: 4 }}>📋 What happens next?</Text>
          <Text style={{ fontSize: fonts.xs, color: colors.textSub, lineHeight: 18 }}>
            1. You submit your details{'\n'}
            2. Admin reviews and approves your profile{'\n'}
            3. You appear in the driver marketplace{'\n'}
            4. Companies can find and book you{'\n'}
            5. You get real-time notifications for bookings
          </Text>
        </View>

        <Btn label="Save & Submit Profile 🚀" onPress={handleSave} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// S20 — My Trips
// ═══════════════════════════════════════════════════════════════
export function MyTripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getDriverUid();
    try {
      const bRef = ref(db, 'bookings');
      onValue(bRef, snap => {
        if (!snap.exists()) { setTrips([]); setLoading(false); return; }
        const bookingsData = snap.val();
        const activeTrips = Object.values(bookingsData)
          .filter(b => b.driverUid === uid && (b.status === 'confirmed' || b.status === 'paid' || b.status === 'In Transit' || b.status === 'Delivered'))
          .map(b => ({
            id: b.id,
            from: b.from,
            to: b.to,
            date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today',
            status: b.status === 'paid' ? 'Paid (Ready to Depart)' : b.status === 'confirmed' ? 'Confirmed (Pending Payment)' : b.status === 'In Transit' ? 'In Transit' : b.status || 'Confirmed',
            earnings: b.cost || b.amount || 0,
            km: b.distance || b.distKm || 0,
            material: b.material || 'Cargo',
            companyName: b.companyName || 'Uri Logistics',
          }))
          .sort((a, b) => b.id.localeCompare(a.id));
        setTrips(activeTrips);
        setLoading(false);
      }, () => { setTrips([]); setLoading(false); });
    } catch (e) { setTrips([]); setLoading(false); }
  }, []);

  const statusColor = { 
    'Paid (Ready to Depart)': colors.green, 
    'Confirmed (Pending Payment)': colors.yellow, 
    'In Transit': colors.blue, 
    'Completed': colors.green, 
    'Cancelled': colors.red 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>My Trips</Text>
        {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : trips.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🛣️</Text>
            <Text style={{ fontSize: fonts.lg, fontWeight: '800', color: colors.text }}>No Trips Yet</Text>
            <Text style={{ fontSize: fonts.sm, color: colors.textSub, textAlign: 'center', marginTop: 8 }}>
              Your completed trips will appear here after you accept and complete bookings.
            </Text>
          </View>
        ) : (
          trips.map(t => (
            <Card key={t.id} style={{ marginBottom: 12 }} onPress={() => navigation.navigate('TripDetail', { trip: t })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fonts.md, fontWeight: '800', color: colors.text }}>{t.from} → {t.to}</Text>
                  <Text style={{ fontSize: fonts.sm, color: colors.textSub }}>{t.material} · {t.date}</Text>
                </View>
                <Badge label={t.status} color={statusColor[t.status] || colors.textMuted} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>🏢 {t.companyName}</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: fonts.xs, color: colors.textSub }}>🛣️ {t.km} km</Text>
                  <Text style={{ fontSize: fonts.sm, fontWeight: '800', color: colors.green }}>₹{t.earnings?.toLocaleString()}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// S21 — Trip Detail
// ═══════════════════════════════════════════════════════════════
export function TripDetailScreen({ navigation, route }) {
  const trip = route?.params?.trip || {};
  const statusColor = { 
    'Paid (Ready to Depart)': colors.green, 
    'Confirmed (Pending Payment)': colors.yellow, 
    'In Transit': colors.blue, 
    'Completed': colors.green, 
    'Cancelled': colors.red 
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Trip Detail</Text>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: fonts.xl, fontWeight: '900', color: colors.text, marginBottom: 4 }}>{trip.from} → {trip.to}</Text>
          <View style={{ flexDirection: 'row', marginVertical: 6 }}>
            <Badge label={trip.status || 'Confirmed'} color={statusColor[trip.status] || colors.green} />
          </View>
          {[
            ['Shipper Company', trip.companyName || 'Uri Logistics'],
            ['Material', trip.material], 
            ['Date', trip.date], 
            ['Distance', `${trip.km} km`], 
            ['Earnings', `₹${trip.earnings?.toLocaleString()}`]
          ].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: fonts.sm }}>{k}</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: fonts.sm }}>{v}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// S22 — Jobs (Requests + GPS Job Board)
// ═══════════════════════════════════════════════════════════════
export function JobsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [jobBoard, setJobBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentJob, setSelectedPaymentJob] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

  const getLocation = async () => {
    setLocLoading(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location needed to filter nearby jobs.'); setLocLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: 3 });
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    } catch(e) { Alert.alert('Error', 'Could not get location.'); }
    setLocLoading(false);
  };

  const [driverUid, setDriverUid] = useState(getDriverUid());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setDriverUid(user.uid);
      } else {
        setDriverUid('demo_driver');
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!driverUid) return;
    setLoading(true);
    // Listen to direct booking requests
    let mainList = [];
    let fallbackList = [];
    const mergeAndSet = () => {
      const combined = [...mainList, ...fallbackList];
      const seen = new Set();
      const unique = [];
      for (const item of combined) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRequests(unique);
      setLoading(false);
    };

    const r1 = ref(db, `driverNotifications/${driverUid}`);
    onValue(r1, snap => {
      if (!snap.exists()) { mainList = []; }
      else {
        mainList = Object.values(snap.val()).filter(n => n.type === 'booking_request' || n.type === 'payment_received' || n.type === 'booking_accepted');
      }
      mergeAndSet();
    }, () => { mainList = []; mergeAndSet(); });

    let rFallback = null;
    if (driverUid !== 'demo_driver') {
      rFallback = ref(db, `driverNotifications/demo_driver`);
      onValue(rFallback, snap => {
        if (!snap.exists()) { fallbackList = []; }
        else {
          fallbackList = Object.values(snap.val()).filter(n => n.type === 'booking_request' || n.type === 'payment_received' || n.type === 'booking_accepted');
        }
        mergeAndSet();
      }, () => { fallbackList = []; mergeAndSet(); });
    }

    // Listen to job board
    const r2 = ref(db, 'jobs');
    onValue(r2, snap => {
      if (!snap.exists()) { setJobBoard([]); return; }
      setJobBoard(Object.values(snap.val()).filter(j => j.status === 'open').sort((a,b) => b.createdAt - a.createdAt));
    });
    setTimeout(() => setLoading(false), 3000);
    return () => {
      off(r1);
      if (rFallback) off(rFallback);
      off(r2);
    };
  }, [driverUid]);

  const nearbyJobs = jobBoard.filter(job => {
    if (!location || !job.originLat || !job.originLon) return true;
    return haversine(location.lat, location.lon, job.originLat, job.originLon) <= 200;
  });

  const handleRespond = async (job, accepted) => {
    const uid = getDriverUid();
    const bookingId = job.bookingId || job.id;
    
    // 1. Respond to the booking record
    await respondToBooking(bookingId, uid, accepted);
    
    // 2. Update driver's notification to responded
    await update(ref(db, `driverNotifications/${uid}/${job.id}`), { responded: true, accepted });
    
    // 3. Notify the company
    if (job.companyUid) {
      try {
        const notifRef = push(ref(db, `driverNotifications/${job.companyUid}`));
        await set(notifRef, {
          id: notifRef.key,
          type: accepted ? 'booking_accepted' : 'booking_rejected',
          bookingId,
          title: accepted ? '✅ Driver Accepted!' : '❌ Driver Declined',
          message: accepted
            ? 'Your driver has accepted the booking and is on the way.'
            : 'The driver declined. Please select another driver.',
          read: false,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.warn('Error notifying company:', e);
      }
    }
    
    // 4. Update state to trigger animate/dismiss
    setRequests(prev => prev.map(r => r.id === job.id ? {...r, responded: true, accepted} : r));
    
    // 5. Open payment window if accepted!
    if (accepted) {
      setSelectedPaymentJob(job);
      setPaymentSuccess(false);
      setShowPaymentModal(true);
    } else {
      if (Platform.OS === 'web') {
        window.alert('❌ Declined\n\nBooking declined.');
      } else {
        Alert.alert('Declined', 'Booking declined.');
      }
    }
  };

  const handleApply = async (job) => {
    const uid = getDriverUid();
    if (!uid) { Alert.alert('Error', 'Please login first.'); return; }
    try {
      await update(ref(db, `jobs/${job.id}/applicants/${uid}`), { uid, appliedAt: Date.now(), status: 'pending' });
      const profile = await getDriverProfile();
      const notifRef = push(ref(db, `driverNotifications/${job.companyUid}`));
      await set(notifRef, {
        id: notifRef.key, type: 'job_application', jobId: job.id,
        title: '🙋 Driver Applied for Your Load!',
        message: `${profile?.name || 'A driver'} applied for ${job.origin} → ${job.destination}`,
        driverUid: uid, driverName: profile?.name || 'Driver',
        driverPhone: profile?.phone || '', driverVehicle: profile?.vehicle || '',
        from: job.origin, to: job.destination, read: false, createdAt: Date.now(),
      });
      Alert.alert('✅ Applied!', 'Your application sent to the company!');
    } catch(e) { Alert.alert('Error', 'Could not apply. Try again.'); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 }}>
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 8 }} />
        <Text style={h1}>Jobs</Text>
        <TouchableOpacity onPress={getLocation}>
          <Text style={{ fontSize: fonts.xs, color: location ? colors.green : colors.orange, fontWeight: '700' }}>
            {locLoading ? '📍 Getting location...' : location ? '📍 GPS Active · Showing jobs within 200km' : '📍 Tap to enable GPS for nearby jobs'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {[['requests','🔔 Requests', requests.filter(r=>r.type === 'booking_request' && !r.responded).length], ['board','📋 Job Board', nearbyJobs.length]].map(([id,label,count]) => (
          <TouchableOpacity key={id} onPress={() => setActiveTab(id)}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab===id ? colors.accent : 'transparent' }}>
            <Text style={{ fontSize: fonts.sm, fontWeight: '800', color: activeTab===id ? colors.accent : colors.textSub }}>
              {label}{count > 0 ? ` (${count})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}><ActivityIndicator color={colors.accent} size="large" /><Text style={{ color: colors.textSub, marginTop: 12 }}>Loading...</Text></View>
        ) : activeTab === 'requests' ? (
          requests.filter(r => (r.type === 'booking_request' && !r.responded) || r.type === 'payment_received' || r.type === 'booking_accepted').length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
              <Text style={{ fontSize: fonts.lg, fontWeight: '800', color: colors.text }}>No Requests Yet</Text>
              <Text style={{ fontSize: fonts.sm, color: colors.textSub, textAlign: 'center', marginTop: 8 }}>Direct booking requests from companies appear here.</Text>
            </View>
          ) : requests.filter(r => (r.type === 'booking_request' && !r.responded) || r.type === 'payment_received' || r.type === 'booking_accepted').map((job, i) => {
            if (job.type === 'payment_received' || job.type === 'booking_accepted') {
              const isPayment = job.type === 'payment_received';
              return (
                <Card key={job.id||i} style={{ marginBottom: 14, borderColor: (isPayment ? colors.green : colors.accent)+'44', borderWidth: 2 }}>
                  <View style={{ backgroundColor: (isPayment ? colors.green : colors.accent)+'18', borderRadius: 8, padding: 6, marginBottom: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: fonts.xs, fontWeight: '800', color: isPayment ? colors.green : colors.accent }}>
                      {isPayment ? '💰 PAYMENT CONFIRMED' : '✅ APPLICATION ACCEPTED'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: fonts.md, fontWeight: '900', color: colors.text, marginBottom: 4 }}>{job.title}</Text>
                  <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginBottom: 8 }}>{job.message}</Text>
                  <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>{new Date(job.createdAt).toLocaleString('en-IN')}</Text>
                </Card>
              );
            }
            return (
              <Card key={job.id||i} style={{ marginBottom: 14, borderColor: job.responded ? colors.border : colors.orange+'44', borderWidth: job.responded ? 1.5 : 2 }}>
                {!job.responded && <View style={{ backgroundColor: colors.orange+'18', borderRadius: 8, padding: 6, marginBottom: 10, alignItems: 'center' }}><Text style={{ fontSize: fonts.xs, fontWeight: '800', color: colors.orange }}>🔔 ACTION REQUIRED</Text></View>}
                <Text style={{ fontSize: fonts.md, fontWeight: '900', color: colors.text, marginBottom: 4 }}>{job.from} → {job.to}</Text>
                <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginBottom: 8 }}>{job.material} · From: {job.companyName || 'Company'}</Text>
                <View style={{ backgroundColor: colors.accent+'10', borderRadius: 8, padding: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: fonts.sm, color: colors.textSub }}>💰 Booking Value</Text>
                  <Text style={{ fontSize: fonts.md, fontWeight: '900', color: colors.accent }}>₹{(job.cost||job.estimatedCost||0).toLocaleString()}</Text>
                </View>
                <Text style={{ fontSize: fonts.xs, color: colors.textMuted, marginBottom: 10 }}>{new Date(job.createdAt).toLocaleString('en-IN')}</Text>
                {job.responded ? (
                  <View style={{ padding: 10, alignItems: 'center', backgroundColor: job.accepted ? colors.green+'15' : colors.red+'15', borderRadius: 8 }}>
                    <Text style={{ fontWeight: '700', color: job.accepted ? colors.green : colors.red }}>{job.accepted ? '✅ Accepted' : '❌ Declined'}</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Btn label="✓ Accept" onPress={() => handleRespond(job, true)} style={{ flex: 1 }} />
                    <Btn label="✗ Decline" onPress={() => handleRespond(job, false)} variant="ghost" style={{ flex: 1 }} />
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          nearbyJobs.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
              <Text style={{ fontSize: fonts.lg, fontWeight: '800', color: colors.text }}>No Jobs Nearby</Text>
              <Text style={{ fontSize: fonts.sm, color: colors.textSub, textAlign: 'center', marginTop: 8 }}>{location ? 'No open loads within 200km of your location.' : 'Enable GPS to see jobs near you.'}</Text>
              {!location && <Btn label="📍 Enable GPS" onPress={getLocation} loading={locLoading} style={{ marginTop: 16 }} variant="outline" />}
            </View>
          ) : nearbyJobs.map((job, i) => {
            const distAway = location && job.originLat ? Math.round(haversine(location.lat, location.lon, job.originLat, job.originLon)) : null;
            return (
              <Card key={job.id||i} style={{ marginBottom: 14, borderColor: colors.purple+'33' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fonts.md, fontWeight: '900', color: colors.text }}>{job.origin} → {job.destination}</Text>
                    <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginTop: 2 }}>{job.materialIcon} {job.material} · {job.weight}T · 📅 {job.pickupDate}</Text>
                  </View>
                  {distAway !== null && <View style={{ backgroundColor: colors.green+'18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ fontSize: fonts.xs, color: colors.green, fontWeight: '800' }}>{distAway}km away</Text></View>}
                </View>
                <View style={{ backgroundColor: colors.purple+'10', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>ESTIMATED PAYOUT</Text>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: colors.purple }}>₹{(job.estimatedCost||0).toLocaleString()}</Text>
                    <Text style={{ fontSize: fonts.xs, color: colors.textMuted }}>🛣️ {job.distKm}km · 🏢 {job.companyName}</Text>
                  </View>
                </View>
                {job.notes ? <Text style={{ fontSize: fonts.xs, color: colors.textSub, marginBottom: 10, fontStyle: 'italic' }}>📝 {job.notes}</Text> : null}
                <Btn label="Apply for This Job →" onPress={() => handleApply(job)} />
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Payout & Payment Modal */}
      {selectedPaymentJob && (
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, width: '100%', maxWidth: 440, ...shadow.lg }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 4 }}>💳 Freight Settlement</Text>
              <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>Confirm routing details and authorize payment receipt.</Text>
              
              <Card style={{ marginBottom: 16, backgroundColor: colors.surface2, borderColor: colors.border }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{selectedPaymentJob.from || selectedPaymentJob.origin} → {selectedPaymentJob.to || selectedPaymentJob.destination}</Text>
                <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 4 }}>
                  {selectedPaymentJob.material} · {selectedPaymentJob.weight || '10 tons'}
                </Text>
              </Card>

              <View style={{ gap: 8, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: colors.textSub }}>Base Fare</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>₹{Math.round((selectedPaymentJob.cost || selectedPaymentJob.estimatedCost || 12000) * 0.92).toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: colors.textSub }}>Taxes & Levies (8%)</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>₹{Math.round((selectedPaymentJob.cost || selectedPaymentJob.estimatedCost || 12000) * 0.08).toLocaleString()}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Total Payout Value</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: colors.accent }}>₹{(selectedPaymentJob.cost || selectedPaymentJob.estimatedCost || 12000).toLocaleString()}</Text>
                </View>
              </View>

              {paymentSuccess ? (
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.green, textAlign: 'center' }}>Payout Authorized!</Text>
                  <Text style={{ fontSize: 13, color: colors.textSub, textAlign: 'center', marginTop: 6, marginBottom: 20 }}>
                    Funds have been processed and scheduled for payout to your default payout account.
                  </Text>
                  <Btn label="Close Window" onPress={() => { setShowPaymentModal(false); setSelectedPaymentJob(null); }} style={{ width: '100%' }} />
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <Btn
                    label={processingPayment ? "Settling Funds..." : "Confirm & Collect Payout →"}
                    onPress={async () => {
                      setProcessingPayment(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      setProcessingPayment(false);
                      setPaymentSuccess(true);
                    }}
                    disabled={processingPayment}
                  />
                  <TouchableOpacity
                    onPress={() => { setShowPaymentModal(false); setSelectedPaymentJob(null); }}
                    style={{ padding: 12, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textSub, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// S23 — Earnings
// ═══════════════════════════════════════════════════════════════
export function EarningsScreen({ navigation }) {
  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fuelCost, setFuelCost] = useState('');
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [fuelSlips, setFuelSlips] = useState([]);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingCashOut, setIsSubmittingCashOut] = useState(false);
  const [cashOutRequests, setCashOutRequests] = useState([]);

  const uid = getDriverUid();

  const loadData = () => {
    getDriverProfile().then(setDriver);
    try {
      const tripsRef = ref(db, `driverNotifications/${uid}`);
      onValue(tripsRef, snap => {
        if (!snap.exists()) { setTrips([]); return; }
        const accepted = Object.values(snap.val())
          .filter(n => n.type === 'booking_request' && n.accepted === true);
        setTrips(accepted);
      });

      const fuelRef = ref(db, `driverFuelSlips/${uid}`);
      onValue(fuelRef, snap => {
        if (!snap.exists()) { setFuelSlips([]); return; }
        setFuelSlips(Object.values(snap.val()).reverse());
      });

      const cashoutRef = ref(db, `driverCashOuts/${uid}`);
      onValue(cashoutRef, snap => {
        if (!snap.exists()) { setCashOutRequests([]); return; }
        setCashOutRequests(Object.values(snap.val()).reverse());
      });

      setLoading(false);
    } catch(e) { 
      setTrips([]); 
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEarned = trips.reduce((sum, t) => sum + (t.cost || 0), 0);
  const totalWithdrawn = cashOutRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  
  const availableBalance = Math.max(0, totalEarned - totalWithdrawn);
  const totalTrips = trips.length;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekly = days.map((_, i) => {
    const dayTrips = trips.filter(t => {
      const d = new Date(t.createdAt);
      return d.getDay() === (i + 1) % 7;
    });
    return dayTrips.reduce((sum, t) => sum + (t.cost || 0), 0);
  });
  const maxVal = Math.max(...weekly, 1);

  const handleFuelUpload = async () => {
    if (!fuelCost.trim() || isNaN(fuelCost)) {
      Alert.alert('Invalid Cost', 'Please enter a valid fuel cost amount.');
      return;
    }
    setIsUploadingSlip(true);
    setTimeout(async () => {
      try {
        const newSlipRef = push(ref(db, `driverFuelSlips/${uid}`));
        const slipId = newSlipRef.key;
        await set(newSlipRef, {
          id: slipId,
          amount: parseFloat(fuelCost),
          receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
          createdAt: new Date().toISOString(),
          status: 'pending',
          driverName: driver?.name || 'Driver'
        });
        
        await set(ref(db, `globalFuelSlips/${slipId}`), {
          id: slipId,
          driverUid: uid,
          amount: parseFloat(fuelCost),
          receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
          createdAt: new Date().toISOString(),
          status: 'pending',
          driverName: driver?.name || 'Driver'
        });

        Alert.alert('Fuel Slip Uploaded! ⛽', 'Your fuel slip has been logged and sent to the logistics office for verification.');
        setFuelCost('');
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setIsUploadingSlip(false);
      }
    }, 1500);
  };

  const handleCashOut = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!withdrawAmount.trim() || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid cash-out amount.');
      return;
    }
    if (amt > availableBalance) {
      Alert.alert('Insufficient Balance', 'Requested amount exceeds your available balance.');
      return;
    }
    setIsSubmittingCashOut(true);
    try {
      const newCashoutRef = push(ref(db, `driverCashOuts/${uid}`));
      const cashoutId = newCashoutRef.key;
      const requestData = {
        id: cashoutId,
        driverUid: uid,
        amount: amt,
        status: 'pending',
        createdAt: new Date().toISOString(),
        driverName: driver?.name || 'Driver'
      };
      await set(newCashoutRef, requestData);

      await set(ref(db, `globalCashOuts/${cashoutId}`), requestData);

      Alert.alert('Cash-Out Requested 💳', 'Your payout request is submitted to the finance desk.');
      setWithdrawAmount('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmittingCashOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Earnings & Wallet</Text>
        <Text style={sub}>Track trip revenue, log fuel costs, and request payouts</Text>

        <Card style={{ backgroundColor: colors.accent, marginBottom: 16 }}>
          <Text style={{ fontSize: fonts.xs, color: colors.white + 'BB', fontWeight: '700', letterSpacing: 1.5 }}>AVAILABLE TO WITHDRAW</Text>
          <Text style={{ fontSize: 38, fontWeight: '900', color: colors.white, marginVertical: 4 }}>₹{availableBalance.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: fonts.xs, color: colors.white + 'CC' }}>Total Earned: ₹{totalEarned.toLocaleString()}</Text>
            <Text style={{ fontSize: fonts.xs, color: colors.white + 'CC' }}>Paid Out: ₹{totalWithdrawn.toLocaleString()}</Text>
          </View>
        </Card>

        <Card style={{ marginBottom: 16, padding: 16 }}>
          <SectionLabel label="WITHDRAW EARNINGS" />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Input
              placeholder="Enter amount (₹)"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity
              onPress={handleCashOut}
              disabled={isSubmittingCashOut}
              style={{
                backgroundColor: colors.accent,
                paddingHorizontal: 20,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSubmittingCashOut ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={{ color: colors.white, fontWeight: '800', fontSize: fonts.sm }}>Cash Out 💳</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={{ marginBottom: 16, padding: 16 }}>
          <SectionLabel label="LOG FUEL PURCHASE" />
          <Text style={{ fontSize: fonts.xs, color: colors.textSub, marginBottom: 8 }}>Submit slips to claim corporate fuel refunds</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input
              placeholder="Fuel cost in ₹ (e.g. 4500)"
              value={fuelCost}
              onChangeText={setFuelCost}
              keyboardType="numeric"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity
              onPress={handleFuelUpload}
              disabled={isUploadingSlip}
              style={{
                backgroundColor: colors.purple,
                paddingHorizontal: 16,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6
              }}
            >
              {isUploadingSlip ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={{ fontSize: 16 }}>📸</Text>
                  <Text style={{ color: colors.white, fontWeight: '800', fontSize: fonts.sm }}>Upload Slip</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard icon="📅" value={`₹${(weekly.reduce((a,b)=>a+b,0)/1000).toFixed(1)}K`} label="This Week" color={colors.purple} style={{ flex: 1 }} />
          <StatCard icon="🛣️" value={totalTrips} label="Total Trips" color={colors.blue} style={{ flex: 1 }} />
        </View>

        <Card style={{ marginBottom: 20 }}>
          <SectionLabel label="TRANSACTION & VERIFICATION LOG" />
          
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSub, marginVertical: 8, letterSpacing: 0.5 }}>FUEL REFUNDS ({fuelSlips.length})</Text>
          {fuelSlips.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted, marginVertical: 4 }}>No fuel slips submitted yet.</Text>
          ) : (
            fuelSlips.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
                <View>
                  <Text style={{ fontSize: fonts.base, fontWeight: '750', color: colors.text }}>₹{item.amount.toLocaleString()}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{
                  backgroundColor: item.status === 'approved' ? '#D1FAE5' : (item.status === 'rejected' ? '#FEE2E2' : '#FEF3C7'),
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '900',
                    color: item.status === 'approved' ? '#065F46' : (item.status === 'rejected' ? '#991B1B' : '#92400E')
                  }}>
                    {item.status === 'approved' ? '✓ APPROVED' : (item.status === 'rejected' ? '✕ REJECTED' : '⏳ PENDING')}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSub, marginTop: 14, marginBottom: 8, letterSpacing: 0.5 }}>CASHOUT PAYOUTS ({cashOutRequests.length})</Text>
          {cashOutRequests.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted, marginVertical: 4 }}>No cashouts requested yet.</Text>
          ) : (
            cashOutRequests.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: idx < cashOutRequests.length - 1 ? 1 : 0, borderColor: colors.border }}>
                <View>
                  <Text style={{ fontSize: fonts.base, fontWeight: '750', color: colors.text }}>₹{item.amount.toLocaleString()}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{
                  backgroundColor: item.status === 'approved' ? '#D1FAE5' : '#FEF3C7',
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '900',
                    color: item.status === 'approved' ? '#065F46' : '#991B1B'
                  }}>
                    {item.status === 'approved' ? '✓ PAID OUT' : '⏳ PENDING'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// S24 — Vehicle Status
// ═══════════════════════════════════════════════════════════════
export function VehicleScreen({ navigation }) {
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    getDriverProfile().then(setDriver);
    // Refresh whenever we return to this screen too
    const unsubFocus = navigation.addListener('focus', () => {
      getDriverProfile().then(setDriver);
    });
    return unsubFocus;
  }, [navigation]);

  const vehicleDetails = decodeVehicleNumber(driver?.vehicle, driver);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Vehicle Status</Text>
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 64 }}>🚛</Text>
          <Text style={{ fontSize: fonts.xl, fontWeight: '900', color: colors.text, marginTop: 8 }}>{driver?.vehicle || 'No vehicle added'}</Text>
          {driver?.vehicle ? (
            <>
              <Text style={{ fontSize: fonts.base, fontWeight: '800', color: colors.accent, marginTop: 4 }}>
                {vehicleDetails.make}
              </Text>
              <Text style={{ fontSize: fonts.sm, color: colors.textSub, marginTop: 2 }}>
                Origin: {vehicleDetails.rto} ({vehicleDetails.state})
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: fonts.sm, color: colors.textSub }}>{driver?.vehicleType || 'Heavy'} · {driver?.city || 'N/A'}</Text>
          )}
        </Card>
        {(() => {
          const list = [
            ['🪪 License', driver?.license || 'Not added'],
            ['📍 Base City', driver?.city || 'Not added'],
          ];
          if (driver?.vehicle) {
            list.push(['🚛 Vehicle Model', vehicleDetails.make]);
            list.push(['🏢 RTO Jurisdiction', `${vehicleDetails.rto}, ${vehicleDetails.state}`]);
          }
          list.push(['⏱ Experience', driver?.experience ? `${driver.experience} years` : 'Not added']);
          list.push(['📋 Status', driver?.status || 'Pending']);
          return list.map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fonts.base, color: colors.textSub }}>{k}</Text>
              <Text style={{ fontSize: fonts.base, fontWeight: '700', color: colors.text }}>{v}</Text>
            </View>
          ));
        })()}
        <Btn label="Update Vehicle Details" onPress={() => navigation.navigate('DriverProfileSetup')} style={{ marginTop: 20 }} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}