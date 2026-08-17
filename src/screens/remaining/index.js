import { getProfile, saveProfile } from '../../config/UserStore';
import { translate } from '../../config/i18n';
import { useLang } from '../../context/LanguageContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Image } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Btn, Card, StatCard, Badge, SectionLabel, BackBtn, Divider, ListItem, Input, CostHero, ProgressBar, NotifCard } from '../../components';
import { MOCK_DRIVERS, MOCK_WEATHER, MOCK_HISTORY } from '../../data';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { getUserProfile, listenNotifications, listenBookings, createBooking, listenShipments } from '../../config/firebaseService';
import { sendBookingRequest, listenAllNotifications, markAnyNotificationRead, markAllNotificationsReadUnified } from '../../config/DriverService';

const screen = (pt = 60) => ({ padding: 20, paddingTop: pt, flexGrow: 1 });
const h1 = { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 4 };
const sub = { fontSize: 13, color: colors.sub, marginBottom: 20 };

// ════════════════════════════════════════════════════════
// BOOKING SCREENS (S31–S36)
// ════════════════════════════════════════════════════════

export function BookTransportScreen({ navigation, route }) {
  const { data, source, destination, material } = route?.params || {};
  if (!source || !destination) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 }}>No Route Selected</Text>
      <Text style={{ fontSize: 14, color: colors.textSub, textAlign: 'center', marginBottom: 24 }}>Please optimize a route first before booking transport.</Text>
      <Btn label="Go to Optimizer →" onPress={() => navigation.navigate('Optimizer')} />
    </SafeAreaView>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Book Transport</Text>
        <Card style={{ borderColor: colors.accent + '44', marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 4 }}>{source} → {destination}</Text>
          <Text style={{ fontSize: 13, color: colors.sub }}>{material} · 🚂 Train · ₹{data?.minimum_cost?.toFixed(0) || '14,200'}</Text>
        </Card>
        <SectionLabel label="Cargo Details" />
        <Input placeholder="Weight (tons)" keyboardType="numeric" />
        <Input placeholder="Special Instructions (optional)" multiline numberOfLines={2} />
        <SectionLabel label="Pickup Date & Time" />
        <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <Text style={{ fontSize: 14, color: colors.text }}>📅 May 10, 2026 · 08:00 AM</Text>
        </View>
        <SectionLabel label="Insurance" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {['Basic', 'Premium'].map((ins, i) => (
            <TouchableOpacity key={ins} style={{ flex: 1, backgroundColor: i === 0 ? colors.accentS : colors.surface2, borderWidth: i === 0 ? 2 : 1, borderColor: i === 0 ? colors.accent : colors.border, borderRadius: 8, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: i === 0 ? colors.accent : colors.sub }}>{ins}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Btn label="Select Driver →" onPress={() => navigation.navigate('SelectDriver', { data, source, destination, material })} />
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
  const handleConfirm = () => {
    // Go straight to Payment — booking saved after payment succeeds
    navigation.navigate('Payment', { ...params, driver, cost });
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
        <Btn label="Proceed to Payment →" onPress={handleConfirm} />
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
  const { payment_id, amount, source, destination, driver, material, weight, distKm } = route?.params || {};
  const [bookingId, setBookingId] = useState('#LR-' + Date.now().toString().slice(-6));
  const [notifyStatus, setNotifyStatus] = useState('idle'); // idle | sending | sent | failed

  useEffect(() => {
    // Send the real booking request + notification to the driver after payment,
    // using the same DriverService helper the "Notify" button uses (writes a real
    // bookings/ record AND a booking_request notification the driver's Jobs screen
    // will actually show with Accept/Decline).
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

  const STATUS_TYPE = { Confirmed: 'green', Pending: 'yellow', Cancelled: 'red', Completed: 'blue' };

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
  const steps = [
    { icon: '✅', label: 'Order Placed', time: 'May 10, 08:00 AM', done: true },
    { icon: '✅', label: 'Picked Up', time: 'May 10, 09:30 AM', done: true },
    { icon: '🚛', label: 'In Transit', time: 'May 10, 10:00 AM', done: true },
    { icon: '⏳', label: 'Out for Delivery', time: 'Expected May 11', done: false },
    { icon: '⏳', label: 'Delivered', time: 'Expected May 11, 6 PM', done: false },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Delivery Status</Text>
        {steps.map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 14, marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: step.done ? colors.green : colors.surface2, borderWidth: 2, borderColor: step.done ? colors.green : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{step.icon}</Text>
              </View>
              {i < steps.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: step.done ? colors.green : colors.border, marginTop: 4 }} />}
            </View>
            <View style={{ flex: 1, paddingTop: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: step.done ? colors.text : colors.muted }}>{step.label}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{step.time}</Text>
            </View>
          </View>
        ))}
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

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length >= 2) setSuggestions(INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(text.toLowerCase())).slice(0, 6));
    else setSuggestions([]);
  };

  const selectCity = (c) => { setCity(c); setQuery(c); setSuggestions([]); fetchWeather(c); };

  const fetchWeather = async (cityName) => {
    const coords = CITY_COORDS[cityName];
    if (!coords) { setError('City not found. Try another Indian city.'); return; }
    setLoading(true); setError(''); setWeather(null);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&timezone=Asia%2FKolkata`);
      const data = await res.json();
      const c = data.current;
      const wmo = WMO[c.weather_code] || {l:'Unknown',i:'🌡'};
      setWeather({ temp: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), condition: wmo.l, icon: wmo.i, code: c.weather_code });
    } catch (e) { setError('Failed to fetch weather. Check internet.'); }
    finally { setLoading(false); }
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
            <TouchableOpacity onPress={() => query && selectCity(query)} style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.bg }}>Check</Text>
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 && (
            <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, zIndex: 100 }}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => selectCity(s)} style={{ padding: 12, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 14 }}>📍</Text>
                  <Text style={{ fontSize: 14, color: colors.text }}>{s}</Text>
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
          const c = CITY_COORDS[city];
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`);
          const data = await res.json();
          const wmo = WMO[data.current.weather_code] || {l:'Unknown',i:'🌡'};
          return { city, temp: Math.round(data.current.temperature_2m), icon: wmo.i, cond: wmo.l, alert: data.current.weather_code >= 80 };
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

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const totalSpend = shipments.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalSpendLabel = totalSpend >= 100000 ? `₹${(totalSpend / 100000).toFixed(1)}L` : `₹${(totalSpend / 1000).toFixed(1)}K`;
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Reports</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard value={totalSpendLabel} label="Total Spend" style={{ flex: 1 }} />
              <StatCard value={String(shipments.length)} label="Shipments" color={colors.blue} style={{ flex: 1 }} />
              <StatCard value="—" label="Savings" color={colors.green} style={{ flex: 1 }} />
            </View>
            {[['📦', 'Monthly Shipment Report', monthLabel], ['💰', 'Invoice Summary', monthLabel], ['📊', 'Analytics Export', 'All time']].map(([icon, label, period]) => (
              <Card key={label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{label}</Text>
                    <Text style={{ fontSize: 12, color: colors.sub }}>{period}</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Export')}>
                    <Text style={{ fontSize: 13, color: colors.accent }}>Export →</Text>
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
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const local = await getProfile();
        const fb = await getUserProfile().catch(() => null);
        setProfile({ ...local, ...fb, avatar: local?.avatar || fb?.avatar });
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
    { icon: '🏢', label: t('companyDetails'), sub: t('companyDetailsSub'), route: 'CompanyDetails' },
    { icon: '🪪', label: t('kycDocs'), sub: `${t('kycDocsSub')} • ${profile?.verified ? t('verifiedBadge') + ' ✓' : t('pendingBadge')}`, color: colors.green, route: 'KYCDocuments' },
    { icon: '💳', label: t('paymentMethods'), sub: t('paymentMethodsSub'), route: 'PaymentMethods' },
    { icon: '🔔', label: t('notificationPrefs'), sub: '', route: 'Notifications' },
    { icon: '⚙️', label: t('settings'), sub: '', route: 'Settings' },
    { icon: '❓', label: t('helpSupport'), sub: '', route: null },
    { icon: 'ℹ️', label: t('aboutApp'), sub: 'v1.0.0', route: null },
    { icon: '🚪', label: t('logout'), sub: '', color: colors.red, route: null, action: handleLogout },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 8 }} />
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden', borderWidth: 2, borderColor: colors.accent + '33' }}>
            {profile?.avatar ? (
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

  const handleTapNotification = async (n) => {
    if (!n.unread) return;
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    try {
      await markAnyNotificationRead(n);
    } catch (e) {
      console.warn('markAnyNotificationRead error:', e);
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
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={{ fontSize: 13, color: colors.accent }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : notifications.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>No notifications yet.</Text>
          </Card>
        ) : (
          notifications.map((n, i) => (
            <TouchableOpacity key={n.id} onPress={() => handleTapNotification(n)} activeOpacity={n.unread ? 0.6 : 1}>
              <NotifCard icon={n.icon} title={n.title} msg={n.message} time={timeAgo(n.createdAt)} color={n.color} unread={n.unread} delay={i * 80} />
            </TouchableOpacity>
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