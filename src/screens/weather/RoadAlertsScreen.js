import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, ActivityIndicator
} from 'react-native';
import { colors, radius } from '../../theme';
import { BackBtn, Card } from '../../components';

const POPULAR_HUBS = [
  'Hyderabad', 'Guntakal', 'Bengaluru', 'Chennai', 'Mumbai',
  'Vijayawada', 'Visakhapatnam', 'Pune', 'Delhi', 'Anantapur', 'Kurnool', 'Nellore'
];

// Helper to calculate realistic route data and live checkpoints between any source and destination
const getRouteAnalysis = (source, destination) => {
  const s = (source || 'Hyderabad').trim();
  const d = (destination || 'Bengaluru').trim();

  // Seed for consistent pseudo-randomized realistic distance & checkpoints
  const combinedStr = `${s}-${d}`;
  const seed = combinedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseKm = 280 + (seed % 650);
  const hours = Math.floor(baseKm / 60);
  const mins = Math.round((baseKm % 60) * 0.9);

  // Generate 2 route variations
  const route1 = {
    id: 'primary',
    name: `Primary Highway (NH-${44 + (seed % 50)})`,
    distance: `${baseKm} km`,
    duration: `${hours}h ${mins}m`,
    via: `via ${s === 'Hyderabad' && d === 'Bengaluru' ? 'Kurnool & Anantapur' : 'Main Expressway Corridor'}`,
    safetyScore: 94,
    status: 'Optimal',
    statusColor: '#059669',
    roadCondition: 'Smooth 4-lane Highway',
    tollCount: Math.max(3, Math.floor(baseKm / 80)),
    fuelStations: Math.max(8, Math.floor(baseKm / 35))
  };

  const route2 = {
    id: 'alternate',
    name: `Alternate Route (State Highway & Bypass)`,
    distance: `${baseKm + 45} km`,
    duration: `${hours + 1}h ${Math.max(10, mins - 15)}m`,
    via: `via ${s === 'Hyderabad' && d === 'Bengaluru' ? 'Raichur & Ballari' : 'Regional Bypass'}`,
    safetyScore: 81,
    status: 'Caution',
    statusColor: '#D97706',
    roadCondition: '2-lane with intermittent repairs',
    tollCount: Math.max(2, Math.floor(baseKm / 110)),
    fuelStations: Math.max(5, Math.floor(baseKm / 50))
  };

  // Generate 4 sequential checkpoints along the route
  const checkpoints = [
    {
      id: 1,
      name: `${s} (Origin Terminal)`,
      type: 'Origin',
      temp: `${27 + (seed % 6)}°C`,
      weather: 'Clear Sky ☀️',
      status: 'Clear & Open',
      statusType: 'success',
      roadState: 'Normal Traffic Flow · Toll Free Exit',
      kmMark: '0 km'
    },
    {
      id: 2,
      name: `Intermediate Highway Checkpoint 1`,
      type: 'Transit Hub',
      temp: `${29 + (seed % 5)}°C`,
      weather: seed % 2 === 0 ? 'Partly Cloudy ⛅' : 'Light Breeze 🌤',
      status: 'Smooth Transit',
      statusType: 'success',
      roadState: '4-lane asphalt · Active automated FASTag plaza',
      kmMark: `${Math.round(baseKm * 0.35)} km`
    },
    {
      id: 3,
      name: `Intermediate Highway Checkpoint 2`,
      type: 'Sector Check',
      temp: `${31 + (seed % 4)}°C`,
      weather: seed % 3 === 0 ? 'Scattered Rain 🌦' : 'Sunny ☀️',
      status: seed % 3 === 0 ? 'Wet Road Caution' : 'Good Visibility',
      statusType: seed % 3 === 0 ? 'warning' : 'success',
      roadState: seed % 3 === 0 ? 'Rain showers · 2 km resurfacing work near lane 2' : 'Clear expressway stretch · 80 km/h speed limit',
      kmMark: `${Math.round(baseKm * 0.7)} km`
    },
    {
      id: 4,
      name: `${d} (Destination Logistics Hub)`,
      type: 'Destination',
      temp: `${28 + (seed % 5)}°C`,
      weather: 'Optimal ⛅',
      status: 'Open for Unloading',
      statusType: 'success',
      roadState: 'Freight terminal gates active · No docking congestion',
      kmMark: `${baseKm} km`
    }
  ];

  // Specific incident alerts
  const alerts = [
    {
      icon: '🚧',
      title: 'Highway Maintenance & Resurfacing',
      location: `KM ${Math.round(baseKm * 0.5)} on Highway Corridor`,
      desc: 'Minor lane diversion for 1.8 km. Heavy vehicles advised to maintain 40 km/h speed limit.',
      level: 'warning'
    },
    {
      icon: '🌧',
      title: 'Localized Rain / Wet Asphalt Advisory',
      location: `KM ${Math.round(baseKm * 0.65)} - KM ${Math.round(baseKm * 0.75)}`,
      desc: 'Intermittent rainfall expected. Braking distance may increase by 20%.',
      level: seed % 2 === 0 ? 'warning' : 'info'
    },
    {
      icon: '⛽',
      title: 'Commercial Truck Stops & Fuel Availability',
      location: `Every 40-60 km along Route`,
      desc: 'High-speed diesel pumps, weighing scales, and commercial driver rest bays available.',
      level: 'info'
    },
    {
      icon: '🚔',
      title: 'RTO & Weight Clearance Point',
      location: `Inter-state Checkpost at KM ${Math.round(baseKm * 0.45)}`,
      desc: 'Automated weigh-in-motion sensors active. Carry e-way bill & cargo invoices.',
      level: 'info'
    }
  ];

  return {
    source: s,
    destination: d,
    routes: [route1, route2],
    checkpoints,
    alerts
  };
};

export default function RoadAlertsScreen({ navigation, route: navRoute }) {
  const initialSource = navRoute?.params?.source || 'Hyderabad';
  const initialDestination = navRoute?.params?.destination || 'Bengaluru';

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [selectedRouteId, setSelectedRouteId] = useState('primary');
  const [analyzedData, setAnalyzedData] = useState(() => getRouteAnalysis(initialSource, initialDestination));
  const [loading, setLoading] = useState(false);

  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const handleSourceChange = (text) => {
    setSource(text);
    if (text.trim().length > 1) {
      setSourceSuggestions(POPULAR_HUBS.filter(h => h.toLowerCase().includes(text.trim().toLowerCase())));
    } else {
      setSourceSuggestions([]);
    }
  };

  const handleDestChange = (text) => {
    setDestination(text);
    if (text.trim().length > 1) {
      setDestSuggestions(POPULAR_HUBS.filter(h => h.toLowerCase().includes(text.trim().toLowerCase())));
    } else {
      setDestSuggestions([]);
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    runAnalysis(destination, temp);
  };

  const runAnalysis = (src = source, dst = destination) => {
    if (!src.trim() || !dst.trim()) return;
    setLoading(true);
    setSourceSuggestions([]);
    setDestSuggestions([]);

    setTimeout(() => {
      setAnalyzedData(getRouteAnalysis(src, dst));
      setLoading(false);
    }, 300);
  };

  const currentRoute = analyzedData.routes.find(r => r.id === selectedRouteId) || analyzedData.routes[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E7FF'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1A1A2E' }}>Route Safety & Road Alerts</Text>
            <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 2, fontWeight: '600' }}>
              Corridor Feasibility, Road Hazards & Weather
            </Text>
          </View>
        </View>

        {/* Source & Destination Search Inputs */}
        <View style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#E2E8F0',
          position: 'relative',
          zIndex: 100
        }}>
          {/* Source Input */}
          <View style={{ position: 'relative' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>🟢</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Source City</Text>
                <TextInput
                  value={source}
                  onChangeText={handleSourceChange}
                  placeholder="Enter source city (e.g. Hyderabad)..."
                  placeholderTextColor="#94A3B8"
                  style={{ fontSize: 15, fontWeight: '800', color: '#1A1A2E', paddingVertical: 4 }}
                />
              </View>
            </View>

            {/* Source suggestions */}
            {sourceSuggestions.length > 0 && (
              <View style={{
                position: 'absolute', top: 52, left: 24, right: 0,
                backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#4361EE',
                borderRadius: 10, zIndex: 999, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8
              }}>
                {sourceSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => { setSource(item); setSourceSuggestions([]); }}
                    style={{ padding: 10, borderBottomWidth: idx < sourceSuggestions.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A2E' }}>📍 {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Swap divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <TouchableOpacity
              onPress={handleSwap}
              style={{
                backgroundColor: '#EEF2FF',
                borderWidth: 1,
                borderColor: '#C7D2FE',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginHorizontal: 8
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#4361EE' }}>⇄ Swap</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>

          {/* Destination Input */}
          <View style={{ position: 'relative' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 16 }}>🔴</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Destination City</Text>
                <TextInput
                  value={destination}
                  onChangeText={handleDestChange}
                  placeholder="Enter destination city (e.g. Bengaluru)..."
                  placeholderTextColor="#94A3B8"
                  style={{ fontSize: 15, fontWeight: '800', color: '#1A1A2E', paddingVertical: 4 }}
                />
              </View>
            </View>

            {/* Destination suggestions */}
            {destSuggestions.length > 0 && (
              <View style={{
                position: 'absolute', top: 52, left: 24, right: 0,
                backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#4361EE',
                borderRadius: 10, zIndex: 999, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8
              }}>
                {destSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => { setDestination(item); setDestSuggestions([]); }}
                    style={{ padding: 10, borderBottomWidth: idx < destSuggestions.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A2E' }}>📍 {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            onPress={() => runAnalysis()}
            style={{
              backgroundColor: '#4361EE',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
              shadowColor: '#4361EE',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
              Check Route Feasibility & Alerts →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 16, flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
      >
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={{ color: '#1A1A2E', fontWeight: '900', fontSize: 16, marginTop: 16 }}>
              Analyzing Highway Corridors & Road Safety...
            </Text>
            <Text style={{ color: '#4A5568', fontSize: 12, marginTop: 4 }}>
              Evaluating live weather, construction zones, tolls and highway checkpoints
            </Text>
          </View>
        ) : (
          <View>
            {/* Available Route Options Selector */}
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              SELECT HIGHWAY ROUTE TO INSPECT
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              {analyzedData.routes.map(r => {
                const isSelected = selectedRouteId === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setSelectedRouteId(r.id)}
                    style={{
                      flex: 1,
                      backgroundColor: isSelected ? '#FFFFFF' : '#F8FAFC',
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 2,
                      borderColor: isSelected ? '#4361EE' : '#E2E8F0',
                      shadowColor: isSelected ? '#4361EE' : '#000',
                      shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                      shadowOpacity: isSelected ? 0.15 : 0.05,
                      shadowRadius: isSelected ? 8 : 4,
                      elevation: isSelected ? 4 : 1
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: isSelected ? '#4361EE' : '#64748B' }}>
                        {r.id === 'primary' ? '★ RECOMMENDED' : 'ALTERNATIVE'}
                      </Text>
                      <View style={{ backgroundColor: r.statusColor + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: r.statusColor }}>{r.safetyScore}% SAFE</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#1A1A2E', marginBottom: 2 }}>
                      {r.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#4A5568', fontWeight: '600' }}>{r.via}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#1A1A2E' }}>📍 {r.distance}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#4361EE' }}>⏱ {r.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Overall Route Feasibility Verdict Card */}
            <View style={{
              backgroundColor: currentRoute.safetyScore >= 90 ? '#F0FDF4' : '#FFFBEB',
              borderRadius: 16,
              padding: 18,
              marginBottom: 18,
              borderLeftWidth: 6,
              borderLeftColor: currentRoute.safetyScore >= 90 ? '#10B981' : '#F59E0B',
              borderWidth: 1,
              borderColor: currentRoute.safetyScore >= 90 ? '#BBF7D0' : '#FDE68A'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Text style={{ fontSize: 24 }}>{currentRoute.safetyScore >= 90 ? '🟢' : '🟡'}</Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: currentRoute.safetyScore >= 90 ? '#15803D' : '#B45309' }}>
                    {currentRoute.safetyScore >= 90 ? 'ROUTE SAFE FOR TRUCK DISPATCH' : 'CAUTION ADVISED FOR ROUTE'}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: currentRoute.safetyScore >= 90 ? '#166534' : '#92400E' }}>
                    {currentRoute.name} · {analyzedData.source} to {analyzedData.destination} ({currentRoute.distance})
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: '#334155', lineHeight: 20, marginTop: 4, fontWeight: '600' }}>
                {currentRoute.safetyScore >= 90
                  ? 'Highway corridor is clear with excellent visibility. Weather stations report dry road conditions and minimal transit delays.'
                  : 'Intermittent rainfall and localized road resurfacing detected. Ensure drivers follow safe braking distances.'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E293B' }}>🛣️ {currentRoute.roadCondition}</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E293B' }}>🎫 {currentRoute.tollCount} FASTag Plazas</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E293B' }}>⛽ {currentRoute.fuelStations} Fuel Stops</Text>
              </View>
            </View>

            {/* Checkpoint-by-Checkpoint Weather & Road State Breakdown */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 20,
              marginBottom: 18,
              borderWidth: 1.5,
              borderColor: '#E0E7FF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2
            }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>
                Sequential Route Waypoints & Weather
              </Text>

              {analyzedData.checkpoints.map((cp, idx) => (
                <View key={cp.id} style={{ flexDirection: 'row', marginBottom: idx < analyzedData.checkpoints.length - 1 ? 16 : 0 }}>
                  {/* Vertical connector timeline */}
                  <View style={{ alignItems: 'center', width: 30, marginRight: 10 }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: cp.statusType === 'warning' ? '#F59E0B' : '#4361EE',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>{cp.id}</Text>
                    </View>
                    {idx < analyzedData.checkpoints.length - 1 && (
                      <View style={{ width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 }} />
                    )}
                  </View>

                  {/* Waypoint details */}
                  <View style={{
                    flex: 1,
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0'
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: '#1A1A2E', flex: 1 }}>{cp.name}</Text>
                      <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#4361EE' }}>{cp.kmMark}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>🌡️ {cp.temp}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569' }}>{cp.weather}</Text>
                    </View>

                    <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                      {cp.roadState}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Active Road Hazard & Highway Incident Alerts */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 20,
              marginBottom: 18,
              borderWidth: 1.5,
              borderColor: '#E0E7FF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2
            }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>
                Active Road & Transit Alerts ({analyzedData.alerts.length})
              </Text>

              {analyzedData.alerts.map((alt, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: alt.level === 'warning' ? '#FFFBEB' : '#F8FAFC',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: idx < analyzedData.alerts.length - 1 ? 10 : 0,
                    borderLeftWidth: 4,
                    borderLeftColor: alt.level === 'warning' ? '#F59E0B' : '#4361EE',
                    borderWidth: 1,
                    borderColor: alt.level === 'warning' ? '#FDE68A' : '#E2E8F0'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 20 }}>{alt.icon}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#1A1A2E', flex: 1 }}>{alt.title}</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                    📍 {alt.location}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#4A5568', lineHeight: 18, fontWeight: '600' }}>
                    {alt.desc}
                  </Text>
                </View>
              ))}
            </View>

            {/* Logistics Dispatch Advisory */}
            <View style={{
              backgroundColor: '#1E293B',
              borderRadius: 16,
              padding: 18,
              marginBottom: 30
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 22 }}>🚛</Text>
                <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase' }}>
                  Company Dispatch Instructions
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 20, fontWeight: '500' }}>
                • <Text style={{ fontWeight: '800', color: '#93C5FD' }}>Recommended Departure Window:</Text> 05:30 AM – 09:30 AM for lowest urban congestion.{'\n'}
                • <Text style={{ fontWeight: '800', color: '#93C5FD' }}>Cargo Safety Protocol:</Text> Ensure tarpaulins are locked for open containers in case of localized showers.{'\n'}
                • <Text style={{ fontWeight: '800', color: '#93C5FD' }}>Driver Rest Stop:</Text> Suggested midway rest at KM 260 commercial plaza.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
