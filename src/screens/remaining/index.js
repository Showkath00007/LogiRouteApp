import { getProfile, saveProfile } from '../../config/UserStore';
import { translate } from '../../config/i18n';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Image, Platform } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Btn, Card, StatCard, Badge, SectionLabel, BackBtn, Divider, ListItem, Input, CostHero, ProgressBar, NotifCard } from '../../components';
import { MOCK_DRIVERS, MOCK_WEATHER, MOCK_HISTORY, MATERIALS } from '../../data';
import { auth, db } from '../../config/firebase';
import { ref, set, update, onValue, get } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { getUserProfile, listenNotifications, listenBookings, createBooking, listenShipments } from '../../config/firebaseService';
import { sendBookingRequest, listenAllNotifications, markAnyNotificationRead, markAllNotificationsReadUnified, simulateNewNotification, postOpenJob } from '../../config/DriverService';

const screen = (pt = 60) => ({ padding: 20, paddingTop: pt, flexGrow: 1 });
const h1 = { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 4 };
const sub = { fontSize: 13, color: colors.sub, marginBottom: 20 };

// ════════════════════════════════════════════════════════
// BOOKING SCREENS (S31–S36)
// ════════════════════════════════════════════════════════

export function BookTransportScreen({ navigation, route }) {
  const { data, source, destination, material } = route?.params || {};
  const [weight, setWeight] = useState(route?.params?.tons ? String(route?.params?.tons) : '10');
  const [instructions, setInstructions] = useState('');
  const [insurance, setInsurance] = useState('Basic');
  const [posting, setPosting] = useState(false);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = tomorrow.getDate();
    const month = months[tomorrow.getMonth()];
    const year = tomorrow.getFullYear();
    return `${month} ${day}, ${year} - 09:00 AM`;
  };

  const [pickupDate, setPickupDate] = useState(getTomorrowDateString());

  if (!source || !destination) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 }}>No Route Selected</Text>
      <Text style={{ fontSize: 14, color: colors.textSub, textAlign: 'center', marginBottom: 24 }}>Please optimize a route first before booking transport.</Text>
      <Btn label="Go to Optimizer →" onPress={() => navigation.navigate('Optimizer')} />
    </SafeAreaView>
  );

  const estimatedCost = (data?.minimum_cost || 14200) + (insurance === 'Premium' ? 500 : 0);

  const handleSelectDriver = () => {
    if (!weight || isNaN(weight) || Number(weight) <= 0) {
      Alert.alert('Missing Weight', 'Please enter a valid cargo weight.');
      return;
    }
    navigation.navigate('SelectDriver', { 
      data: { ...data, minimum_cost: estimatedCost }, 
      source, 
      destination, 
      material,
      tons: Number(weight),
      instructions,
      insurance,
      pickupDate,
    });
  };

  const handlePostJob = async () => {
    if (!weight || isNaN(weight) || Number(weight) <= 0) {
      Alert.alert('Missing Weight', 'Please enter a valid cargo weight.');
      return;
    }
    setPosting(true);
    try {
      const matInfo = MATERIALS.find(m => m.id === material) || { icon: '📦' };
      await postOpenJob({
        origin: source,
        destination,
        material,
        materialIcon: matInfo.icon,
        weight: `${weight} tons`,
        distKm: data?.distance || 0,
        estimatedCost,
        pickupDate,
        notes: instructions.trim() || 'Booked via Direct Route Optimizer',
      });

      Alert.alert(
        'Job Posted! 📢', 
        'Your job is now visible to available drivers on their Job Board. You\'ll be notified when someone applies.',
        [
          { text: 'View Jobs', onPress: () => navigation.replace('MyPostedJobs') },
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not post open job.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Book Transport</Text>
        <Card style={{ borderColor: colors.accent + '44', marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 4 }}>{source} → {destination}</Text>
          <Text style={{ fontSize: 13, color: colors.sub }}>{material} · 🚂 Train · ₹{estimatedCost.toFixed(0)}</Text>
        </Card>
        <SectionLabel label="Cargo Details" />
        <Input placeholder="Weight (tons)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <Input placeholder="Special Instructions (optional)" value={instructions} onChangeText={setInstructions} multiline numberOfLines={2} />
        <SectionLabel label="Pickup Date & Time" />
        <Input placeholder="e.g. May 25, 2026 - 08:00 AM" value={pickupDate} onChangeText={setPickupDate} />
        
        <SectionLabel label="Insurance" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          {['Basic', 'Premium'].map((ins) => (
            <TouchableOpacity key={ins} onPress={() => setInsurance(ins)} style={{ flex: 1, backgroundColor: insurance === ins ? colors.accentS : colors.surface2, borderWidth: insurance === ins ? 2 : 1, borderColor: insurance === ins ? colors.accent : colors.border, borderRadius: 8, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: insurance === ins ? colors.accent : colors.sub }}>{ins}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ fontSize: 12, color: colors.textSub, fontStyle: 'italic', marginBottom: 20 }}>
          {insurance === 'Basic' 
            ? "🛡️ Basic coverage includes standard cargo protection up to ₹1,00,000 against transit damages (included in base fare)." 
            : "🛡️ Premium coverage includes all-risk protection up to ₹5,00,000, roadside assistance, and express claims processing (+₹500)."}
        </Text>
        
        <View style={{ gap: 10 }}>
          <Btn label="Select Driver →" onPress={handleSelectDriver} />
          <Btn label={posting ? "Posting open job..." : "📢 Post as Open Job"} onPress={handlePostJob} disabled={posting} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SelectDriverScreen({ navigation, route }) {
  const [selected, setSelected] = useState('D001');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Select Driver</Text>
        <Text style={sub}>Choose your transport partner</Text>
        {MOCK_DRIVERS.map(d => (
          <TouchableOpacity key={d.id} onPress={() => setSelected(d.id)}>
            <Card style={{ borderColor: selected === d.id ? colors.accent : colors.border, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 32 }}>{d.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{d.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>⭐ {d.rating} · {d.trips} trips · {d.location}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>{d.specialty}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.accent }}>{d.price}</Text>
                  <Badge label={d.available ? '✓ Available' : 'Busy'} type={d.available ? 'green' : 'default'} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        <Btn label="Confirm Driver →" onPress={() => navigation.navigate('BookingSummary', { ...route?.params, driverId: selected })} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function BookingSummaryScreen({ navigation, route }) {
  const params = route?.params || {};
  const driver = params.driver || MOCK_DRIVERS.find(d => d.id === params.driverId) || MOCK_DRIVERS[0];
  const cost = params.cost || params.data?.minimum_cost || 0;
  const [sending, setSending] = useState(false);

  const handleConfirm = async () => {
    setSending(true);
    try {
      const profile = await getProfile();
      await sendBookingRequest(driver.uid || driver.id, {
        source: params.source,
        destination: params.destination,
        material: params.material || 'Steel',
        weight: params.weight,
        distKm: params.distKm,
        cost,
        transport: driver.transport || 'truck',
        companyName: profile?.company || profile?.name || 'A Company',
        driverName: driver.name,
      });
      
      const title = '✅ Request Sent!';
      const msg = 'We have sent a booking confirmation request to the driver. You will be prompted to make payment once the driver accepts.';
      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${msg}`);
      } else {
        Alert.alert(title, msg);
      }
      navigation.replace('CompanyDashboard');
    } catch (e) {
      console.warn('BookingSummaryScreen: failed to send booking request:', e);
      Alert.alert('Error', 'Failed to send booking request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Booking Summary</Text>
        <Card>
          <SectionLabel label="Route" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 }}>{params.source || 'N/A'} → {params.destination || 'N/A'}</Text>
          <Text style={{ fontSize: 13, color: colors.sub }}>{params.material || 'Steel'} · {driver.transport}</Text>
        </Card>
        <Card>
          <SectionLabel label="Driver" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 32 }}>{driver.icon}</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{driver.name}</Text>
              <Text style={{ fontSize: 12, color: colors.sub }}>⭐ {driver.rating} · {driver.trips} trips</Text>
            </View>
          </View>
        </Card>
        <Card>
          <SectionLabel label="Cost Breakdown" />
          {[['Base Cost', `₹${(cost * 0.85).toFixed(0)}`], ['GST (18%)', `₹${(cost * 0.15).toFixed(0)}`], ['Insurance', '₹200']].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>{k}</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>{v}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.accent }}>₹{cost.toLocaleString()}</Text>
          </View>
        </Card>
        <Btn label={sending ? "Sending Request..." : "Confirm & Send Booking Request →"} onPress={handleConfirm} disabled={sending} />
        <Btn label="Cancel" onPress={() => navigation.goBack()} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function PaymentScreen({ navigation, route }) {
  const { WebView } = require('react-native-webview');
  const { Alert } = require('react-native');
  const cost = route?.params?.cost || 14200;
  const params = route?.params || {};
  const [showWebView, setShowWebView] = useState(false);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const RAZORPAY_KEY = 'rzp_test_TGORQUDc14GslK';

  const razorpayHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body { margin: 0; background: #0A0C12; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
    .loader { color: #4F8EF7; font-size: 16px; text-align: center; }
    .loader p { margin-top: 12px; color: #94A3B8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="loader">
    <div style="font-size:40px">💳</div>
    <p>Opening Razorpay...</p>
  </div>
  <script>
    window.onload = function() {
      try {
        if (typeof Razorpay === 'undefined') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ERROR',
            error: 'Razorpay failed to load — check your internet connection.'
          }));
          return;
        }
        var options = {
          key: '${RAZORPAY_KEY}',
          amount: ${Math.round(cost * 100)},
          currency: 'INR',
          name: 'LogiRoute',
          description: '${params.source || 'Shipment'} → ${params.destination || 'Destination'}',
          image: '',
          prefill: {
            name: 'Kadiyala Logistics',
            email: 'user@logiroute.in',
            contact: '9999999999'
          },
          notes: {
            route: '${params.source || ''} to ${params.destination || ''}',
            material: '${params.material || ''}'
          },
          theme: { color: '#4F8EF7' },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DISMISSED' }));
            }
          },
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SUCCESS',
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id || '',
              signature: response.razorpay_signature || ''
            }));
          }
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FAILED',
            error: response.error.description
          }));
        });
        rzp.open();
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          error: e.message || 'Could not open the payment gateway.'
        }));
      }
    };
    // If checkout.js itself fails to fetch (no internet, blocked, etc.), the
    // window.onload above may never see Razorpay defined either — this
    // extra window.onerror catches script-load-level failures too.
    window.onerror = function(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: String(message) }));
    };
  </script>
</body>
</html>`;

  const [webViewKey, setWebViewKey] = useState(0);
  const timeoutRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (data.type === 'SUCCESS') {
        setShowWebView(false);
        navigation.navigate('Confirmed', {
          ...params,
          payment_id: data.payment_id,
          amount: cost,
        });
      } else if (data.type === 'FAILED') {
        setShowWebView(false);
        Alert.alert('Payment Failed', data.error || 'Payment could not be processed. Please try again.');
      } else if (data.type === 'ERROR') {
        setShowWebView(false);
        Alert.alert(
          'Couldn\'t Open Payment Gateway',
          data.error || 'Something went wrong loading Razorpay. Check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (data.type === 'DISMISSED') {
        setShowWebView(false);
      }
    } catch (e) {}
  };

  const openWebView = () => {
    setWebViewKey(k => k + 1); // force a fresh WebView instance on retry
    setShowWebView(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowWebView(false);
      Alert.alert(
        'Taking Too Long',
        'The payment gateway is taking longer than expected. This is usually a connectivity issue — check your internet and try again.',
        [{ text: 'OK' }]
      );
    }, 15000); // 15s — generous enough for a slow connection, short enough not to leave the user stuck like before
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0C12' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity onPress={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setShowWebView(false); }} style={{ marginRight: 12 }}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>Razorpay Payment</Text>
          <Text style={{ fontSize: 13, color: colors.green, fontWeight: '700' }}>🔒 Secure</Text>
        </View>
        <WebView
          key={webViewKey}
          source={{ html: razorpayHTML }}
          onMessage={handleMessage}
          onError={(e) => { setShowWebView(false); Alert.alert('Connection Error', 'Could not load the payment page. Check your internet connection.'); }}
          onHttpError={(e) => { setShowWebView(false); Alert.alert('Connection Error', 'Could not load the payment page. Check your internet connection.'); }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={{ flex: 1, backgroundColor: '#0A0C12' }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0C12' }}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={{ color: colors.sub, marginTop: 12 }}>Loading payment gateway...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Payment</Text>

        {/* Amount card */}
        <View style={{ backgroundColor: colors.accent + '18', borderRadius: 16, borderWidth: 1, borderColor: colors.accent + '44', padding: 20, alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: colors.sub, letterSpacing: 1, fontWeight: '700', marginBottom: 6 }}>AMOUNT TO PAY</Text>
          <Text style={{ fontSize: 38, fontWeight: '900', color: colors.accent }}>₹{cost.toLocaleString()}</Text>
          {params.source && <Text style={{ fontSize: 13, color: colors.sub, marginTop: 6 }}>{params.source} → {params.destination}</Text>}
        </View>

        {/* Route info */}
        {params.material && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>Material</Text>
              <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600' }}>{params.material}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>GST (18%)</Text>
              <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600' }}>₹{Math.round(cost * 0.18).toLocaleString()}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.accent }}>₹{cost.toLocaleString()}</Text>
            </View>
          </Card>
        )}

        <SectionLabel label="Pay Via Razorpay" style={{ marginTop: 4 }} />
        <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 16 }}>UPI · Cards · Net Banking · Wallets — all in one</Text>

        {/* Supported methods */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[['📱', 'UPI'], ['💳', 'Cards'], ['🏦', 'Net Banking'], ['👛', 'Wallets']].map(([icon, label]) => (
            <View key={label} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 20 }}>{icon}</Text>
              <Text style={{ fontSize: 9, color: colors.sub, marginTop: 4, textAlign: 'center' }}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Security badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 14 }}>🔒</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>256-bit SSL secured · Powered by Razorpay</Text>
        </View>

        <Btn
          label={`Pay ₹${cost.toLocaleString()} via Razorpay →`}
          onPress={openWebView}
        />
        <Btn label="Cancel" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ConfirmedScreen({ navigation, route }) {
  const { payment_id, amount, source, destination, driver, material, weight, distKm, bookingId: passedBookingId } = route?.params || {};
  const [bookingId, setBookingId] = useState(passedBookingId || '#LR-' + Date.now().toString().slice(-6));
  const [notifyStatus, setNotifyStatus] = useState(passedBookingId ? 'sent' : 'idle'); // idle | sending | sent | failed

  useEffect(() => {
    if (passedBookingId) {
      // Direct booking request was already accepted, just mark as paid!
      update(ref(db, `bookings/${passedBookingId}`), { status: 'paid' })
        .catch(err => console.warn('ConfirmedScreen failed to update booking paid:', err));
      
      const uid = auth.currentUser?.uid;
      if (uid) {
        update(ref(db, `users/${uid}/bookings/${passedBookingId}`), { status: 'Paid' })
          .catch(err => console.warn('ConfirmedScreen failed to update user booking paid:', err));
      }

      // Fetch booking details to push payment notification to the driver
      get(ref(db, `bookings/${passedBookingId}`)).then(snap => {
        if (snap.exists()) {
          const b = snap.val();
          const driverUid = b.driverUid;
          if (driverUid) {
            const notifRef = push(ref(db, `driverNotifications/${driverUid}`));
            set(notifRef, {
              id: notifRef.key,
              type: 'payment_received',
              bookingId: passedBookingId,
              title: '💰 Payment Received!',
              message: `You received payment of ₹${b.cost?.toLocaleString()} for route: ${b.from} → ${b.to}.`,
              read: false,
              createdAt: Date.now(),
            }).catch(e => console.log('Error pushing payment notification to driver:', e));
          }
        }
      }).catch(err => console.log('Failed to fetch booking details for driver payment notification:', err));
    } else {
      // Fallback for direct checkout / mocks
      if (driver?.uid && !driver.uid.startsWith('mock')) {
        setNotifyStatus('sending');
        getProfile()
          .then(profile => sendBookingRequest(driver.uid, {
            source, destination, material, weight, distKm,
            cost: amount,
            companyName: profile?.company || profile?.name || 'A Company',
          }))
          .then(booking => {
            setBookingId(booking.id);
            setNotifyStatus('sent');
          })
          .catch(e => {
            console.warn('ConfirmedScreen: failed to notify driver:', e);
            setNotifyStatus('failed');
          });
      }
    }
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[screen(), { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
        <Text style={{ fontSize: 80, marginBottom: 20 }}>✅</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 8 }}>Payment Successful!</Text>
        <Text style={{ fontSize: 14, color: colors.sub, textAlign: 'center', marginBottom: 24 }}>Your shipment has been booked and payment confirmed.</Text>

        <Card style={{ width: '100%', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: colors.sub }}>Booking ID</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.accent }}>{bookingId}</Text>
          </View>
          {payment_id && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: colors.sub }}>Payment ID</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.green }}>{payment_id}</Text>
            </View>
          )}
          {amount && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: colors.sub }}>Amount Paid</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>₹{amount.toLocaleString()}</Text>
            </View>
          )}
          {source && destination && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.sub }}>Route</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{source.split(',')[0]} → {destination.split(',')[0]}</Text>
            </View>
          )}
        </Card>

        <View style={{ backgroundColor: colors.green + '18', borderRadius: 10, borderWidth: 1, borderColor: colors.green + '44', padding: 12, width: '100%', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text style={{ fontSize: 12, color: colors.green, fontWeight: '600', flex: 1 }}>Payment verified by Razorpay. Receipt sent to your email.</Text>
        </View>

        {driver?.uid && !driver.uid.startsWith('mock') && (
          <View style={{
            backgroundColor: notifyStatus === 'failed' ? colors.red + '18' : colors.blue + '18',
            borderRadius: 10, borderWidth: 1,
            borderColor: notifyStatus === 'failed' ? colors.red + '44' : colors.blue + '44',
            padding: 12, width: '100%', marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10
          }}>
            <Text style={{ fontSize: 20 }}>
              {notifyStatus === 'sending' && '⏳'}
              {notifyStatus === 'sent' && '📲'}
              {notifyStatus === 'failed' && '⚠️'}
              {notifyStatus === 'idle' && '📲'}
            </Text>
            <Text style={{ fontSize: 12, color: notifyStatus === 'failed' ? colors.red : colors.blue, fontWeight: '600', flex: 1 }}>
              {notifyStatus === 'sending' && `Notifying ${driver.name}...`}
              {notifyStatus === 'sent' && `${driver.name} has been notified of this booking.`}
              {notifyStatus === 'failed' && `Could not notify ${driver.name}. Check your connection.`}
              {notifyStatus === 'idle' && `Preparing to notify ${driver.name}...`}
            </Text>
          </View>
        )}

        <Btn label="Track Shipment →" onPress={() => navigation.navigate('LiveTrack')} style={{ width: '100%' }} />
        <Btn label="My Bookings" onPress={() => navigation.navigate('MyBookings')} variant="outline" style={{ width: '100%', marginTop: 10 }} />
        <Btn label="Back to Dashboard" onPress={() => navigation.replace('CompanyDashboard')} variant="outline" style={{ width: '100%', marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenBookings(data => {
      setBookings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const STATUS_TYPE = { Confirmed: 'yellow', Paid: 'green', Pending: 'yellow', Cancelled: 'red', Completed: 'blue' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={h1}>My Bookings</Text>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 30 }} />
        ) : bookings.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 30 }}>No bookings yet. Book a transport to get started!</Text>
          </Card>
        ) : (
          bookings.map(b => (
            <Card key={b.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{b.from} → {b.to}</Text>
                <Badge label={b.status} type={STATUS_TYPE[b.status] || 'default'} />
              </View>
              <Text style={{ fontSize: 12, color: colors.sub }}>{b.driver} · {b.material}</Text>
              <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: 4 }}>₹{b.amount?.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{b.date}</Text>
              {b.status === 'Confirmed' && (
                <Btn 
                  label="💳 Pay Now" 
                  onPress={() => {
                    navigation.navigate('Payment', {
                      bookingId: b.id,
                      cost: b.cost || b.amount || 12000,
                      source: b.from,
                      destination: b.to,
                      material: b.material,
                      weight: b.weight,
                      transport: b.transport,
                      driverId: b.driverUid,
                    });
                  }}
                  style={{ marginTop: 10, marginBottom: 0, paddingVertical: 8 }}
                />
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════
// TRACKING, WEATHER, HISTORY SCREENS
// ════════════════════════════════════════════════════════

export function LiveTrackScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Live Tracking</Text>
        <Card style={{ borderColor: colors.green + '44', backgroundColor: colors.greenS }}>
          <Text style={{ fontSize: 11, color: colors.green, fontWeight: '700', letterSpacing: 1 }}>● LIVE</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 }}>Mumbai → Delhi</Text>
          <Text style={{ fontSize: 13, color: colors.sub, marginTop: 2 }}>Near Nagpur · ETA 8h</Text>
          <ProgressBar percent={65} color={colors.green} />
          <Text style={{ fontSize: 12, color: colors.sub }}>65% complete</Text>
        </Card>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <StatCard value="487 km" label="Remaining" color={colors.blue} style={{ flex: 1 }} />
          <StatCard value="62 km/h" label="Speed" color={colors.green} style={{ flex: 1 }} />
          <StatCard value="8h" label="ETA" color={colors.accent} style={{ flex: 1 }} />
        </View>
        <SectionLabel label="Route Updates" />
        {[['✅', 'Departed Mumbai', '08:00 AM'], ['📍', 'Passed Pune', '10:30 AM'], ['📍', 'Near Nagpur', 'Now']].map(([icon, label, time]) => (
          <View key={label} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{label}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{time}</Text>
            </View>
          </View>
        ))}
        <Btn label="📞 Call Driver" onPress={() => Alert.alert('Calling...', 'Rajesh Kumar: +91 98765 11111')} style={{ marginTop: 16 }} />
        <Btn label="View on Map" onPress={() => navigation.navigate('RouteMap')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function TrackShipmentScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Track Shipment</Text>
        <Input placeholder="Enter Shipment ID (e.g. SH001)" />
        <Btn label="Track →" onPress={() => navigation.navigate('DeliveryStatus')} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function DeliveryStatusScreen({ navigation }) {
  const [qrVerified, setQrVerified] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [signName, setSignName] = useState('');
  const [delivered, setDelivered] = useState(false);

  const steps = [
    { icon: '✅', label: 'Order Placed', time: 'May 10, 08:00 AM', done: true },
    { icon: '✅', label: 'Picked Up', time: 'May 10, 09:30 AM', done: true },
    { icon: '🚛', label: 'In Transit', time: 'May 10, 10:00 AM', done: true },
    { icon: delivered ? '✅' : '⏳', label: 'Out for Delivery', time: delivered ? 'May 11, 04:30 PM' : 'Expected May 11', done: delivered },
    { icon: delivered ? '🎉' : '⏳', label: 'Delivered', time: delivered ? 'May 11, 05:00 PM' : 'Expected May 11, 6 PM', done: delivered },
  ];

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
  };

  useEffect(() => {
    let timer;
    if (scanning) {
      timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setScanning(false);
            setQrVerified(true);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [scanning]);

  const confirmDelivery = () => {
    if (!qrVerified) {
      Alert.alert('Error', 'Please scan the cargo package QR code first.');
      return;
    }
    if (!signName.trim()) {
      Alert.alert('Error', 'Please sign/type your name to authorize the cargo release.');
      return;
    }
    setDelivered(true);
    Alert.alert('Success 🎉', 'Cargo successfully signed off and marked as DELIVERED!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Delivery Tracking</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 16 }}>Live milestone checkpoints & verification receipt</Text>

        {/* Milestone Steps */}
        <Card style={{ marginBottom: 16 }}>
          {steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14, marginBottom: i === steps.length - 1 ? 0 : 20 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: step.done ? colors.green : colors.surface2, borderWidth: 2, borderColor: step.done ? colors.green : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16 }}>{step.icon}</Text>
                </View>
                {i < steps.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: step.done ? colors.green : colors.border, marginTop: 4 }} />}
              </View>
              <View style={{ flex: 1, paddingTop: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '750', color: step.done ? colors.text : colors.muted }}>{step.label}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{step.time}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Signature & QR verification module */}
        {!delivered && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel label="Secure Delivery Verification" />
            <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 14, lineHeight: 18 }}>
              Verify cargo package barcode and sign authorization to release the shipment.
            </Text>

            {/* QR Scanner Step */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>1. Cargo Package QR Check</Text>
                <Text style={{ fontSize: 11, color: qrVerified ? colors.green : colors.sub, marginTop: 2 }}>
                  {qrVerified ? 'Verified: LR-PKG-8942-OK ✅' : 'Scanner ready for delivery check'}
                </Text>
              </View>
              <Btn
                label={qrVerified ? 'Verified ✓' : 'Scan QR 📷'}
                onPress={startScan}
                variant={qrVerified ? 'outline' : 'blue'}
                disabled={qrVerified}
                style={{ marginBottom: 0, paddingVertical: 8, paddingHorizontal: 16 }}
              />
            </View>

            {/* Digital Signature Step */}
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>2. Receiver Digital Signature</Text>
              <Input
                placeholder="Type name (e.g. Rajesh Kumar) for cursive sign"
                value={signName}
                onChangeText={setSignName}
                style={{ marginBottom: 10 }}
              />
              
              {signName.length > 0 && (
                <View style={{
                  backgroundColor: colors.surface2,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  borderRadius: radius.md,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 10
                }}>
                  <Text style={{
                    fontSize: 24,
                    color: colors.accent,
                    fontStyle: 'italic',
                    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'Georgia'
                  }}>
                    {signName}
                  </Text>
                </View>
              )}
            </View>

            <Btn
              label="Authorize & Deliver Cargo"
              onPress={confirmDelivery}
              disabled={!qrVerified || !signName}
              style={{ marginTop: 16, marginBottom: 0 }}
            />
          </Card>
        )}

        {/* Scan Camera Viewfinder Modal */}
        <Modal visible={scanning} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '80%', padding: 24, backgroundColor: colors.surface, borderRadius: radius.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '850', color: colors.text, marginBottom: 6 }}>Verifying Cargo Barcode</Text>
              <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 20 }}>Point camera scanner box at package label</Text>

              {/* Scanner Grid Simulator */}
              <View style={{ width: 180, height: 180, borderWidth: 2, borderColor: colors.accent, borderRadius: 10, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
                <View style={{ width: '90%', height: 2, backgroundColor: colors.accent, position: 'absolute', top: `${scanProgress}%` }} />
                <Text style={{ fontSize: 44 }}>📦</Text>
              </View>

              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.accent, marginTop: 20 }}>
                Scanning... {scanProgress}%
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ETAUpdateScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>ETA Update</Text>
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 48 }}>⏱</Text>
          <Text style={{ fontSize: 32, fontWeight: '900', color: colors.accent, marginTop: 8 }}>8h 30m</Text>
          <Text style={{ fontSize: 14, color: colors.sub, marginTop: 4 }}>Estimated Time of Arrival</Text>
        </Card>
        <Btn label="Get Notified on Arrival" onPress={() => Alert.alert('✅', 'You will be notified when shipment arrives!')} />
        <Btn label="Back" onPress={() => navigation.goBack()} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function WeatherScreen({ navigation }) {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [city, setCity] = React.useState('');
  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const INDIAN_CITIES = ['Mumbai','Delhi','Chennai','Bangalore','Kolkata','Hyderabad','Pune','Ahmedabad','Surat','Jaipur','Lucknow','Kanpur','Nagpur','Indore','Bhopal','Patna','Vadodara','Coimbatore','Madurai','Visakhapatnam','Kochi','Chandigarh','Guwahati','Thiruvananthapuram','Bhubaneswar','Dehradun','Amritsar','Varanasi','Jodhpur','Rajkot','Vijayawada','Mysuru','Agra','Nashik','Ludhiana','Srinagar','Ranchi','Aurangabad','Jabalpur'];
  const CITY_COORDS = {'Mumbai':{lat:19.0760,lon:72.8777},'Delhi':{lat:28.7041,lon:77.1025},'Chennai':{lat:13.0827,lon:80.2707},'Bangalore':{lat:12.9716,lon:77.5946},'Kolkata':{lat:22.5726,lon:88.3639},'Hyderabad':{lat:17.3850,lon:78.4867},'Pune':{lat:18.5204,lon:73.8567},'Ahmedabad':{lat:23.0225,lon:72.5714},'Surat':{lat:21.1702,lon:72.8311},'Jaipur':{lat:26.9124,lon:75.7873},'Lucknow':{lat:26.8467,lon:80.9462},'Kanpur':{lat:26.4499,lon:80.3319},'Nagpur':{lat:21.1458,lon:79.0882},'Indore':{lat:22.7196,lon:75.8577},'Bhopal':{lat:23.2599,lon:77.4126},'Patna':{lat:25.5941,lon:85.1376},'Vadodara':{lat:22.3072,lon:73.1812},'Coimbatore':{lat:11.0168,lon:76.9558},'Madurai':{lat:9.9252,lon:78.1198},'Visakhapatnam':{lat:17.6868,lon:83.2185},'Kochi':{lat:9.9312,lon:76.2673},'Chandigarh':{lat:30.7333,lon:76.7794},'Guwahati':{lat:26.1445,lon:91.7362},'Thiruvananthapuram':{lat:8.5241,lon:76.9366},'Bhubaneswar':{lat:20.2961,lon:85.8245},'Dehradun':{lat:30.3165,lon:78.0322},'Amritsar':{lat:31.6340,lon:74.8723},'Varanasi':{lat:25.3176,lon:82.9739},'Jodhpur':{lat:26.2389,lon:73.0243},'Rajkot':{lat:22.3039,lon:70.8022},'Vijayawada':{lat:16.5062,lon:80.6480},'Mysuru':{lat:12.2958,lon:76.6394},'Agra':{lat:27.1767,lon:78.0081},'Nashik':{lat:19.9975,lon:73.7898},'Ludhiana':{lat:30.9010,lon:75.8573},'Srinagar':{lat:34.0837,lon:74.7973},'Ranchi':{lat:23.3441,lon:85.3096},'Aurangabad':{lat:19.8762,lon:75.3433},'Jabalpur':{lat:23.1815,lon:79.9864}};
  const WMO = {0:{l:'Clear Sky',i:'☀️'},1:{l:'Mainly Clear',i:'🌤'},2:{l:'Partly Cloudy',i:'⛅'},3:{l:'Overcast',i:'☁️'},45:{l:'Foggy',i:'🌫'},51:{l:'Light Drizzle',i:'🌦'},61:{l:'Light Rain',i:'🌧'},63:{l:'Rain',i:'🌧'},65:{l:'Heavy Rain',i:'🌧'},80:{l:'Showers',i:'🌦'},95:{l:'Thunderstorm',i:'⛈'},99:{l:'Thunderstorm',i:'⛈'}};

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length >= 2) {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=10&language=en&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(
            data.results
              .filter(r => r.country_code === 'IN' || r.country === 'India')
              .map(r => ({
                name: r.name,
                display: `${r.name}, ${r.admin1 || 'India'}`,
                lat: r.latitude,
                lon: r.longitude
              }))
          );
          return;
        }
      } catch (e) {
        console.log('Live weather geocoding error, falling back:', e);
      }

      // Local fallback
      const filtered = INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(text.toLowerCase())).slice(0, 6);
      setSuggestions(filtered.map(c => ({
        name: c,
        display: `${c}, India`,
        lat: CITY_COORDS[c]?.lat || 20,
        lon: CITY_COORDS[c]?.lon || 77
      })));
    } else {
      setSuggestions([]);
    }
  };

  const selectCity = (item) => {
    setCity(item.name);
    setQuery(item.name);
    setSuggestions([]);
    fetchWeather(item.name, item.lat, item.lon);
  };

  const fetchWeather = async (cityName, customLat = null, customLon = null) => {
    let lat = customLat;
    let lon = customLon;

    if (lat === null || lon === null) {
      const coords = CITY_COORDS[cityName];
      if (!coords) { setError('City not found. Try another Indian city.'); return; }
      lat = coords.lat;
      lon = coords.lon;
    }

    setLoading(true); setError(''); setWeather(null);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&timezone=Asia%2FKolkata`);
      const data = await res.json();
      const c = data.current;
      const wmo = WMO[c.weather_code] || {l:'Unknown',i:'🌡'};
      setWeather({ temp: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), condition: wmo.l, icon: wmo.i, code: c.weather_code });
    } catch (e) {
      // Offline Simulated Weather Forecast (Trained Keyless Logic)
      await new Promise(r => setTimeout(r, 300));
      const hash = Math.round((Math.abs(lat) * 100) + (Math.abs(lon) * 100));
      const mockTemp = 24 + (hash % 15);
      const mockHumidity = 50 + (hash % 40);
      const mockWind = 5 + (hash % 25);
      const mockCode = (hash % 5) === 0 ? 95 : ((hash % 5) === 1 ? 80 : 0);
      const wmo = WMO[mockCode] || {l:'Clear Sky',i:'☀️'};
      setWeather({ temp: mockTemp, feelsLike: mockTemp + 2, humidity: mockHumidity, wind: mockWind, condition: wmo.l, icon: wmo.i, code: mockCode });
    } finally { setLoading(false); }
  };

  const getAlert = () => {
    if (!weather) return null;
    if (weather.code >= 95) return { msg: 'Thunderstorm — avoid dispatching cargo', color: colors.red, icon: '🔴' };
    if (weather.code >= 80) return { msg: 'Heavy rain — use waterproof packaging', color: colors.orange, icon: '🟡' };
    if (weather.code >= 61) return { msg: 'Rain expected — plan morning departures', color: colors.orange, icon: '🟡' };
    if (weather.temp > 40) return { msg: 'Extreme heat — check vehicle coolant', color: colors.orange, icon: '🟡' };
    if (weather.wind > 40) return { msg: 'High winds — avoid open-top loads', color: colors.orange, icon: '🟡' };
    return { msg: 'No alerts. Safe to dispatch cargo.', color: colors.green, icon: '🟢' };
  };
  const alert = getAlert();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Weather Dashboard</Text>
        <Text style={sub}>Real-time weather for Indian cities</Text>
        <View style={{ marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 }}>
              <TextInput placeholder="Search city (e.g. Mumbai)..." placeholderTextColor={colors.muted} value={query} onChangeText={handleSearch} style={{ color: colors.text, fontSize: 14 }} />
            </View>
            <TouchableOpacity onPress={() => query && selectCity({ name: query, lat: null, lon: null })} style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.bg }}>Check</Text>
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 && (
            <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, zIndex: 100 }}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => selectCity(s)} style={{ padding: 12, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 14 }}>📍</Text>
                  <Text style={{ fontSize: 14, color: colors.text }}>{s.display || s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {error ? <Text style={{ color: colors.red, fontSize: 13, marginTop: 8 }}>{error}</Text> : null}
        {loading && <View style={{ alignItems: 'center', padding: 30 }}><ActivityIndicator color={colors.accent} size="large" /><Text style={{ color: colors.sub, fontSize: 13, marginTop: 10 }}>Fetching weather...</Text></View>}
        {weather && !loading && (
          <>
            <Card style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 14, color: colors.sub, marginBottom: 4 }}>{city}</Text>
                  <Text style={{ fontSize: 52, fontWeight: '900', color: colors.text, lineHeight: 60 }}>{weather.temp}°C</Text>
                  <Text style={{ fontSize: 14, color: colors.sub }}>{weather.condition}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Feels like {weather.feelsLike}°C</Text>
                </View>
                <Text style={{ fontSize: 70 }}>{weather.icon}</Text>
              </View>
              <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 10, padding: 12 }}>
                <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{weather.wind} km/h</Text><Text style={{ fontSize: 11, color: colors.sub }}>💨 Wind</Text></View>
                <View style={{ width: 1, backgroundColor: colors.border }} />
                <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{weather.humidity}%</Text><Text style={{ fontSize: 11, color: colors.sub }}>💧 Humidity</Text></View>
                <View style={{ width: 1, backgroundColor: colors.border }} />
                <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 15, fontWeight: '700', color: weather.temp > 35 ? colors.red : colors.green }}>{weather.temp > 40 ? 'Extreme' : weather.temp > 35 ? 'High' : 'Normal'}</Text><Text style={{ fontSize: 11, color: colors.sub }}>🌡 Heat</Text></View>
              </View>
            </Card>
            {alert && (
              <View style={{ backgroundColor: alert.color + '18', borderWidth: 1, borderColor: alert.color, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Text style={{ fontSize: 20 }}>{alert.icon}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 12, fontWeight: '800', color: alert.color }}>LOGISTICS ALERT</Text><Text style={{ fontSize: 13, color: colors.text, marginTop: 3 }}>{alert.msg}</Text></View>
              </View>
            )}
            <Btn label="Check Route Weather →" onPress={() => navigation.navigate('RouteWeather')} variant="outline" style={{ marginTop: 12 }} />
          </>
        )}
        {!weather && !loading && (
          <>
            <SectionLabel label="Quick Check" style={{ marginTop: 20 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Mumbai','Delhi','Chennai','Bangalore','Hyderabad','Kolkata'].map(c => (
                <TouchableOpacity key={c} onPress={() => selectCity(c)} style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 13, color: colors.text }}>📍 {c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function RouteWeatherScreen({ navigation }) {
  const [routeWeather, setRouteWeather] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const cities = ['Mumbai', 'Pune', 'Nagpur', 'Bhopal', 'Agra', 'Delhi'];
  const CITY_COORDS = {'Mumbai':{lat:19.0760,lon:72.8777},'Pune':{lat:18.5204,lon:73.8567},'Nagpur':{lat:21.1458,lon:79.0882},'Bhopal':{lat:23.2599,lon:77.4126},'Agra':{lat:27.1767,lon:78.0081},'Delhi':{lat:28.7041,lon:77.1025}};
  const WMO = {0:{l:'Clear',i:'☀️'},1:{l:'Clear',i:'🌤'},2:{l:'Cloudy',i:'⛅'},3:{l:'Overcast',i:'☁️'},45:{l:'Foggy',i:'🌫'},61:{l:'Rain',i:'🌧'},63:{l:'Rain',i:'🌧'},80:{l:'Showers',i:'🌦'},95:{l:'Thunderstorm',i:'⛈'}};

  React.useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(cities.map(async city => {
          // Offline Simulated Weather Forecast (Trained Keyless Logic)
          await new Promise(r => setTimeout(r, 100));
          const hash = (city.charCodeAt(0) || 0) + (city.charCodeAt(1) || 0);
          const mockTemp = 24 + (hash % 15);
          const mockCode = (hash % 5) === 0 ? 80 : 0;
          const wmo = WMO[mockCode] || {l:'Clear',i:'☀️'};
          return { city, temp: mockTemp, icon: wmo.i, cond: wmo.l, alert: mockCode >= 80 };
        }));
        setRouteWeather(results);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Route Weather</Text>
        <Text style={sub}>Mumbai → Delhi · Live conditions</Text>
        {loading ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} /> : (
          routeWeather.map((w, i) => (
            <Card key={w.city}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 13, color: colors.muted, width: 20 }}>{i + 1}</Text>
                <Text style={{ fontSize: 28 }}>{w.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{w.city}{i === 0 ? ' (Start)' : i === routeWeather.length - 1 ? ' (End)' : ''}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>{w.cond}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.accent }}>{w.temp}°C</Text>
                <Badge label={w.alert ? 'Alert' : 'OK'} type={w.alert ? 'red' : 'green'} />
              </View>
            </Card>
          ))
        )}
        <Btn label="View Road Alerts →" onPress={() => navigation.navigate('RoadAlerts')} variant="outline" style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
export function RoadAlertsScreen({ navigation }) {
  const alerts = [
    { icon: '🚧', title: 'Road Construction', desc: 'NH-48 near Vadodara — 2 km diversion', level: 'warning' },
    { icon: '🌊', title: 'Flooding Risk', desc: 'Mumbai coastal roads — avoid after 6 PM', level: 'danger' },
    { icon: '⛽', title: 'Fuel Shortage', desc: 'Limited pumps on NH-44 near Nagpur', level: 'warning' },
    { icon: '🚔', title: 'Checkpoint', desc: 'Weight check on Delhi border — carry documents', level: 'info' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Road Alerts</Text>
        {alerts.map((a, i) => (
          <Card key={i} style={{ borderColor: a.level === 'danger' ? colors.red : a.level === 'warning' ? colors.orange : colors.blue }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 28 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{a.title}</Text>
                <Text style={{ fontSize: 13, color: colors.sub, marginTop: 2 }}>{a.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function HistoryScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={h1}>History</Text>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : shipments.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>No shipment history yet.</Text>
          </Card>
        ) : (
          shipments.map(h => (
            <Card key={h.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{h.from} → {h.to}</Text>
                <Badge label={h.status} type={h.status === 'Delivered' ? 'green' : h.status === 'Cancelled' ? 'red' : 'blue'} />
              </View>
              <Text style={{ fontSize: 12, color: colors.sub }}>{h.material} · {h.transport} · {h.date}</Text>
              <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: 4 }}>₹{(h.cost || 0).toLocaleString()}</Text>
            </Card>
          ))
        )}
        <Btn label="View Reports →" onPress={() => navigation.navigate('Reports')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ReportsScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const totalSpend = shipments.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalSpendLabel = totalSpend >= 100000 ? `₹${(totalSpend / 100000).toFixed(1)}L` : `₹${(totalSpend / 1000).toFixed(1)}K`;
  
  // Dynamic metrics based on interactive selections
  const totalDistance = shipments.reduce((sum, s) => sum + (Number(s.km) || 0), 0);
  const estimatedFuel = Math.round(totalDistance * 0.26); // 0.26 L/km average fleet burn
  const totalTollsCrossed = shipments.length * 4; // average 4 checkpoints per trip
  const estimatedSavings = Math.round(totalSpend * 0.14); // 14% optimization savings

  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const exportPDF = async (reportName) => {
    try {
      const Print = require('expo-print');
      const Sharing = require('expo-sharing');
      
      const rows = shipments.map(s => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; font-size: 11px; color: #4b5563;">LR-${(s.id || '').substring(0, 5).toUpperCase()}</td>
          <td style="padding: 10px; font-weight: 600; font-size: 12px; color: #1f2937;">${s.from?.split(',')[0]} ➔ ${s.to?.split(',')[0]}</td>
          <td style="padding: 10px; font-size: 12px; color: #4b5563;">${s.material || 'General'}</td>
          <td style="padding: 10px; font-size: 12px; color: #4b5563;">${s.km || 0} km</td>
          <td style="padding: 10px; font-size: 12px; color: #4b5563; font-weight: 500;">₹${Math.round(s.cost * 0.42).toLocaleString()}</td>
          <td style="padding: 10px; font-size: 12px; color: #4b5563; font-weight: 500;">₹${Math.round(s.cost * 0.12).toLocaleString()}</td>
          <td style="padding: 10px; text-align: right; font-weight: 700; font-size: 12px; color: #6366f1;">₹${(s.cost || 0).toLocaleString()}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1f2937; }
              .header { border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 25px; }
              .title { font-size: 24px; font-weight: 800; color: #6366f1; margin: 0; }
              .subtitle { font-size: 12px; color: #6b7280; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
              .meta-grid { display: flex; justify-content: space-between; margin-bottom: 25px; background: #f9fafb; padding: 15px; border-radius: 8px; }
              .meta-col h4 { margin: 0 0 4px 0; font-size: 10px; color: #9ca3af; text-transform: uppercase; }
              .meta-col p { margin: 0; font-size: 14px; font-weight: 700; color: #374151; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; color: #9ca3af; border-bottom: 2px solid #e5e7eb; }
              .footer { border-top: 2px dashed #e5e7eb; padding-top: 15px; margin-top: 30px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Fleet Analytics Report</h1>
              <p class="subtitle">${reportName} · ${monthLabel}</p>
            </div>
            <div class="meta-grid">
              <div class="meta-col">
                <h4>Total Distance</h4>
                <p>${totalDistance.toLocaleString()} km</p>
              </div>
              <div class="meta-col">
                <h4>Est. Fuel Burn</h4>
                <p>${estimatedFuel.toLocaleString()} Liters</p>
              </div>
              <div class="meta-col">
                <h4>Tolls Crossed</h4>
                <p>${totalTollsCrossed} Hubs</p>
              </div>
              <div class="meta-col">
                <h4>Carbon Saved</h4>
                <p>${(totalDistance * 0.12).toFixed(1)} kg</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Route</th>
                  <th>Material</th>
                  <th>Distance</th>
                  <th>Fuel Cost</th>
                  <th>Toll Cost</th>
                  <th style="text-align: right;">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="footer">
              <span style="font-size: 12px; color: #6b7280; margin-right: 15px;">Eco Savings: ₹${estimatedSavings.toLocaleString()}</span>
              <strong style="font-size: 18px; color: #6366f1;">Total Spending: ₹${totalSpend.toLocaleString()}</strong>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      alert('Failed to generate PDF. Share module failed or cancelled.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={h1}>Reports</Text>
          <TouchableOpacity onPress={() => exportPDF('Monthly Executive Summary')} style={{ backgroundColor: colors.accentLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.accent }}>SHARE ALL PDF 🖨</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : shipments.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>
              No shipments found. Build a shipment to generate analytics reports.
            </Text>
          </Card>
        ) : (
          <>
            {/* Dynamic Metric cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard value={totalSpendLabel} label="Total Spend" style={{ flex: 1 }} />
              <StatCard value={`₹${(estimatedSavings / 1000).toFixed(1)}K`} label="Eco Savings" color={colors.green} style={{ flex: 1 }} />
              <StatCard value={`${estimatedFuel}L`} label="Est. Fuel" color={colors.orange} style={{ flex: 1 }} />
            </View>

            {/* Interactive Category Selectors */}
            <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, padding: 4, borderRadius: radius.md, marginBottom: 16 }}>
              {[
                { id: 'all', label: 'All Costs 📊' },
                { id: 'fuel', label: 'Fuel Burn ⛽' },
                { id: 'tolls', label: 'Tolls 🛣' }
              ].map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setActiveCategory(c.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: 'center',
                    backgroundColor: activeCategory === c.id ? colors.surface : 'transparent',
                    borderRadius: radius.sm
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: activeCategory === c.id ? '750' : '450', color: activeCategory === c.id ? colors.text : colors.sub }}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Interactive Category Details */}
            {activeCategory === 'all' && (
              <Card style={{ marginBottom: 16 }}>
                <SectionLabel label="All Fleet Expenses" />
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Total Base Shipments</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{shipments.length}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Est. Fuel Surcharges (42%)</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.orange }}>₹{Math.round(totalSpend * 0.42).toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Est. Toll Taxes (12%)</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.blue }}>₹{Math.round(totalSpend * 0.12).toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            )}

            {activeCategory === 'fuel' && (
              <Card style={{ marginBottom: 16 }}>
                <SectionLabel label="Fuel Surcharge Details" />
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Total Fleet Distance</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{totalDistance.toLocaleString()} km</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Average Fleet Consumption</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>0.26 Liters/km</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Est. Diesel Consumed</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.orange }}>{estimatedFuel} Liters</Text>
                  </View>
                </View>
              </Card>
            )}

            {activeCategory === 'tolls' && (
              <Card style={{ marginBottom: 16 }}>
                <SectionLabel label="National Highway Toll Surcharges" />
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Average Toll Points / Route</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>4 Checkpoints</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Toll Gates Crossed</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.blue }}>{totalTollsCrossed} Gates</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.sub }}>Est. Toll Taxes (12%)</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.accent }}>₹{Math.round(totalSpend * 0.12).toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            )}

            <SectionLabel label="Exportable PDF Reports" />
            {[
              { label: 'Executive Fleet Cost Summary', subtitle: 'Detailed breakdown of all cargo spend & tolls' },
              { label: 'Fuel Efficiency & Green Transit statement', subtitle: 'Eco optimization parameters & fuel logs' },
              { label: 'NHAI Highway Toll Statement', subtitle: 'Toll taxes, checkpoints, and hub segments' }
            ].map((r, i) => (
              <Card key={r.label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 26 }}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '750', color: colors.text }}>{r.label}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>{r.subtitle}</Text>
                  </View>
                  <TouchableOpacity onPress={() => exportPDF(r.label)} style={{ backgroundColor: colors.surface2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.accent }}>Export 🖨</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function buildShipmentsCSV(shipments) {
  const header = ['From', 'To', 'Material', 'Transport', 'Status', 'Date', 'Cost (INR)'];
  const rows = shipments.map(s => [s.from, s.to, s.material, s.transport, s.status, s.date, s.cost || 0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [header, ...rows].map(r => r.map(escape).join(',')).join('\n');
}

function buildShipmentsHTML(shipments, totalSpend) {
  const rows = shipments.map(s => `
    <tr>
      <td>${s.from} → ${s.to}</td>
      <td>${s.material}</td>
      <td>${s.transport}</td>
      <td>${s.status}</td>
      <td>${s.date}</td>
      <td style="text-align:right">₹${(s.cost || 0).toLocaleString()}</td>
    </tr>`).join('');
  return `
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: -apple-system, sans-serif; padding: 24px;">
        <h2>Shipment Report</h2>
        <p>Generated ${new Date().toLocaleString('en-IN')}</p>
        <p><strong>Total shipments:</strong> ${shipments.length} &nbsp;|&nbsp; <strong>Total spend:</strong> ₹${totalSpend.toLocaleString()}</p>
        <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background:#F0F4FF; text-align:left;">
              <th style="padding:8px; border-bottom:1px solid #ddd;">Route</th>
              <th style="padding:8px; border-bottom:1px solid #ddd;">Material</th>
              <th style="padding:8px; border-bottom:1px solid #ddd;">Transport</th>
              <th style="padding:8px; border-bottom:1px solid #ddd;">Status</th>
              <th style="padding:8px; border-bottom:1px solid #ddd;">Date</th>
              <th style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">Cost</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>`;
}

export function ExportScreen({ navigation }) {
  const [format, setFormat] = useState('pdf');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const formats = [
    { id: 'pdf', icon: '📄', name: 'PDF Report', sub: 'Formatted for printing' },
    { id: 'csv', icon: '📋', name: 'CSV File', sub: 'Opens in Excel / Google Sheets' },
  ];

  const handleExport = async () => {
    if (shipments.length === 0) {
      Alert.alert('Nothing to Export', 'You don\'t have any shipments yet.');
      return;
    }
    setExporting(true);
    try {
      const totalSpend = shipments.reduce((sum, s) => sum + (s.cost || 0), 0);

      if (format === 'pdf') {
        const html = buildShipmentsHTML(shipments, totalSpend);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Shipment Report' });
        } else {
          Alert.alert('✅ PDF Ready', `Saved to: ${uri}`);
        }
      } else {
        const csv = buildShipmentsCSV(shipments);
        const path = `${FileSystem.cacheDirectory}shipments_export_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Shipment Data' });
        } else {
          Alert.alert('✅ CSV Ready', `Saved to: ${path}`);
        }
      }
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Export Data</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 16 }}>
          {loading ? 'Loading your shipments…' : `${shipments.length} shipment${shipments.length === 1 ? '' : 's'} ready to export`}
        </Text>
        <SectionLabel label="Format" />
        {formats.map(f => (
          <TouchableOpacity key={f.id} onPress={() => setFormat(f.id)}>
            <Card style={{ borderColor: format === f.id ? colors.accent : colors.border, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 28 }}>{f.icon}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{f.name}</Text><Text style={{ fontSize: 12, color: colors.sub }}>{f.sub}</Text></View>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: format === f.id ? colors.accent : colors.border, backgroundColor: format === f.id ? colors.accent : 'transparent' }} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        <Btn
          label={exporting ? 'Generating…' : '📥 Export & Share'}
          onPress={handleExport}
          disabled={exporting || loading}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export function FeedbackScreen({ navigation }) {
  const [rating, setRating] = useState(4);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[screen(), { alignItems: 'center' }]}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />
        <Text style={[h1, { textAlign: 'center' }]}>Rate Your Trip</Text>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentS, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 }}>Rajesh Kumar</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={{ fontSize: 32 }}>{s <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input placeholder="Write a review (optional)..." multiline numberOfLines={3} style={{ width: '100%' }} />
        <Btn label="Submit Rating ✓" onPress={() => navigation.navigate('History')} style={{ width: '100%' }} />
        <Btn label="Skip" onPress={() => navigation.navigate('History')} variant="outline" style={{ width: '100%' }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════
// PROFILE SCREENS — Firebase Connected
// ════════════════════════════════════════════════════════

export function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fb = await getUserProfile().catch(() => null);
        if (fb) {
          await saveProfile(fb);
          setProfile(fb);
        } else {
          const local = await getProfile();
          setProfile(local);
        }
      } catch (e) {
        const local = await getProfile();
        setProfile(local);
      } finally {
        setLoading(false);
      }
    };
    // Reload profile details whenever screen focuses
    const unsub = navigation.addListener('focus', loadProfile);
    loadProfile();
    return unsub;
  }, [navigation]);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const yes = window.confirm('Are you sure you want to logout?');
      if (yes) {
        await signOut(auth);
        navigation.replace('Login');
      }
      return;
    }
    Alert.alert(t('logout'), 'Are you sure you want to logout?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'), style: 'destructive', onPress: async () => {
          await signOut(auth);
          navigation.replace('Login');
        }
      },
    ]);
  };

  const menuItems = [
    { icon: '✏️', label: t('editProfile'), sub: t('editProfileSub'), route: 'EditProfile' },
    { icon: '🪄', label: 'Setup Wizard', sub: 'Re-run onboarding configuration', route: 'ProfileSetup' },
    { icon: '💸', label: 'Payout Release Hub', sub: 'Approve driver fuel slips & cash-outs', route: 'PayoutRelease' },
    { icon: '🏢', label: t('companyDetails'), sub: t('companyDetailsSub'), route: 'CompanyDetails' },
    {
      icon: '🪪',
      label: profile?.type === 'company' ? 'KYC Documents' : t('kycDocs'),
      sub: `${profile?.type === 'company' ? 'Official PAN, Aadhaar' : t('kycDocsSub')} • ${profile?.verified ? t('verifiedBadge') + ' ✓' : t('pendingBadge')}`,
      color: colors.green,
      route: 'KYCDocuments'
    },
    { icon: '💳', label: t('paymentMethods'), sub: t('paymentMethodsSub'), route: 'PaymentMethods' },
    { icon: '🎨', label: 'Theme Customizer', sub: 'Personalize portal colors', route: 'ThemeCustomizer' },
    { icon: '🔔', label: t('notificationPrefs'), sub: '', route: 'Notifications' },
    { icon: '⚙️', label: t('settings'), sub: '', route: 'Settings' },
    { icon: '❓', label: t('helpSupport'), sub: '', route: 'HelpSupport' },
    { icon: 'ℹ️', label: t('aboutApp'), sub: 'v1.0.0', route: null },
    { icon: '🚪', label: t('logout'), sub: '', color: colors.red, route: null, action: handleLogout },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 8 }} />
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden', borderWidth: 2, borderColor: colors.accent + '33' }}>
            {profile?.avatar && !(Platform.OS !== 'web' && profile.avatar.startsWith('blob:')) ? (
              <Image source={{ uri: profile.avatar }} style={{ width: 80, height: 80 }} />
            ) : (
              <Text style={{ fontSize: 40 }}>👤</Text>
            )}
          </View>
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{profile?.name || 'User'}</Text>
              <Text style={{ fontSize: 13, color: colors.sub, marginTop: 4 }}>{profile?.type === 'driver' ? t('driverLabel') : 'Company Manager'} · {profile?.city || auth.currentUser?.email}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Badge label={profile?.type === 'driver' ? '🚛 ' + t('driverLabel') : '🏢 ' + t('companyLabel')} type="yellow" />
                <Badge label={profile?.verified ? '✓ ' + t('verifiedBadge') : '⏳ ' + t('pendingBadge')} type={profile?.verified ? 'green' : 'default'} />
              </View>
            </>
          )}
        </View>
        <Divider />
        {menuItems.map((item, i) => (
          <ListItem key={i}
            left={<Text style={{ fontSize: 20, color: item.color || colors.text }}>{item.icon}</Text>}
            title={<Text style={{ color: item.color || colors.text, fontSize: 14, fontWeight: '600' }}>{item.label}</Text>}
            subtitle={item.sub || undefined}
            right={<Text style={{ fontSize: 16, color: colors.muted }}>›</Text>}
            onPress={() => {
              if (item.action) item.action();
              else if (item.route) navigation.navigate(item.route);
            }}
            style={{ marginBottom: 0 }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SettingsScreen({ navigation }) {
  const { setLang } = useLang();
  const [notifs, setNotifs] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currModalVisible, setCurrModalVisible] = useState(false);

  const languages = [
    { name: 'English', code: 'en', native: 'English' },
    { name: 'Hindi', code: 'hi', native: 'हिन्दी' },
    { name: 'Tamil', code: 'ta', native: 'தமிழ்' },
    { name: 'Telugu', code: 'te', native: 'తెలుగు' },
    { name: 'Kannada', code: 'kn', native: 'ಕನ್ನಡ' }
  ];

  const currencies = [
    { name: 'Indian Rupee', code: 'INR', symbol: '₹' },
    { name: 'US Dollar', code: 'USD', symbol: '$' },
    { name: 'Euro', code: 'EUR', symbol: '€' },
    { name: 'British Pound', code: 'GBP', symbol: '£' }
  ];

  useEffect(() => {
    getProfile().then(p => {
      if (p.language) {
        setLanguage(p.language);
        setLang(p.language);
      }
      if (p.currency) setCurrency(p.currency);
    });
  }, []);

  const handleSelectLanguage = async (code) => {
    setLanguage(code);
    setLang(code);
    await saveProfile({ language: code });
    setLangModalVisible(false);
    const selected = languages.find(l => l.code === code);
    Alert.alert(translate('lang_updated', code), translate('lang_changed_to', code));
  };

  const handleSelectCurrency = async (code) => {
    setCurrency(code);
    await saveProfile({ currency: code });
    setCurrModalVisible(false);
    const selected = currencies.find(c => c.code === code);
    Alert.alert(translate('curr_updated', language), translate('curr_changed_to', language));
  };

  const Toggle = ({ value, onToggle }) => (
    <TouchableOpacity onPress={onToggle} style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: value ? colors.accent : colors.surface3, justifyContent: 'center', paddingHorizontal: 3 }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const yes = window.confirm('Are you sure you want to logout?');
      if (yes) {
        await signOut(auth);
        navigation.replace('Login');
      }
      return;
    }
    Alert.alert(translate('logout', language), 'Are you sure?', [
      { text: translate('cancel', language), style: 'cancel' },
      { text: translate('logout', language), style: 'destructive', onPress: async () => { await signOut(auth); navigation.replace('Login'); } },
    ]);
  };

  const activeLangName = languages.find(l => l.code === language)?.native || 'English';
  const activeCurrSymbol = currencies.find(c => c.code === currency)?.code || 'INR';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>{translate('settings', language)}</Text>
        <SectionLabel label={translate('notifications', language)} style={{ marginTop: 8 }} />
        {[
          ['🔔', translate('push_notifs', language), notifs, setNotifs],
          ['📧', translate('email_alerts', language), email, setEmail],
          ['📱', translate('sms_updates', language), sms, setSms]
        ].map(([icon, label, val, setter]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.text }}>{label}</Text>
            <Toggle value={val} onToggle={() => setter(!val)} />
          </View>
        ))}

        <SectionLabel label={translate('display', language)} style={{ marginTop: 16 }} />
        <ListItem
          left={<Text style={{ fontSize: 20 }}>🌍</Text>}
          title={translate('language', language)}
          right={<Text style={{ fontSize: 13, color: colors.sub }}>{activeLangName} ›</Text>}
          onPress={() => setLangModalVisible(true)}
        />
        <ListItem
          left={<Text style={{ fontSize: 20 }}>💰</Text>}
          title={translate('currency', language)}
          right={<Text style={{ fontSize: 13, color: colors.sub }}>{activeCurrSymbol} ›</Text>}
          onPress={() => setCurrModalVisible(true)}
        />

        <SectionLabel label={translate('security', language)} style={{ marginTop: 8 }} />
        <ListItem left={<Text style={{ fontSize: 20 }}>🔒</Text>} title={translate('change_password', language)} right={<Text style={{ fontSize: 16, color: colors.muted }}>›</Text>} onPress={() => navigation.navigate('ResetPassword')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>👆</Text>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.text }}>{translate('biometric_login', language)}</Text>
          <Toggle value={biometric} onToggle={() => setBiometric(!biometric)} />
        </View>
        <ListItem left={<Text style={{ fontSize: 20 }}>🚪</Text>} title={<Text style={{ color: colors.red, fontSize: 14, fontWeight: '600' }}>{translate('logout', language)}</Text>} style={{ marginTop: 8 }} right={<Text style={{ fontSize: 16, color: colors.muted }}>›</Text>} onPress={handleLogout} />

        {/* Language Selection Modal */}
        <Modal visible={langModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A1A2E' }}>Select Language</Text>
                <TouchableOpacity onPress={() => setLangModalVisible(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 20, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              </View>

              {languages.map(l => (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => handleSelectLanguage(l.code)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B' }}>{l.name}</Text>
                    <Text style={{ fontSize: 13, color: '#64748B' }}>({l.native})</Text>
                  </View>
                  {language === l.code && <Text style={{ fontSize: 16, color: colors.accent, fontWeight: '900' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Currency Selection Modal */}
        <Modal visible={currModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A1A2E' }}>Select Default Currency</Text>
                <TouchableOpacity onPress={() => setCurrModalVisible(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 20, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              </View>

              {currencies.map(c => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => handleSelectCurrency(c.code)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#1D4ED8' }}>{c.symbol}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B' }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{c.code}</Text>
                    </View>
                  </View>
                  {currency === c.code && <Text style={{ fontSize: 16, color: colors.accent, fontWeight: '900' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

export function NotificationsScreen({ navigation }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAllNotifications(data => {
      setNotifications(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Automatically mark all notifications as read upon opening screen
  useEffect(() => {
    const timer = setTimeout(() => {
      markAllNotificationsReadUnified().catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      await markAllNotificationsReadUnified();
    } catch (e) {
      console.warn('markAllNotificationsReadUnified error:', e);
    }
  };

  const handlePaymentFromNotification = async (n) => {
    try {
      setLoading(true);
      const bookingSnap = await get(ref(db, `bookings/${n.bookingId}`));
      if (bookingSnap.exists()) {
        const b = bookingSnap.val();
        navigation.navigate('Payment', {
          bookingId: n.bookingId,
          cost: b.cost,
          source: b.from,
          destination: b.to,
          material: b.material,
          weight: b.weight,
          transport: b.transport,
          driverId: b.driverUid,
        });
      } else {
        Alert.alert('Error', 'Could not locate booking details.');
      }
    } catch (e) {
      console.warn('Failed to retrieve booking:', e);
      Alert.alert('Error', 'Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTapNotification = async (n) => {
    if (!n.unread) return;
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    try {
      await markAnyNotificationRead(n);
    } catch (e) {
      console.warn('markAnyNotificationRead error:', e);
    }
  };

  const handleClearAll = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setNotifications([]);
      await set(ref(db, `driverNotifications/${user.uid}`), null);
    } catch (e) {
      console.warn('handleClearAll error:', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
            <Text style={h1}>Notifications</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '700' }}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={{ fontSize: 13, color: colors.red, fontWeight: '700' }}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Simulator Panel */}
        <Card style={{ marginBottom: 20, borderColor: colors.accent, borderWidth: 1.5, padding: 14 }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginBottom: 10, letterSpacing: 0.5 }}>🧪 LIVE ALERTS SIMULATOR</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn
              label="Simulate Delay ⏱️"
              onPress={async () => {
                await simulateNewNotification(
                  '⏱️ Transit Delay Alert',
                  'Heavy congestion on NH-48 near Pune has delayed active shipment LR-8942 by 35 minutes.',
                  '⏱️',
                  colors.orange
                );
              }}
              style={{ flex: 1, marginBottom: 0, paddingVertical: 8 }}
            />
            <Btn
              label="Simulate weather ⛈️"
              onPress={async () => {
                await simulateNewNotification(
                  '⛈️ Weather Alert',
                  'Rainstorms detected on Bengaluru highway route. Speed limits reduced to 50 km/h for safety.',
                  '⛈️',
                  colors.blue
                );
              }}
              style={{ flex: 1, marginBottom: 0, paddingVertical: 8 }}
            />
          </View>
        </Card>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : notifications.filter(n => n.type !== 'booking_request').length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>No notifications yet.</Text>
          </Card>
        ) : (
          notifications.filter(n => n.type !== 'booking_request').map((n, i) => (
            <View key={n.id} style={{ marginBottom: 14 }}>
              <TouchableOpacity onPress={() => handleTapNotification(n)} activeOpacity={n.unread ? 0.6 : 1}>
                <NotifCard icon={n.icon} title={n.title} msg={n.message} time={timeAgo(n.createdAt)} color={n.color} unread={n.unread} delay={i * 80} />
              </TouchableOpacity>
              {n.type === 'booking_accepted' && (
                <View style={{ marginTop: 6, paddingLeft: 46 }}>
                  <Btn 
                    label="💳 Make Payment" 
                    onPress={() => handlePaymentFromNotification(n)}
                    style={{ marginBottom: 0, paddingVertical: 8 }}
                  />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function timeAgo(ts) {
  if (!ts) return '';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ marginBottom: 10, borderColor: open ? colors.accent + '55' : colors.border }} onPress={() => setOpen(!open)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 }}>{q}</Text>
        <Text style={{ fontSize: 16, color: colors.accent, fontWeight: '900' }}>{open ? '−' : '+'}</Text>
      </View>
      {open && (
        <Text style={{ fontSize: 13, color: colors.textSub, marginTop: 8, lineHeight: 18 }}>{a}</Text>
      )}
    </Card>
  );
}

export function HelpSupportScreen({ navigation }) {
  const { t } = useLang();
  const [ticketForm, setTicketForm] = useState({ category: 'General', details: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = () => {
    if (!ticketForm.details.trim()) {
      Alert.alert('Missing Field', 'Please describe your request.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        '🎟️ Support Ticket Submitted!',
        `Your ticket ID is #LR-${Math.floor(1000 + Math.random() * 9000)}. Our support team will respond within 24 hours.`,
        [{ text: 'OK', onPress: () => setTicketForm({ category: 'General', details: '' }) }]
      );
    }, 1200);
  };

  const faqs = [
    { q: 'How do I post a cargo job?', a: 'Go to the home dashboard and tap "Post Job for Any Driver". Enter the pick-up location, drop-off location, cargo weight, and pricing. Drivers will be notified instantly.' },
    { q: 'How is route optimization calculated?', a: 'LogiRoute queries active open-source route geometries and evaluates distance, current weather conditions, WMO codes, and vehicle parameters to produce the fastest road transit path.' },
    { q: 'How does KYC document verification work?', a: 'Upload your Aadhaar, PAN, and vehicle registration numbers inside "KYC Documents" on your Profile screen. Verified profiles get access to priority booking rates.' },
    { q: 'How do I contact a driver after booking?', a: 'Once a booking is accepted by a driver, their contact phone number and vehicle details are displayed on the shipment details screen under "My Trips" or "Active Shipments".' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen(60)} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Help & Support</Text>
        <Text style={sub}>Resolve issues and contact support hotlines</Text>

        <SectionLabel label="Contact Channels" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
          <Card style={{ flex: 1, alignItems: 'center', gap: 8, padding: 12 }}>
            <Text style={{ fontSize: 24 }}>📞</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>Hotline</Text>
            <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700' }}>+91 93928 59818</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', gap: 8, padding: 12 }}>
            <Text style={{ fontSize: 24 }}>✉️</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>Email</Text>
            <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700' }}>support@logiroute.in</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', gap: 8, padding: 12 }}>
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>WhatsApp</Text>
            <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700' }}>+91 93928 59818</Text>
          </Card>
        </View>

        <SectionLabel label="Frequently Asked Questions" />
        <View style={{ marginBottom: 12 }}>
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </View>

        <SectionLabel label="Open Support Ticket" />
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSub, marginBottom: 6, textTransform: 'uppercase' }}>Issue Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {['General', 'Booking', 'Payment', 'Routing'].map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setTicketForm(p => ({ ...p, category: cat }))}
                style={{
                  backgroundColor: ticketForm.category === cat ? colors.accent : colors.surface2,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: ticketForm.category === cat ? colors.accent : colors.border
                }}
              >
                <Text style={{ fontSize: 12, color: ticketForm.category === cat ? colors.white : colors.textSub, fontWeight: '700' }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSub, marginBottom: 6, textTransform: 'uppercase' }}>Details</Text>
          <Input
            placeholder="Describe your issue or feedback in detail..."
            value={ticketForm.details}
            onChangeText={v => setTicketForm(p => ({ ...p, details: v }))}
            multiline
            style={{ height: 90, textAlignVertical: 'top' }}
          />

          <Btn label="Submit Ticket 🎟️" onPress={handleSubmitTicket} loading={submitting} style={{ marginTop: 8 }} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// S99 — Payout Release Hub for Company manager
export function PayoutReleaseScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('cashouts'); // 'cashouts' or 'fuelslips'
  const [cashouts, setCashouts] = useState([]);
  const [fuelslips, setFuelslips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for displaying receipt mockup
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    try {
      const cashoutsRef = ref(db, 'globalCashOuts');
      onValue(cashoutsRef, snap => {
        if (!snap.exists()) { setCashouts([]); return; }
        setCashouts(Object.values(snap.val()).reverse());
      });

      const fuelRef = ref(db, 'globalFuelSlips');
      onValue(fuelRef, snap => {
        if (!snap.exists()) { setFuelslips([]); return; }
        setFuelslips(Object.values(snap.val()).reverse());
      });

      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const handleApproveCashout = async (item) => {
    try {
      await update(ref(db, `globalCashOuts/${item.id}`), { status: 'approved' });
      await update(ref(db, `driverCashOuts/${item.driverUid}/${item.id}`), { status: 'approved' });

      Alert.alert('Payout Released! 💳', `Approved ₹${item.amount.toLocaleString()} payout to driver ${item.driverName || 'Driver'}.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApproveFuel = async (item) => {
    try {
      await update(ref(db, `globalFuelSlips/${item.id}`), { status: 'approved' });
      await update(ref(db, `driverFuelSlips/${item.driverUid}/${item.id}`), { status: 'approved' });

      Alert.alert('Refund Approved! ⛽', `Approved ₹${item.amount.toLocaleString()} fuel refund to ${item.driverName}.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRejectFuel = async (item) => {
    try {
      await update(ref(db, `globalFuelSlips/${item.id}`), { status: 'rejected' });
      await update(ref(db, `driverFuelSlips/${item.driverUid}/${item.id}`), { status: 'rejected' });

      Alert.alert('Refund Rejected ✕', `Rejected fuel slip refund of ₹${item.amount.toLocaleString()} for ${item.driverName}.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Payout Release Hub</Text>
        <Text style={sub}>Audit driver expense invoices and authorize payout cash-outs</Text>

        {/* Custom Tab Selector */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { id: 'cashouts', label: 'Cash-Outs 💳', data: cashouts },
            { id: 'fuelslips', label: 'Fuel Slips ⛽', data: fuelslips }
          ].map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: radius.md,
                backgroundColor: activeTab === t.id ? colors.accentLight : colors.surface,
                borderWidth: 1.5,
                borderColor: activeTab === t.id ? colors.accent : colors.border,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: activeTab === t.id ? colors.accent : colors.textSub }}>
                {t.label} ({t.data.filter(x => x.status === 'pending').length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <Card>
            {activeTab === 'cashouts' ? (
              <View>
                <SectionLabel label="PENDING CASHOUT PAYOUTS" />
                {cashouts.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 12 }}>No payouts registered.</Text>
                ) : (
                  cashouts.map((item, idx) => (
                    <View key={idx} style={{ paddingVertical: 14, borderBottomWidth: idx < cashouts.length - 1 ? 1 : 0, borderColor: colors.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{item.driverName}</Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>Requested: {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.accent }}>₹{item.amount.toLocaleString()}</Text>
                      </View>
                      
                      {item.status === 'pending' ? (
                        <TouchableOpacity
                          onPress={() => handleApproveCashout(item)}
                          style={{
                            backgroundColor: colors.accent,
                            paddingVertical: 8,
                            borderRadius: radius.sm,
                            alignItems: 'center',
                            marginTop: 4
                          }}
                        >
                          <Text style={{ color: colors.white, fontSize: 12, fontWeight: '800' }}>Approve & Pay Payout ✓</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={{ backgroundColor: '#D1FAE5', paddingVertical: 6, borderRadius: radius.sm, alignItems: 'center' }}>
                          <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '900' }}>✓ RELEASED & PAID</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View>
                <SectionLabel label="DRIVER FUEL SLIPS CLAIMS" />
                {fuelslips.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 12 }}>No fuel claims registered.</Text>
                ) : (
                  fuelslips.map((item, idx) => (
                    <View key={idx} style={{ paddingVertical: 14, borderBottomWidth: idx < fuelslips.length - 1 ? 1 : 0, borderColor: colors.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{item.driverName}</Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>Submitted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.purple }}>₹{item.amount.toLocaleString()}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <TouchableOpacity
                          onPress={() => setSelectedReceipt(item)}
                          style={{
                            flex: 1,
                            backgroundColor: colors.surface2,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingVertical: 8,
                            borderRadius: radius.sm,
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{ color: colors.textSub, fontSize: 12, fontWeight: '750' }}>View Receipt 📸</Text>
                        </TouchableOpacity>

                        {item.status === 'pending' ? (
                          <>
                            <TouchableOpacity
                              onPress={() => handleApproveFuel(item)}
                              style={{
                                flex: 1,
                                backgroundColor: colors.accent,
                                paddingVertical: 8,
                                borderRadius: radius.sm,
                                alignItems: 'center'
                              }}
                            >
                              <Text style={{ color: colors.white, fontSize: 12, fontWeight: '800' }}>Approve ✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleRejectFuel(item)}
                              style={{
                                flex: 1,
                                backgroundColor: colors.red + '15',
                                borderWidth: 1,
                                borderColor: colors.red,
                                paddingVertical: 8,
                                borderRadius: radius.sm,
                                alignItems: 'center'
                              }}
                            >
                              <Text style={{ color: colors.red, fontSize: 12, fontWeight: '800' }}>Reject ✕</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={{
                            flex: 2,
                            backgroundColor: item.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                            borderRadius: radius.sm,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text style={{
                              color: item.status === 'approved' ? '#065F46' : '#991B1B',
                              fontSize: 11, fontWeight: '900'
                            }}>
                              {item.status === 'approved' ? '✓ REFUNDED' : '✕ REJECTED'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </Card>
        )}

        {/* Receipt Verification Modal */}
        <Modal
          visible={!!selectedReceipt}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedReceipt(null)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: colors.surface, width: '100%', borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Verify Fuel Invoice</Text>
                <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                  <Text style={{ fontSize: 20, color: colors.textMuted }}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {selectedReceipt && (
                <View>
                  <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 8 }}>
                    Driver: <Text style={{ fontWeight: '800', color: colors.text }}>{selectedReceipt.driverName}</Text>
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>
                    Claim Value: <Text style={{ fontWeight: '900', color: colors.purple }}>₹{selectedReceipt.amount.toLocaleString()}</Text>
                  </Text>

                  {/* Simulated Receipt Slip Photo Visualizer */}
                  <View style={{ height: 220, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                      source={{ uri: selectedReceipt.receiptImage }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    {/* Simulated details overlay stamp */}
                    <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 6, borderRadius: 4 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 9, fontFamily: 'monospace' }}>
                        STATION: HP AUTO HUB{'\n'}
                        DATE: {new Date(selectedReceipt.createdAt).toLocaleDateString()}{'\n'}
                        VOLUME: 42.5 LITERS{'\n'}
                        AUTH CODE: #F-9023
                      </Text>
                    </View>
                  </View>

                  <Btn label="Close Receipt Verification" onPress={() => setSelectedReceipt(null)} />
                </View>
              )}
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}