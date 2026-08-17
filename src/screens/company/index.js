import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useLang } from '../../context/LanguageContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radius, shadow } from '../../theme';
import { Btn, Card, StatCard, Badge, SectionLabel, ProgressBar, BackBtn, BottomNav, ListItem, Divider, TransportIcon, CostHero, Chip, Input } from '../../components';
import { MOCK_TEAM, MATERIALS, apiAutocomplete } from '../../data';
import { listenShipments, createShipment, getShipments, getUserProfile } from '../../config/firebaseService';
import { listenCompanyFleet, listenAllNotifications, postOpenJob, listenCompanyJobs, confirmJobApplicant, listenCompanyTeam } from '../../config/DriverService';
import { getProfile } from '../../config/UserStore';

const screen = (pt = 60) => ({ padding: 20, paddingTop: pt, flexGrow: 1 });
const h1 = { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 4 };
const sub = { fontSize: 13, color: colors.sub, marginBottom: 20 };

const STATUS_TYPE = { 'In Transit': 'green', Pickup: 'yellow', Booked: 'blue', Scheduled: 'orange', Delivered: 'green', Cancelled: 'red' };
const TRANSPORT_COLOR = { truck: colors.orange, train: colors.blue, ship: colors.purple };

// S11 — Company Dashboard
export function CompanyDashboard({ navigation }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('home');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const local = await getProfile().catch(() => null);
        const fb = await getUserProfile().catch(() => null);
        setProfile({ ...local, ...fb, avatar: local?.avatar || fb?.avatar });
      } catch (e) {
        // Ignored
      }
    };
    const unsub = navigation.addListener('focus', loadProfile);
    loadProfile();
    return unsub;
  }, [navigation]);

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = listenAllNotifications(setAlerts);
    return unsub;
  }, []);

  const activeCount = shipments.filter(s => s.status !== 'Delivered').length;
  const unreadAlerts = alerts.filter(a => a.unread === true).length;

  // Real spend for the current calendar month
  const now = new Date();
  const thisMonthSpend = shipments.reduce((sum, s) => {
    if (!s.createdAt) return sum;
    const d = new Date(s.createdAt);
    const sameMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    return sameMonth ? sum + (s.cost || 0) : sum;
  }, 0);
  const thisMonthLabel = thisMonthSpend >= 100000
    ? `₹${(thisMonthSpend / 100000).toFixed(1)}L`
    : thisMonthSpend >= 1000
    ? `₹${(thisMonthSpend / 1000).toFixed(1)}K`
    : `₹${thisMonthSpend}`;

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'shipments', icon: '📦', label: 'Shipments' },
    { id: 'optimize', icon: '⚡', label: 'Optimize' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];
  const handleTab = (id) => {
    const routes = { shipments: 'Shipments', optimize: 'Optimizer', analytics: 'Analytics', profile: 'Profile' };
    if (routes[id]) navigation.navigate(routes[id]);
    else setActiveTab(id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen(60)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 13, color: colors.sub }}>{t('goodMorning')}</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Kadiyala Logistics</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 44, height: 44, backgroundColor: colors.accent, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={{ width: 44, height: 44 }} />
            ) : (
              <Text style={{ fontSize: 20 }}>🏢</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1, gap: 12 }}>
            <StatCard icon="📦" value={String(activeCount)} label={t('activeShipments')} color={colors.blue} />
            <StatCard icon="⏱" value="—" label="On Time" color={colors.accent} />
          </View>
          <View style={{ flex: 1, gap: 12 }}>
            <StatCard icon="💰" value={thisMonthLabel} label={t('minCost')} color={colors.green} />
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} activeOpacity={0.8}>
              <StatCard icon="🔔" value={String(unreadAlerts)} label={t('notifications')} color={colors.orange} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <Btn label={t('newShipment')} onPress={() => navigation.navigate('NewShipment')} style={{ flex: 1, marginBottom: 0, paddingVertical: 12 }} />
          <Btn label={t('optimizeRoute')} onPress={() => navigation.navigate('Optimizer')} variant="outline" style={{ flex: 1, marginBottom: 0, paddingVertical: 12 }} />
        </View>
        <Btn label="📢 Post Job for Any Driver" onPress={() => navigation.navigate('PostJob')} variant="outline" style={{ marginBottom: 14 }} />

        {/* Dedicated Route Feasibility & Road Safety Card for Companies */}
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
                <Text style={{ fontSize: 12, color: colors.sub, marginTop: 2 }}>
                  Enter source & destination to verify highway weather, road alerts & safety
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, color: colors.accent, fontWeight: '900', marginLeft: 8 }}>→</Text>
          </View>
        </TouchableOpacity>

        <SectionLabel label="Recent Shipments" />
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : shipments.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>No shipments yet. Create your first one!</Text>
          </Card>
        ) : (
          shipments.slice(0, 3).map(s => (
            <TouchableOpacity key={s.id} onPress={() => navigation.navigate('ShipmentDetail', { shipment: s })}>
              <Card style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <TransportIcon type={s.transport} size={26} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{s.from} → {s.to}</Text>
                      <Badge label={s.status} type={STATUS_TYPE[s.status] || 'default'} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.sub }}>{s.material} · {s.km} km</Text>
                    {s.progress > 0 && <ProgressBar percent={s.progress} color={TRANSPORT_COLOR[s.transport]} />}
                    <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '700' }}>₹{s.cost?.toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <SectionLabel label="Quick Access" style={{ marginTop: 8 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[['🛣️', 'Route Safety', 'RoadAlerts', colors.orange], ['👥', 'Drivers', 'SelectDriver', colors.green], ['🚛', 'Fleet', 'Fleet', colors.blue], ['🤝', 'Team', 'Team', colors.purple]].map(([icon, label, route, color]) => (
            <TouchableOpacity key={label} onPress={() => navigation.navigate(route)} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 24 }}>{icon}</Text>
              <Text style={{ fontSize: 11, color, fontWeight: '800' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={tabs} activeTab={activeTab} onTabPress={handleTab} />
    </SafeAreaView>
  );
}

// S12 — New Shipment
export function NewShipmentScreen({ navigation }) {
  const [material, setMaterial] = useState('Steel');
  const [priority, setPriority] = useState('Normal');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [loading, setLoading] = useState(false);
  const [srcSuggestions, setSrcSuggestions] = useState([]);
  const [dstSuggestions, setDstSuggestions] = useState([]);
  const { apiAutocomplete } = require('../../data');

  const fetchSrc = async (q) => {
    setFrom(q);
    if (q.length < 3) { setSrcSuggestions([]); return; }
    const s = await apiAutocomplete(q);
    setSrcSuggestions(s);
  };

  const fetchDst = async (q) => {
    setTo(q);
    if (q.length < 3) { setDstSuggestions([]); return; }
    const s = await apiAutocomplete(q);
    setDstSuggestions(s);
  };

  const handleCreate = async () => {
    if (!from.trim() || !to.trim() || !weight.trim()) {
      Alert.alert('Missing Fields', 'Please fill in source, destination and weight.');
      return;
    }
    setLoading(true);
    try {
      const rate = MATERIALS.find(m => m.id === material)?.rate || 8;
      const km = Math.floor(Math.random() * 1500) + 200;
      const transport = km < 300 ? 'truck' : km < 900 ? 'train' : 'ship';
      const cost = km * rate;
      await createShipment({
        from: from.trim(),
        to: to.trim(),
        material,
        weight,
        priority,
        km,
        transport,
        cost,
        time: `${Math.floor(km / 60)}h`,
        driver: 'Pending Assignment',
        progress: 0,
        pickupDate: dateText || 'Not set',
      });
      Alert.alert('Shipment Created! ✅', `${from} → ${to} has been added.`, [
        { text: 'View Shipments', onPress: () => navigation.navigate('Shipments') },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const sugStyle = {
    position: 'absolute', top: 44, left: 0, right: 0, zIndex: 999,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, overflow: 'hidden',
  };
  const sugItem = { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>New Shipment</Text>
        <Text style={sub}>Create a new transport request</Text>
        <SectionLabel label="Material Type" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {MATERIALS.map(m => <Chip key={m.id} label={m.id} icon={m.icon} selected={material === m.id} color={m.color} onPress={() => setMaterial(m.id)} />)}
        </View>
        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', paddingTop: 12, gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green }} />
              <View style={{ width: 2, height: 24, backgroundColor: colors.border }} />
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />
            </View>
            <View style={{ flex: 1 }}>
              {/* Source with suggestions */}
              <View style={{ position: 'relative', zIndex: 10 }}>
                <Input placeholder="Source city..." value={from} onChangeText={fetchSrc} style={{ marginBottom: 10 }} />
                {srcSuggestions.length > 0 && (
                  <View style={sugStyle}>
                    {srcSuggestions.map((s, i) => (
                      <TouchableOpacity key={`src-${i}`} onPress={() => { setFrom(s); setSrcSuggestions([]); }} style={sugItem}>
                        <Text style={{ fontSize: 13, color: colors.text }}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Destination with suggestions */}
              <View style={{ position: 'relative', zIndex: 9 }}>
                <Input placeholder="Destination city..." value={to} onChangeText={fetchDst} />
                {dstSuggestions.length > 0 && (
                  <View style={sugStyle}>
                    {dstSuggestions.map((s, i) => (
                      <TouchableOpacity key={`dst-${i}`} onPress={() => { setTo(s); setDstSuggestions([]); }} style={sugItem}>
                        <Text style={{ fontSize: 13, color: colors.text }}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Weight + Date row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <Input
            placeholder="Weight (tons)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={{ flex: 1, marginBottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ flex: 1, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13, justifyContent: 'center' }}
          >
            <Text style={{ color: dateText ? colors.text : colors.muted, fontSize: 14 }}>
              {dateText || '📅 Select Date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                setDateText(selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
              }
            }}
          />
        )}

        <SectionLabel label="Priority" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {['Normal', 'Urgent'].map(p => (
            <TouchableOpacity key={p} onPress={() => setPriority(p)} style={{ flex: 1, backgroundColor: priority === p ? colors.accentS : colors.surface2, borderWidth: priority === p ? 2 : 1, borderColor: priority === p ? colors.accent : colors.border, borderRadius: 8, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: priority === p ? colors.accent : colors.sub }}>{p} {p === 'Urgent' ? '🔴' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
        ) : (
          <>
            <Btn label="✅ Create Shipment" onPress={handleCreate} />
            <Btn label="⚡ Find Best Route First" onPress={() => navigation.navigate('Optimizer')} variant="outline" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// S13 — Active Shipments
export function ShipmentsScreen({ navigation }) {
  const [filter, setFilter] = useState('Active');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const mockData = [
    { id: 's1', from: 'Chennai', to: 'Coimbatore', status: 'In Transit', material: 'Steel', km: 488, cost: 12400, progress: 62, transport: 'truck' },
    { id: 's2', from: 'Madurai', to: 'Trichy', status: 'Delivered', material: 'Cement', km: 132, cost: 5800, progress: 100, transport: 'truck' },
    { id: 's3', from: 'Salem', to: 'Erode', status: 'Pending', material: 'Grains', km: 80, cost: 3200, progress: 0, transport: 'truck' },
  ];
  let timedOut = false;
  let unsub = () => {};
  const timeout = setTimeout(() => {
    if (!timedOut) { timedOut = true; setShipments(mockData); setLoading(false); }
  }, 3000);
  try {
    unsub = listenShipments(data => {
      clearTimeout(timeout); timedOut = true; setShipments(data); setLoading(false);
    });
  } catch (e) {
    clearTimeout(timeout); setShipments(mockData); setLoading(false);
  }
  return () => { unsub(); clearTimeout(timeout); };
}, []);

  const filtered = filter === 'Active'
    ? shipments.filter(s => s.status !== 'Delivered')
    : shipments.filter(s => s.status === 'Delivered');

  const otherCount = filter === 'Active'
    ? shipments.filter(s => s.status === 'Delivered').length
    : shipments.filter(s => s.status !== 'Delivered').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          <Text style={h1}>Shipments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewShipment')}><Text style={{ fontSize: 24 }}>➕</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['Active', 'Done'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ backgroundColor: filter === f ? colors.accent : colors.surface2, borderWidth: 1, borderColor: filter === f ? colors.accent : colors.border, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f ? colors.bg : colors.sub }}>
                {f} ({filter === f ? filtered.length : otherCount})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 30 }} />
        ) : filtered.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 30 }}>
              {filter === 'Active' ? 'No active shipments.\nTap ➕ to create one!' : 'No completed shipments yet.'}
            </Text>
          </Card>
        ) : (
          filtered.map(s => (
            <TouchableOpacity key={s.id} onPress={() => navigation.navigate('ShipmentDetail', { shipment: s })}>
              <Card>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TransportIcon type={s.transport} size={26} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{s.from} → {s.to}</Text>
                      <Badge label={s.status} type={STATUS_TYPE[s.status] || 'default'} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 6 }}>{s.material} · {s.km} km</Text>
                    {s.progress > 0 && <ProgressBar percent={s.progress} color={TRANSPORT_COLOR[s.transport]} />}
                    <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: 4 }}>₹{s.cost?.toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// S14 — Shipment Detail
export function ShipmentDetailScreen({ navigation, route }) {
  const s = route.params?.shipment || {};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <View style={{ backgroundColor: colors.greenS, borderWidth: 1, borderColor: colors.green, borderRadius: radius.lg, padding: 16, alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontSize: 11, color: colors.green, fontWeight: '700', letterSpacing: 1 }}>{s.status?.toUpperCase()}</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 4 }}>{s.from} → {s.to}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <StatCard value={`${s.km} km`} label="Distance" color={colors.blue} style={{ flex: 1 }} />
          <StatCard value={s.time || 'TBD'} label="ETA" color={colors.green} style={{ flex: 1 }} />
        </View>
        <Card>
          <SectionLabel label="Shipment Info" />
          {[['Material', s.material], ['Weight', s.weight ? `${s.weight} tons` : 'N/A'], ['Priority', s.priority || 'Normal'], ['Driver', s.driver], ['Pickup Date', s.pickupDate || s.date], ['Created', s.date]].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>{k}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{v}</Text>
            </View>
          ))}
        </Card>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View><Text style={{ fontSize: 12, color: colors.muted }}>Total Cost</Text><Text style={{ fontSize: 26, fontWeight: '900', color: colors.accent }}>₹{s.cost?.toLocaleString()}</Text></View>
            <TouchableOpacity onPress={() => navigation.navigate('Invoice')}><Text style={{ fontSize: 13, color: colors.blue }}>View Invoice →</Text></TouchableOpacity>
          </View>
        </Card>
        {s.progress > 0 && <><ProgressBar percent={s.progress} /><Text style={{ textAlign: 'center', fontSize: 12, color: colors.sub, marginBottom: 16 }}>{s.progress}% complete</Text></>}
        <Btn label="📍 Track Live" onPress={() => navigation.navigate('LiveTrack')} variant="blue" />
        <Btn label="View Timeline" onPress={() => navigation.navigate('DeliveryStatus')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S15 — Analytics
export function AnalyticsScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenShipments(data => {
      setShipments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Build the last 6 real calendar months (oldest → newest)
  const monthBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), total: 0 };
  });
  shipments.forEach(s => {
    if (!s.createdAt) return;
    const d = new Date(s.createdAt);
    const bucket = monthBuckets.find(b => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.total += s.cost || 0;
  });
  const maxSpend = Math.max(1, ...monthBuckets.map(b => b.total));
  const bars = monthBuckets.map(b => Math.round((b.total / maxSpend) * 100));
  const months = monthBuckets.map(b => b.label);

  const thisMonth = monthBuckets[5];
  const lastMonth = monthBuckets[4];
  const pctChange = lastMonth.total > 0
    ? Math.round(((thisMonth.total - lastMonth.total) / lastMonth.total) * 100)
    : (thisMonth.total > 0 ? 100 : 0);

  const thisMonthShipments = shipments.filter(s => {
    if (!s.createdAt) return false;
    const d = new Date(s.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}` === thisMonth.key;
  });
  const kmCovered = thisMonthShipments.reduce((sum, s) => sum + (Number(s.km) || 0), 0);

  // Transport split across all shipments
  const transportCounts = shipments.reduce((acc, s) => {
    const t = s.transport || 'truck';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const totalTransportCount = shipments.length || 1;
  const transportSplit = Object.entries(transportCounts)
    .map(([t, count]) => ({
      label: t.charAt(0).toUpperCase() + t.slice(1),
      pct: Math.round((count / totalTransportCount) * 100),
      color: TRANSPORT_COLOR[t] || colors.blue,
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          <Text style={h1}>Analytics</Text>
          <Text style={{ fontSize: 13, color: colors.accent, backgroundColor: colors.accentS, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full }}>{monthLabel}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : shipments.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>
              No shipment data yet. Analytics will fill in as you create shipments.
            </Text>
          </Card>
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <StatCard value={`₹${(thisMonth.total / 1000).toFixed(1)}K`} label="Total Spent" style={{ flex: 1, minWidth: '47%' }} />
              <StatCard value={`${pctChange >= 0 ? '↑' : '↓'}${Math.abs(pctChange)}%`} label="vs Last Month" color={pctChange >= 0 ? colors.red : colors.green} style={{ flex: 1, minWidth: '47%' }} />
              <StatCard value={String(thisMonthShipments.length)} label="Shipments" color={colors.blue} style={{ flex: 1, minWidth: '47%' }} />
              <StatCard value={kmCovered.toLocaleString()} label="KM Covered" color={colors.orange} style={{ flex: 1, minWidth: '47%' }} />
            </View>

            <Card>
              <SectionLabel label="Monthly Cost Trend" />
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8 }}>
                {bars.map((h, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: `${Math.max(h, 2)}%`, backgroundColor: i === 5 ? colors.accent : colors.surface3, borderRadius: 4 }} />
                    <Text style={{ fontSize: 9, color: colors.muted }}>{months[i]}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card>
              <SectionLabel label="Transport Split" />
              {transportSplit.map(({ label, pct, color }) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Text style={{ width: 44, fontSize: 13, color: colors.sub }}>{label}</Text>
                  <View style={{ flex: 1, height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
                  </View>
                  <Text style={{ width: 36, fontSize: 12, color: colors.sub, textAlign: 'right' }}>{pct}%</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        <Btn label="View Full Report →" onPress={() => navigation.navigate('Reports')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S15b — Post Job (open marketplace, any driver can browse & apply)
export function PostJobScreen({ navigation }) {
  const [material, setMaterial] = useState('Steel');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [weight, setWeight] = useState('');
  const [distKm, setDistKm] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFrom = async (q) => {
    setFrom(q);
    if (q.length < 2) { setFromSuggestions([]); return; }
    try {
      const s = await apiAutocomplete(q);
      setFromSuggestions(s);
    } catch (e) {
      setFromSuggestions([]);
    }
  };

  const fetchTo = async (q) => {
    setTo(q);
    if (q.length < 2) { setToSuggestions([]); return; }
    try {
      const s = await apiAutocomplete(q);
      setToSuggestions(s);
    } catch (e) {
      setToSuggestions([]);
    }
  };

  const handlePost = async () => {
    if (!from.trim() || !to.trim() || !weight.trim() || !cost.trim()) {
      Alert.alert('Missing Fields', 'Please fill in source, destination, weight and estimated payout.');
      return;
    }
    const costNum = Number(cost);
    if (!costNum || costNum <= 0) {
      Alert.alert('Invalid Payout', 'Enter a valid estimated payout.');
      return;
    }
    setLoading(true);
    try {
      const matInfo = MATERIALS.find(m => m.id === material);
      await postOpenJob({
        origin: from.trim(),
        destination: to.trim(),
        material,
        materialIcon: matInfo?.icon || '📦',
        weight,
        distKm: distKm ? Number(distKm) : 0,
        estimatedCost: costNum,
        notes: notes.trim(),
      });
      Alert.alert('Job Posted! 📢', 'Your job is now visible to available drivers on their Job Board. You\'ll be notified when someone applies.', [
        { text: 'View Applicants', onPress: () => navigation.replace('MyPostedJobs') },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Post a Job</Text>
        <Text style={sub}>Any available driver can see and apply — you pick who gets it.</Text>

        <SectionLabel label="Material Type" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {MATERIALS.map(m => <Chip key={m.id} label={m.id} icon={m.icon} selected={material === m.id} color={m.color} onPress={() => setMaterial(m.id)} />)}
        </View>

        <Card style={{ zIndex: 10 }}>
          <View style={{ zIndex: 50 }}>
            <Input label="From" placeholder="Pickup location" value={from} onChangeText={fetchFrom} style={{ marginBottom: 0 }} />
            {fromSuggestions.length > 0 && (
              <View style={sug.wrap}>
                {fromSuggestions.map((s, i) => (
                  <TouchableOpacity key={`from-${i}`} onPress={() => { setFrom(s); setFromSuggestions([]); }} style={sug.item}>
                    <Text style={sug.text}>📍 {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 12 }} />
          <View style={{ zIndex: 40 }}>
            <Input label="To" placeholder="Drop-off location" value={to} onChangeText={fetchTo} style={{ marginBottom: 0 }} />
            {toSuggestions.length > 0 && (
              <View style={sug.wrap}>
                {toSuggestions.map((s, i) => (
                  <TouchableOpacity key={`to-${i}`} onPress={() => { setTo(s); setToSuggestions([]); }} style={sug.item}>
                    <Text style={sug.text}>📍 {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 12 }} />
          <Input label="Weight" placeholder="e.g. 5 tons" value={weight} onChangeText={setWeight} />
          <Input label="Distance (km, optional)" placeholder="e.g. 450" value={distKm} onChangeText={setDistKm} keyboardType="numeric" />
          <Input label="Estimated Payout (₹)" placeholder="e.g. 12000" value={cost} onChangeText={setCost} keyboardType="numeric" />
          <Input label="Notes (optional)" placeholder="e.g. Fragile, needs tarpaulin" value={notes} onChangeText={setNotes} />
        </Card>

        <Btn label={loading ? 'Posting...' : 'Post Job'} onPress={handlePost} disabled={loading} style={{ marginTop: 14 }} />
        <Btn label="View My Posted Jobs" onPress={() => navigation.navigate('MyPostedJobs')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S15c — My Posted Jobs (review applicants, confirm one)
export function MyPostedJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    const unsub = listenCompanyJobs(data => {
      setJobs(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleConfirm = (job, driverUid, driverName) => {
    Alert.alert(
      'Confirm Driver',
      `Give this job to ${driverName || 'this driver'}? Other applicants will be turned down automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setConfirmingId(job.id);
            try {
              await confirmJobApplicant(job.id, driverUid);
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setConfirmingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>My Posted Jobs</Text>
        <Text style={sub}>Review applicants and confirm a driver.</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : jobs.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>
              You haven't posted any open jobs yet.
            </Text>
          </Card>
        ) : (
          jobs.map(job => {
            const applicants = job.applicants ? Object.values(job.applicants) : [];
            return (
              <Card key={job.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 }}>{job.materialIcon} {job.origin} → {job.destination}</Text>
                  <Badge label={job.status === 'filled' ? 'Filled' : 'Open'} type={job.status === 'filled' ? 'green' : 'blue'} />
                </View>
                <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 10 }}>{job.material} · ₹{(job.estimatedCost || 0).toLocaleString()}</Text>

                {job.status === 'filled' ? (
                  <Text style={{ fontSize: 12, color: colors.green }}>✅ Confirmed with a driver</Text>
                ) : applicants.length === 0 ? (
                  <Text style={{ fontSize: 12, color: colors.muted }}>No applicants yet.</Text>
                ) : (
                  applicants.map(a => (
                    <View key={a.uid} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{a.driverName || a.uid}</Text>
                        <Text style={{ fontSize: 11, color: colors.muted }}>Applied {new Date(a.appliedAt).toLocaleString('en-IN')}</Text>
                      </View>
                      <Btn
                        label={confirmingId === job.id ? 'Confirming...' : 'Confirm'}
                        onPress={() => handleConfirm(job, a.uid, a.driverName)}
                        disabled={confirmingId === job.id}
                        style={{ marginBottom: 0, paddingVertical: 8, paddingHorizontal: 14 }}
                      />
                    </View>
                  ))
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// S16 — Fleet
const FLEET_STALE_MS = 2 * 60 * 1000; // treat GPS as "stale" if no update in 2 min
const TRANSPORT_ICON = { truck: '🚛', train: '🚂', ship: '🚢' };

export function FleetScreen({ navigation }) {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenCompanyFleet(data => {
      setFleet(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          <Text style={h1}>Fleet Overview</Text>
          <Text style={{ fontSize: 13, color: colors.green }}>{fleet.length} Active</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : fleet.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>
              No vehicles on the road yet. A vehicle appears here once a driver accepts a shipment.
            </Text>
          </Card>
        ) : (
          fleet.map(v => {
            const loc = v.location;
            const staleMs = loc ? Date.now() - loc.updatedAt : null;
            const isLive = loc && staleMs < FLEET_STALE_MS;
            return (
              <Card key={v.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 26 }}>{TRANSPORT_ICON[v.transport] || '🚛'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{v.vehicleId || 'Vehicle pending'}</Text>
                    <Text style={{ fontSize: 12, color: colors.sub }}>{v.driverName || 'Driver'}</Text>
                  </View>
                  <Badge label={v.status === 'confirmed' ? 'In Transit' : v.status} type={v.status === 'confirmed' ? 'green' : (STATUS_TYPE[v.status] || 'default')} />
                </View>
                <Text style={{ fontSize: 12, color: colors.sub, marginBottom: 4 }}>📍 {v.from} → {v.to}</Text>

                {loc ? (
                  <>
                    <Text style={{ fontSize: 12, color: isLive ? colors.green : colors.orange, fontWeight: '600' }}>
                      {isLive ? '🟢 Live' : '🟠 Last seen'} · {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
                      Updated {Math.max(1, Math.round(staleMs / 1000))}s ago (driver's phone GPS)
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>Waiting for driver's phone GPS…</Text>
                )}

                {v.progress > 0 && <><ProgressBar percent={v.progress} /><Text style={{ fontSize: 11, color: colors.muted }}>{v.progress}% complete</Text></>}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// S17 — Invoice
export function InvoiceScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Invoice #LR-2024</Text>
        <Text style={sub}>Mumbai → Delhi · May 10, 2026</Text>
        <Card>
          <SectionLabel label="Shipment Details" />
          {[['Route', 'Mumbai → Delhi'], ['Material', 'Steel (50 tons)'], ['Transport', '🚂 Train'], ['Distance', '1420 km'], ['Driver', 'Rajesh Kumar'], ['Date', 'May 10–11, 2026']].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>{k}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{v}</Text>
            </View>
          ))}
        </Card>
        <Card>
          <SectionLabel label="Cost Breakdown" />
          {[['Base Cost', '₹13,500'], ['GST (18%)', '₹2,430'], ['Insurance', '₹200']].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>{k}</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>{v}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.accent }}>₹16,130</Text>
          </View>
        </Card>
        <Btn label="📄 Download PDF" onPress={() => {}} />
        <Btn label="📤 Share Invoice" onPress={() => {}} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S18 — Team
export function TeamScreen({ navigation }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenCompanyTeam(data => {
      setTeam(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
            <Text style={h1}>Team Members</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('BookTransport')}>
            <Text style={{ fontSize: 13, color: colors.accent, backgroundColor: colors.accentS, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full }}>+ Find Drivers</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : team.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: colors.sub, paddingVertical: 20 }}>
              No team yet. Drivers you've booked will show up here.
            </Text>
          </Card>
        ) : (
          team.map(m => (
            <ListItem key={m.driverUid}
              left={<View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.accentS, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>🚚</Text></View>}
              title={m.name}
              subtitle={`${m.vehicle || 'Vehicle unknown'} · ${m.trips} trip${m.trips === 1 ? '' : 's'}${m.rating ? ` · ⭐ ${m.rating}` : ''}`}
              right={<Badge label={m.online ? 'Online' : 'Offline'} type={m.online ? 'green' : 'default'} />}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const sug = StyleSheet.create({
  wrap: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, zIndex: 100 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { fontSize: 13, color: colors.text, fontWeight: '500' }
});