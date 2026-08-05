import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue, update, off, get } from 'firebase/database';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { colors, radius } from '../theme';
import { BackBtn, Card, StatCard, SectionLabel, Badge, ProgressBar } from '../components';

const PENDING_DRIVERS_DATA = [
  { id: 'D1', name: 'Suresh Babu', phone: '+91 98765 00001', license: 'TN01 20220011111', vehicle: 'TN 01 XY 5678', vehicleType: 'Heavy', city: 'Chennai', experience: '7' },
  { id: 'D2', name: 'Ramesh Kumar', phone: '+91 87654 00002', license: 'AP02 20210022222', vehicle: 'AP 02 AB 1234', vehicleType: 'Medium', city: 'Vijayawada', experience: '4' },
  { id: 'D3', name: 'Murugan S', phone: '+91 76543 00003', license: 'TN58 20190033333', vehicle: 'TN 58 CD 9012', vehicleType: 'Heavy', city: 'Coimbatore', experience: '10' },
];

const RECENT_USERS = [
  { id: 'U1', name: 'Kadiyala Logistics', type: 'company', status: 'Active', join: 'Today' },
  { id: 'U2', name: 'Rajesh Kumar', type: 'driver', status: 'Active', join: 'Today' },
  { id: 'U3', name: 'Tamil Freight Co.', type: 'company', status: 'Pending', join: 'Yesterday' },
  { id: 'U4', name: 'Priya Singh', type: 'driver', status: 'Active', join: 'Yesterday' },
];

const ISSUES = [
  { id: 'I1', title: 'Payment failed for #LR-2024-0510', priority: 'High', status: 'Open' },
  { id: 'I2', title: 'Driver location not updating', priority: 'Medium', status: 'In Progress' },
  { id: 'I3', title: 'Autocomplete slow for Bangalore', priority: 'Low', status: 'Open' },
];

// ── Real platform-wide stats ────────────────────────────────
// Reads across EVERY company's data (not just one user's), so this is a
// one-time fetch with a manual refresh rather than a live onValue listener
// — a realtime subscription here would re-scan the whole database on every
// write from any company or driver, anywhere in the app.
//
// IMPORTANT: this requires your Firebase security rules to grant whoever
// holds the admin role read access to /users and /drivers. Without that,
// these fetches will fail with a permission error — see the error banner
// below if that happens.
async function fetchPlatformStats() {
  const [usersSnap, driversSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'drivers')),
  ]);

  const users = usersSnap.exists() ? usersSnap.val() : {};
  const drivers = driversSnap.exists() ? Object.values(driversSnap.val()) : [];

  const now = new Date();
  const isToday = (ts) => !!ts && new Date(ts).toDateString() === now.toDateString();
  const isThisMonth = (ts) => !!ts && (() => { const d = new Date(ts); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); })();

  // Flatten every shipment across every company
  const allShipments = [];
  Object.values(users).forEach(u => {
    if (u.shipments) allShipments.push(...Object.values(u.shipments));
  });

  const todayShipments = allShipments.filter(s => isToday(s.createdAt));
  const activeToday = todayShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
  const completedToday = todayShipments.filter(s => s.status === 'Delivered').length;
  const revenueThisMonth = allShipments.filter(s => isThisMonth(s.createdAt)).reduce((sum, s) => sum + (s.cost || 0), 0);
  const transportToday = todayShipments.reduce((acc, s) => { const t = s.transport || 'truck'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});

  return {
    companiesCount: Object.keys(users).length,
    driversCount: drivers.length,
    activeDriversCount: drivers.filter(d => d.status === 'available' || d.status === 'busy').length,
    shipmentsToday: todayShipments.length,
    activeToday,
    completedToday,
    revenueThisMonth,
    transportToday,
  };
}

export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview');
  // Start empty + loading; mock data is only a fallback if Firebase never responds.
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [usingMockDrivers, setUsingMockDrivers] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const stats = await fetchPlatformStats();
      setPlatformStats(stats);
    } catch (e) {
      console.warn('fetchPlatformStats error:', e);
      setStatsError('Could not load platform stats — check that your Firebase security rules grant the admin account read access to /users and /drivers.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    const r = ref(db, 'drivers');
    const handler = (snap) => {
      setDriversLoading(false);
      setUsingMockDrivers(false);
      if (!snap.exists()) { setPendingDrivers([]); return; } // real empty state, not mock data
      const all = Object.values(snap.val());
      const pending = all.filter(d => d.status === 'pending');
      setPendingDrivers(pending); // always trust real data, even if empty
    };
    const errorHandler = (err) => {
      console.warn('AdminPanel drivers listener error:', err);
      setDriversLoading(false);
      setUsingMockDrivers(true);
      setPendingDrivers(PENDING_DRIVERS_DATA); // fallback only on real connection error
    };
    onValue(r, handler, errorHandler);
    return () => off(r);
  }, []);

  const tabs = ['overview', 'drivers', 'users', 'shipments', 'issues'];

  const approveDriver = async (d) => {
    const driverId = d.uid || d.id;
    try {
      await update(ref(db, `drivers/${driverId}`), { status: 'available', approvedAt: Date.now() });
      setPendingDrivers(prev => prev.filter(x => (x.uid || x.id) !== driverId));
      Alert.alert('✅ Approved', `${d.name} has been approved and can now receive bookings.`);
    } catch (e) {
      console.warn('approveDriver error:', e);
      Alert.alert('❌ Approve Failed', 'Could not update the driver. Check your connection.\n\n' + (e?.message || ''));
    }
  };

  const rejectDriver = async (d) => {
    const driverId = d.uid || d.id;
    try {
      await update(ref(db, `drivers/${driverId}`), { status: 'rejected', rejectedAt: Date.now() });
      setPendingDrivers(prev => prev.filter(x => (x.uid || x.id) !== driverId));
      Alert.alert('❌ Rejected', `${d.name}'s application has been rejected.`);
    } catch (e) {
      console.warn('rejectDriver error:', e);
      Alert.alert('❌ Reject Failed', 'Could not update the driver. Check your connection.\n\n' + (e?.message || ''));
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        <View style={s.headerTitle}>
          <Text style={s.title}>Admin Panel</Text>
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>🛡 ADMIN</Text></View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[s.tab, activeTab === tab && s.tabActive]}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'drivers' && pendingDrivers.length > 0 ? `Drivers (${pendingDrivers.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <SectionLabel label="Platform Stats" />
              <TouchableOpacity onPress={loadStats}>
                <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '700' }}>{statsLoading ? 'Refreshing…' : '🔄 Refresh'}</Text>
              </TouchableOpacity>
            </View>
            {statsError && (
              <View style={{ backgroundColor: colors.red + '15', borderRadius: 10, borderWidth: 1, borderColor: colors.red + '40', padding: 10, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.red }}>⚠️ {statsError}</Text>
              </View>
            )}
            {statsLoading && !platformStats ? (
              <View style={{ alignItems: 'center', padding: 20 }}><Text style={{ color: colors.textSub }}>Loading platform stats…</Text></View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <StatCard icon="👥" value={String((platformStats?.companiesCount || 0) + (platformStats?.driversCount || 0))} label="Total Accounts" color={colors.blue} style={{ width: '47%' }} />
                  <StatCard icon="🏢" value={String(platformStats?.companiesCount || 0)} label="Companies" color={colors.accent} style={{ width: '47%' }} />
                  <StatCard icon="🚛" value={String(platformStats?.activeDriversCount || 0)} label="Active Drivers" color={colors.green} style={{ width: '47%' }} />
                  <StatCard icon="📦" value={String(platformStats?.shipmentsToday || 0)} label="Today" color={colors.orange} style={{ width: '47%' }} />
                </View>
                {pendingDrivers.length > 0 && (
                  <TouchableOpacity onPress={() => setActiveTab('drivers')}
                    style={{ backgroundColor: colors.yellow + '18', borderRadius: 12, borderWidth: 1, borderColor: colors.yellow + '55', padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>⏳</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.yellow }}>{pendingDrivers.length} Driver Applications Pending</Text>
                      <Text style={{ fontSize: 12, color: colors.sub, marginTop: 2 }}>Tap to review and approve</Text>
                    </View>
                    <Text style={{ color: colors.yellow, fontSize: 18 }}>›</Text>
                  </TouchableOpacity>
                )}
                <Card style={{ borderColor: colors.accent + '44', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>TOTAL REVENUE THIS MONTH</Text>
                    <Text style={{ fontSize: 32, fontWeight: '900', color: colors.accent }}>
                      {(platformStats?.revenueThisMonth || 0) >= 100000
                        ? `₹${((platformStats?.revenueThisMonth || 0) / 100000).toFixed(1)}L`
                        : `₹${((platformStats?.revenueThisMonth || 0) / 1000).toFixed(1)}K`}
                    </Text>
                  </View>
                </Card>
              </>
            )}
            <SectionLabel label="System Health" />
            <Text style={{ fontSize: 11, color: colors.textSub, marginBottom: 8 }}>⚠️ Illustrative only — no uptime monitoring is wired up yet.</Text>
            {[
              { label: 'API Server', status: 'Healthy', uptime: '99.9%', color: colors.green },
              { label: 'Database', status: 'Healthy', uptime: '99.8%', color: colors.green },
              { label: 'Maps API', status: 'Healthy', uptime: '98.5%', color: colors.green },
              { label: 'Notifications', status: 'Degraded', uptime: '94.2%', color: colors.yellow },
            ].map(sys => (
              <View key={sys.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sys.color, marginRight: 12 }} />
                <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' }}>{sys.label}</Text>
                <Text style={{ fontSize: 12, color: sys.color, fontWeight: '700', marginRight: 12 }}>{sys.status}</Text>
                <Text style={{ fontSize: 12, color: colors.textSub }}>{sys.uptime}</Text>
              </View>
            ))}
          </>
        )}

        {/* DRIVERS TAB */}
        {activeTab === 'drivers' && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard value={pendingDrivers.length} label="Pending" color={colors.yellow} style={{ flex: 1 }} />
              <StatCard value={platformStats?.activeDriversCount ?? '—'} label="Approved" color={colors.green} style={{ flex: 1 }} />
            </View>
            <SectionLabel label={`Pending Approvals (${pendingDrivers.length})`} />
            {usingMockDrivers && (
              <View style={{ backgroundColor: colors.red + '15', borderRadius: 10, borderWidth: 1, borderColor: colors.red + '40', padding: 10, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.red }}>⚠️ Showing sample data — could not connect to Firebase. Approve/Reject here won't affect real drivers.</Text>
              </View>
            )}
            {driversLoading ? (
              <View style={{ alignItems: 'center', padding: 30 }}>
                <Text style={{ color: colors.textSub }}>Loading pending drivers...</Text>
              </View>
            ) : pendingDrivers.length === 0 ? (
              <Card style={{ alignItems: 'center', padding: 30 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>All caught up!</Text>
                <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 4 }}>No pending driver approvals</Text>
              </Card>
            ) : (
              pendingDrivers.map(d => (
                <Card key={d.uid || d.id} style={{ borderColor: colors.yellow + '44', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.yellow + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ fontSize: 22 }}>🚛</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{d.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSub }}>{d.phone} · {d.city}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.yellow + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.yellow }}>PENDING</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: colors.surface || colors.card, borderRadius: 8, padding: 10, marginBottom: 10 }}>
                    {[['🪪 License', d.license], ['🚛 Vehicle', `${d.vehicle} (${d.vehicleType})`], ['⏱ Experience', `${d.experience} years`]].map(([label, val]) => (
                      <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: colors.textSub }}>{label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{val}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => approveDriver(d)}
                      style={{ flex: 1, backgroundColor: colors.green, borderRadius: radius.md, padding: 10, alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rejectDriver(d)}
                      style={{ flex: 1, backgroundColor: colors.red + '22', borderRadius: radius.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.red + '44' }}>
                      <Text style={{ color: colors.red, fontWeight: '800', fontSize: 13 }}>✗ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard value={platformStats?.companiesCount ?? '—'} label="Companies" color={colors.accent} style={{ flex: 1 }} />
              <StatCard value={platformStats?.driversCount ?? '—'} label="Drivers" color={colors.green} style={{ flex: 1 }} />
            </View>
            <SectionLabel label="Recent Registrations" />
            {RECENT_USERS.map(u => (
              <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: u.type === 'company' ? colors.accent + '22' : colors.green + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 18 }}>{u.type === 'company' ? '🏢' : '🚛'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{u.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSub }}>{u.type} · {u.join}</Text>
                </View>
                <Badge label={u.status} type={u.status === 'Active' ? 'green' : 'yellow'} />
              </View>
            ))}
          </>
        )}

        {/* SHIPMENTS TAB */}
        {activeTab === 'shipments' && (
          <>
            <SectionLabel label="Today's Activity" />
            {statsLoading && !platformStats ? (
              <View style={{ alignItems: 'center', padding: 20 }}><Text style={{ color: colors.textSub }}>Loading…</Text></View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <StatCard value={String(platformStats?.shipmentsToday || 0)} label="Total Today" color={colors.blue} style={{ flex: 1 }} />
                  <StatCard value={String(platformStats?.activeToday || 0)} label="Active" color={colors.green} style={{ flex: 1 }} />
                  <StatCard value={String(platformStats?.completedToday || 0)} label="Completed" color={colors.accent} style={{ flex: 1 }} />
                </View>
                <SectionLabel label="Transport Split (Today)" />
                {!platformStats?.shipmentsToday ? (
                  <Text style={{ fontSize: 12, color: colors.textSub }}>No shipments created today yet.</Text>
                ) : (
                  Object.entries(platformStats.transportToday)
                    .sort((a, b) => b[1] - a[1])
                    .map(([t, count]) => {
                      const icon = t === 'train' ? '🚂 Train' : t === 'ship' ? '🚢 Ship' : '🚛 Truck';
                      const color = t === 'train' ? colors.blue : t === 'ship' ? colors.purple : colors.orange;
                      return (
                        <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <Text style={{ width: 80, fontSize: 13, color: colors.textSub }}>{icon}</Text>
                          <View style={{ flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                            <View style={{ width: `${(count / platformStats.shipmentsToday) * 100}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
                          </View>
                          <Text style={{ width: 24, fontSize: 12, color: colors.textSub, textAlign: 'right' }}>{count}</Text>
                        </View>
                      );
                    })
                )}
              </>
            )}
          </>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <StatCard value="5" label="Open" color={colors.red} style={{ flex: 1 }} />
              <StatCard value="3" label="In Progress" color={colors.yellow} style={{ flex: 1 }} />
              <StatCard value="12" label="Resolved" color={colors.green} style={{ flex: 1 }} />
            </View>
            {[...ISSUES,
              { id: 'I4', title: 'Invoice PDF not generating', priority: 'Medium', status: 'Open' },
              { id: 'I5', title: 'Hindi translation incomplete', priority: 'Low', status: 'In Progress' },
            ].map(issue => (
              <Card key={issue.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 }}>{issue.title}</Text>
                  <Badge label={issue.priority} type={{ High: 'red', Medium: 'orange', Low: 'default' }[issue.priority]} />
                </View>
                <Badge label={issue.status} type={{ Open: 'orange', 'In Progress': 'blue', Resolved: 'green' }[issue.status]} />
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 14, gap: 12 },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '900', color: colors.text },
  adminBadge: { backgroundColor: colors.purple + '22', borderWidth: 1, borderColor: colors.purple, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadgeText: { fontSize: 10, fontWeight: '800', color: colors.purple },
  tabRow: { maxHeight: 46, marginBottom: 4 },
  tab: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingVertical: 7, paddingHorizontal: 16, height: 34 },
  tabActive: { backgroundColor: colors.accent + '22', borderColor: colors.accent },
  tabText: { fontSize: 12, color: colors.textSub, fontWeight: '600' },
  tabTextActive: { color: colors.accent },
});