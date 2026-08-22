import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { useLang } from '../../context/LanguageContext';
import { colors, radius, shadow } from '../../theme';
import { Btn, Card, StatCard, Badge, SectionLabel, BackBtn, Divider, TransportIcon, CostHero, Chip, Input } from '../../components';
import { MATERIALS, apiOptimize, getCityDetails, getSimulatedRouteGeometry, calculateDistance } from '../../data';

const screen = (pt = 60) => ({ padding: 20, paddingTop: pt, flexGrow: 1 });
const h1 = { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 4 };
const sub = { fontSize: 13, color: colors.sub, marginBottom: 20 };

// S25 — Route Optimizer
export function OptimizerScreen({ navigation }) {
  const { t } = useLang();
  const [material, setMaterial] = useState('Steel');
  const [tons, setTons] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  const [srcSuggestions, setSrcSuggestions] = useState([]);
  const [dstSuggestions, setDstSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState([[], [], []]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { apiAutocomplete } = require('../../data');

  const fetchSrc = async (q) => {
    setSource(q);
    if (q.length < 2) { setSrcSuggestions([]); return; }
    const s = await apiAutocomplete(q);
    setSrcSuggestions(s);
  };

  const fetchDst = async (q) => {
    setDestination(q);
    if (q.length < 2) { setDstSuggestions([]); return; }
    const s = await apiAutocomplete(q);
    setDstSuggestions(s);
  };

  const fetchStop = async (q, index) => {
    const updatedStops = [...stops];
    updatedStops[index] = q;
    setStops(updatedStops);

    if (q.length < 2) {
      const updatedSugs = [...stopSuggestions];
      updatedSugs[index] = [];
      setStopSuggestions(updatedSugs);
      return;
    }

    const s = await apiAutocomplete(q);
    const updatedSugs = [...stopSuggestions];
    updatedSugs[index] = s;
    setStopSuggestions(updatedSugs);
  };

  const selectStopValue = (value, index) => {
    const updatedStops = [...stops];
    updatedStops[index] = value;
    setStops(updatedStops);

    const updatedSugs = [...stopSuggestions];
    updatedSugs[index] = [];
    setStopSuggestions(updatedSugs);
  };

  const addStop = () => {
    if (stops.length < 3) {
      setStops([...stops, '']);
      setStopSuggestions([...stopSuggestions, []]);
    }
  };

  const removeStop = (index) => {
    const updatedStops = stops.filter((_, i) => i !== index);
    const updatedSugs = stopSuggestions.filter((_, i) => i !== index);
    setStops(updatedStops);
    setStopSuggestions(updatedSugs);
  };

  const optimize = async () => {
    if (!source || !destination) { setError('Please enter both source and destination.'); return; }
    if (!tons || isNaN(tons) || Number(tons) <= 0) { setError('Please enter a valid weight in tons.'); return; }
    setError('');
    setLoading(true);
    try {
      const activeStops = stops.filter(st => st.trim() !== '');
      const data = await apiOptimize(material, source, destination, Number(tons));
      
      const legs = [];
      const citiesList = [source, ...activeStops, destination];
      let totalDistance = 0;
      let totalTimeMin = 0;

      for (let i = 0; i < citiesList.length - 1; i++) {
        const seed = citiesList[i].charCodeAt(0) + citiesList[i+1].charCodeAt(0);
        const segmentDist = 200 + (seed % 350);
        const hours = Math.floor(segmentDist / 60);
        const mins = Math.round((segmentDist % 60) / 10) * 10;
        
        legs.push({
          from: citiesList[i].split(',')[0],
          to: citiesList[i+1].split(',')[0],
          distance: segmentDist,
          time_text: `${hours}h ${mins}m`
        });
        totalDistance += segmentDist;
        totalTimeMin += segmentDist * 1.1;
      }

      const totalHours = Math.floor(totalTimeMin / 60);
      const totalMins = Math.round(totalTimeMin % 60);

      const enhancedData = {
        ...data,
        distance: totalDistance,
        time_text: `${totalHours}h ${totalMins}m`,
        legs
      };

      navigation.navigate('Result', { data: enhancedData, source, destination, material, tons: Number(tons), stops: activeStops });
    } catch (e) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen(50)} keyboardShouldPersistTaps="handled">
        {/* Header with Back Button */}
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <View style={{ width: 44, height: 44, backgroundColor: colors.accent, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>🚚</Text>
          </View>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{t('optimize')}</Text>
            <Text style={{ fontSize: 12, color: colors.sub }}>Find the best route & freight cost</Text>
          </View>
        </View>

        {/* Material */}
        <Card>
          <SectionLabel label={t('material')} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {MATERIALS.map(m => (
              <TouchableOpacity key={m.id} onPress={() => setMaterial(m.id)} style={{ flex: 1, backgroundColor: material === m.id ? m.color + '22' : colors.surface2, borderWidth: material === m.id ? 2 : 1, borderColor: material === m.id ? m.color : colors.border, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                <Text style={{ fontSize: 10, color: material === m.id ? m.color : colors.sub, fontWeight: material === m.id ? '700' : '400', marginTop: 3 }}>{m.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Cargo Weight */}
        <Card>
          <SectionLabel label="Cargo Weight" />
          <Input
            placeholder="Enter weight in tons (e.g. 25)"
            value={tons}
            onChangeText={setTons}
            keyboardType="numeric"
            style={{ marginBottom: 0 }}
          />
        </Card>

        {/* Route Builder Card */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel label={t('route')} style={{ marginBottom: 0 }} />
            {stops.length < 3 && (
              <TouchableOpacity onPress={addStop}>
                <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '750' }}>➕ Add Stop</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            {/* Visual Route Nodes Connectors */}
            <View style={{ alignItems: 'center', paddingTop: 14, gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green }} />
              <View style={{ width: 2, height: 28, backgroundColor: colors.border }} />
              
              {stops.map((_, i) => (
                <View key={`dot-${i}`} style={{ alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.purple }} />
                  <View style={{ width: 2, height: 28, backgroundColor: colors.border }} />
                </View>
              ))}
              
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />
            </View>

            {/* Inputs Container */}
            <View style={{ flex: 1 }}>
              {/* Source Input */}
              <View style={{ zIndex: 100 }}>
                <Input placeholder={t('source')} value={source} onChangeText={fetchSrc} style={{ marginBottom: 0 }} />
                {srcSuggestions.length > 0 && (
                  <View style={sug.wrap}>
                    {srcSuggestions.map((s, i) => (
                      <TouchableOpacity key={`src-${i}`} onPress={() => { setSource(s); setSrcSuggestions([]); }} style={sug.item}>
                        <Text style={sug.text}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Dynamic Stop Inputs */}
              {stops.map((stopVal, index) => (
                <View key={`stop-input-row-${index}`} style={{ marginTop: 10, zIndex: 90 - index }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Input
                        placeholder={`Stop #${index + 1} (e.g. Pune)`}
                        value={stopVal}
                        onChangeText={(q) => fetchStop(q, index)}
                        style={{ marginBottom: 0 }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => removeStop(index)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 18, color: colors.red }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  {stopSuggestions[index] && stopSuggestions[index].length > 0 && (
                    <View style={sug.wrap}>
                      {stopSuggestions[index].map((s, i) => (
                        <TouchableOpacity key={`stop-${index}-${i}`} onPress={() => selectStopValue(s, index)} style={sug.item}>
                          <Text style={sug.text}>📍 {s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Destination Input */}
              <View style={{ marginTop: 10, zIndex: 10 }}>
                <Input placeholder={t('destination')} value={destination} onChangeText={fetchDst} style={{ marginBottom: 0 }} />
                {dstSuggestions.length > 0 && (
                  <View style={sug.wrap}>
                    {dstSuggestions.map((s, i) => (
                      <TouchableOpacity key={`dst-${i}`} onPress={() => { setDestination(s); setDstSuggestions([]); }} style={sug.item}>
                        <Text style={sug.text}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>

        {error ? <Text style={{ color: colors.red, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}
        <Btn label={t('optimizeRoute')} onPress={optimize} loading={loading} />

        {/* Quick Features */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          {[['📊', 'Compare', 'Compare', colors.purple], ['👤', 'Drivers', 'SelectDriver', colors.green], ['🚛', 'Fleet', 'Fleet', colors.orange], ['🕐', 'History', 'RouteHistory', colors.accent]].map(([icon, label, route, color]) => (
            <TouchableOpacity key={label} onPress={() => navigation.navigate(route)} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              <Text style={{ fontSize: 10, color, fontWeight: '700' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// S26 — Optimize Result
// S26 — Optimize Result
export function ResultScreen({ navigation, route }) {
  const { data, source, destination, material, tons } = route?.params || {
    data: { distance: 1420, time_text: '23h 40m', best_transport: 'train', best_vessel: 'N/A', minimum_cost: 14200 },
    source: 'Mumbai', destination: 'Delhi', material: 'Steel', tons: 1,
  };
  const PORT_CITIES = new Set([
    'chennai', 'mumbai', 'kolkata', 'kochi', 'visakhapatnam', 'vizag',
    'paradip', 'haldia', 'kandla', 'mundra', 'pipavav', 'mormugao',
    'new mangalore', 'mangalore', 'ennore', 'kamarajar', 'tuticorin',
    'thoothukudi', 'krishnapatnam', 'gangavaram', 'kakinada',
  ]);
  const isPort = (city) => PORT_CITIES.has((city || '').toLowerCase().split(',')[0].trim());
  const shipAvailable = isPort(source) && isPort(destination);
  const { MATERIALS: mats } = require('../../data');
  const matRate = mats?.find(m => m.id === material)?.rate || 8;
  const bestTransport = 'truck';

  const stopoverFee = (data.legs && data.legs.length > 1) ? (data.legs.length - 1) * 2500 : 0;
  const baseFreightCost = (data.distance || 1420) * matRate * (tons || 1);
  const tollSurcharge = Math.round(baseFreightCost * 0.08); // 8% toll charge
  const bestCost = baseFreightCost + stopoverFee + tollSurcharge;

  const transportMeta = {
    truck: { icon: '🚛', color: colors.orange, label: 'Road Freight', desc: 'Ideal for shipping goods via road transport.' },
  };
  const t = transportMeta.truck;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        {/* Route Connector Badge */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, ...shadow.sm }}>
          <View style={{ flex: 1.2 }}>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Pickup</Text>
            <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>{source.split(',')[0]}</Text>
          </View>
          
          <View style={{ paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
            <View style={{ height: 1, width: 30, backgroundColor: colors.border }} />
            <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            <View style={{ height: 1, width: 30, backgroundColor: colors.border }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
          </View>

          <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4, textAlign: 'right' }}>Delivery</Text>
            <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '800', color: colors.text, textAlign: 'right' }}>{destination.split(',')[0]}</Text>
          </View>
        </View>

        <CostHero cost={bestCost} sub={`${material} · ${tons || 1} tons via ${bestTransport} · Best rate found`} style={{ marginBottom: 14 }} />
        
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <StatCard value={`${data.distance?.toFixed(0)} km`} label="Distance" color={colors.blue} style={{ flex: 1 }} />
          <StatCard value={data.time_text} label="Est. Time" color={colors.green} style={{ flex: 1 }} />
          <StatCard value={bestTransport} label="Transport" color={t.color} style={{ flex: 1 }} />
          <StatCard value={`${tons || 1}t`} label="Weight" color={colors.purple} style={{ flex: 1 }} />
        </View>

        {/* Route Legs Segment Visualizer */}
        {data.legs && data.legs.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel label="Optimized Multi-Leg Pathway" />
            <View style={{ gap: 10, marginTop: 6 }}>
              {data.legs.map((leg, index) => (
                <View key={`leg-${index}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.accent }}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '750', color: colors.text }}>{leg.from} ➔ {leg.to}</Text>
                      <Text style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>
                        Distance: {leg.distance} km  ·  Est: {leg.time_text}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                      ₹{Math.round(leg.distance * matRate * (tons || 1)).toLocaleString()}
                    </Text>
                  </View>
                  {index < data.legs.length - 1 && (
                    <View style={{ marginLeft: 11, height: 16, width: 2, backgroundColor: colors.border, marginVertical: 4 }} />
                  )}
                </View>
              ))}
            </View>
          </Card>
        )}

        <Card style={{ borderColor: t.color + '44', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: radius.lg, backgroundColor: t.color + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>{t.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: t.color, marginBottom: 4 }}>{t.label}</Text>
            <Text style={{ fontSize: 12, color: colors.sub, lineHeight: 18 }}>{t.desc}</Text>
          </View>
        </Card>

        {/* Cost Breakdown Card */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel label="Cost Breakdown" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.border + '33' }}>
            <Text style={{ fontSize: 13, color: colors.sub }}>Base Freight Cost</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>₹{baseFreightCost.toLocaleString()}</Text>
          </View>
          {stopoverFee > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.border + '33' }}>
              <Text style={{ fontSize: 13, color: colors.sub }}>Intermediate Stopover Fee ({data.legs.length - 1} stops)</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>₹{stopoverFee.toLocaleString()}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.border + '33' }}>
            <Text style={{ fontSize: 13, color: colors.sub }}>Toll & Fuel Surcharges (8%)</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>₹{tollSurcharge.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Total Estimated Cost</Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.accent }}>₹{bestCost.toLocaleString()}</Text>
          </View>
        </Card>

        <Btn label="🗺 View Route Map" onPress={() => navigation.navigate('RouteMap', { data, source, destination })} variant="outline" style={{ marginBottom: 10 }} />
        <Btn label="✅ Book This Transport" onPress={() => navigation.navigate('BookTransport', { data, source, destination, material, tons })} />
      </ScrollView>
    </SafeAreaView>
  );
}

// S27 — Route Map (Google Maps styled navigation map with Web & Mobile support)
export function RouteMapScreen({ navigation, route }) {
  const { source, destination, data } = route?.params || { source: 'Guntakal, Andhra Pradesh', destination: 'Anantapur, Andhra Pradesh', data: {} };
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({
    distance: data?.distance ? `${data.distance.toFixed(0)} km` : '',
    duration: data?.time_text || '',
    summary: 'Highway Corridor'
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRoute() {
      try {
        let srcLat = 15.1678, srcLon = 77.3673;
        let dstLat = 14.6819, dstLon = 77.6006;
        let coords = [];
        let distKm = 0;
        let durMin = 0;
        let summary = 'National & State Highway';

        const cleanSrc = (source || '').split(',')[0].trim();
        const cleanDst = (destination || '').split(',')[0].trim();

        // 1. Resolve coordinates (OSM Nominatim Live query with local fallback)
        try {
          const [geoSrcRes, geoDstRes] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanSrc)}&format=json&countrycodes=in&limit=1`, { headers: { 'User-Agent': 'LogiRouteApp' } }).then(r => r.json()).catch(() => null),
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanDst)}&format=json&countrycodes=in&limit=1`, { headers: { 'User-Agent': 'LogiRouteApp' } }).then(r => r.json()).catch(() => null)
          ]);
          if (geoSrcRes?.[0]) {
            srcLat = parseFloat(geoSrcRes[0].lat);
            srcLon = parseFloat(geoSrcRes[0].lon);
          } else {
            const sd = getCityDetails(cleanSrc);
            srcLat = sd.coords[1];
            srcLon = sd.coords[0];
          }
          if (geoDstRes?.[0]) {
            dstLat = parseFloat(geoDstRes[0].lat);
            dstLon = parseFloat(geoDstRes[0].lon);
          } else {
            const dd = getCityDetails(cleanDst);
            dstLat = dd.coords[1];
            dstLon = dd.coords[0];
          }
        } catch (e) {
          const sd = getCityDetails(cleanSrc);
          srcLat = sd.coords[1];
          srcLon = sd.coords[0];
          const dd = getCityDetails(cleanDst);
          dstLat = dd.coords[1];
          dstLon = dd.coords[0];
        }

        // 2. Query polyline coordinates (OSRM Live engine with local fallback)
        try {
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${srcLon},${srcLat};${dstLon},${dstLat}?overview=full&geometries=geojson&steps=true`);
          const osrmData = await osrmRes.json();
          if (osrmData.routes && osrmData.routes.length > 0) {
            const best = osrmData.routes[0];
            distKm = (best.distance / 1000).toFixed(1);
            durMin = Math.round(best.duration / 60);
            summary = best.legs?.[0]?.summary || 'Direct Highway Route';
            if (best.geometry?.coordinates) {
              coords = best.geometry.coordinates.map(c => [c[1], c[0]]);
            }
          }
        } catch (e) {
          console.log('OSRM routing engine error, using offline trained logic:', e);
        }

        // Local fallback if OSRM failed
        if (coords.length === 0) {
          distKm = calculateDistance(srcLon, srcLat, dstLon, dstLat);
          durMin = Math.round((distKm / 60) * 60);
          summary = 'NH-48 / NH-44 (National Highway)';
          const routeFeat = getSimulatedRouteGeometry([srcLon, srcLat], [dstLon, dstLat]);
          coords = routeFeat.geometry.coordinates.map(c => [c[1], c[0]]);
        }

        const durHours = Math.floor(durMin / 60);
        const durMinsRem = durMin % 60;
        const durText = durHours > 0 ? `${durHours} hr ${durMinsRem} min` : `${durMinsRem} min`;

        if (isMounted) {
          setRouteInfo({
            distance: `${distKm} km`,
            duration: durText,
            summary: summary
          });

          // 3. Generate Google Maps Styled Leaflet HTML with Navigation Mode
          const centerLat = (srcLat + dstLat) / 2;
          const centerLng = (srcLon + dstLon) / 2;
          const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=driving&dir_action=navigate`;

          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
              <title>Google Maps Navigation</title>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body, html { width: 100%; height: 100%; font-family: 'Roboto', -apple-system, sans-serif; overflow: hidden; background: #E8EAED; }
                #map { width: 100%; height: 100%; z-index: 1; }

                /* Standard Google Header */
                .gmap-nav-card {
                  position: absolute;
                  top: 14px;
                  left: 14px;
                  right: 14px;
                  background: #FFFFFF;
                  border-radius: 12px;
                  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
                  z-index: 1000;
                  padding: 12px 16px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
                .gmap-nav-main { display: flex; align-items: center; gap: 12px; }
                .gmap-nav-icon { width: 42px; height: 42px; border-radius: 21px; background: #1A73E8; color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 6px rgba(26,115,232,0.4); }
                .gmap-nav-time { font-size: 19px; font-weight: 800; color: #188038; }
                .gmap-nav-dist { font-size: 14px; color: #5F6368; font-weight: 600; margin-left: 6px; }
                .gmap-nav-via { font-size: 12px; color: #70757A; margin-top: 2px; font-weight: 500; }
                .gmap-launch-btn {
                  background: #1A73E8;
                  color: #FFFFFF !important;
                  text-decoration: none;
                  padding: 10px 16px;
                  border-radius: 24px;
                  font-size: 13px;
                  font-weight: 700;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  box-shadow: 0 3px 8px rgba(26,115,232,0.35);
                  cursor: pointer;
                  border: none;
                }
                .gmap-launch-btn:hover { background: #1557B0; }

                /* Live Turn-by-Turn Navigation HUD (Google Style) */
                #nav-hud {
                  display: none;
                  position: absolute;
                  top: 14px;
                  left: 14px;
                  right: 14px;
                  background: #1B5E20;
                  color: white;
                  border-radius: 16px;
                  padding: 16px 18px;
                  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
                  z-index: 2000;
                  animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .nav-hud-top { display: flex; align-items: center; gap: 14px; }
                .nav-arrow { font-size: 36px; line-height: 36px; }
                .nav-dist-next { font-size: 24px; font-weight: 900; }
                .nav-instruction { font-size: 15px; font-weight: 600; opacity: 0.95; margin-top: 2px; }

                /* Bottom Navigation Bar during active drive */
                #nav-bottom {
                  display: none;
                  position: absolute;
                  bottom: 20px;
                  left: 14px;
                  right: 14px;
                  background: #FFFFFF;
                  border-radius: 18px;
                  padding: 14px 20px;
                  box-shadow: 0 6px 24px rgba(0,0,0,0.28);
                  z-index: 2000;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }

                .speedo-badge {
                  background: #F1F3F4;
                  border: 2px solid #DADCE0;
                  border-radius: 50%;
                  width: 52px;
                  height: 52px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                }
                .speedo-val { font-size: 17px; font-weight: 900; color: #202124; line-height: 18px; }
                .speedo-unit { font-size: 8px; font-weight: 800; color: #70757A; }

                /* Google Markers */
                .origin-pin {
                  background: #188038;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 2.5px solid #FFFFFF;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .origin-pin span { transform: rotate(45deg); color: white; font-weight: 900; font-size: 14px; }

                .dest-pin {
                  background: #EA4335;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 2.5px solid #FFFFFF;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .dest-pin span { transform: rotate(45deg); color: white; font-weight: 900; font-size: 14px; }

                /* Floating Action Controls */
                .fab-container {
                  position: absolute;
                  bottom: 24px;
                  right: 16px;
                  z-index: 1500;
                  display: flex;
                  flex-direction: column;
                  gap: 10px;
                  align-items: flex-end;
                }
                .fab-btn {
                  background: #1A73E8;
                  color: white;
                  border: none;
                  border-radius: 28px;
                  padding: 12px 20px;
                  font-size: 14px;
                  font-weight: 800;
                  box-shadow: 0 4px 14px rgba(26,115,232,0.45);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  transition: transform 0.15s;
                }
                .fab-btn:hover { transform: scale(1.04); }
              </style>
            </head>
            <body>
              {/* Default Overview Card */}
              <div id="overview-card" class="gmap-nav-card">
                <div class="gmap-nav-main">
                  <div class="gmap-nav-icon">🚗</div>
                  <div>
                    <div style="display: flex; align-items: baseline;">
                      <span class="gmap-nav-time">${durText}</span>
                      <span class="gmap-nav-dist">(${distKm} km)</span>
                    </div>
                    <div class="gmap-nav-via">Fastest route • via ${summary}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="gmap-launch-btn" onclick="startInAppNav()" style="background:#188038;">
                    🧭 Start Navigation
                  </button>
                  <a class="gmap-launch-btn" href="${gmapsUrl}" target="_blank">
                    Google Maps ↗
                  </a>
                </div>
              </div>

              {/* Live Turn-by-Turn Navigation Mode HUD */}
              <div id="nav-hud">
                <div class="nav-hud-top">
                  <div class="nav-arrow">⬆️</div>
                  <div>
                    <div class="nav-dist-next" id="nav-dist-label">In 450 m</div>
                    <div class="nav-instruction" id="nav-step-label">Continue straight onto ${summary}</div>
                  </div>
                </div>
              </div>

              <div id="map"></div>

              {/* Bottom Active Drive Bar */}
              <div id="nav-bottom" style="display:none;">
                <div class="speedo-badge">
                  <span class="speedo-val" id="speedo-val">0</span>
                  <span class="speedo-unit">KM/H</span>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 18px; font-weight: 900; color: #188038;">${durText}</div>
                  <div style="font-size: 13px; color: #5F6368; font-weight: 600;">${distKm} km • ETA ${new Date(Date.now() + (durMin || 60)*60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button onclick="stopInAppNav()" style="background:#F1F3F4; border:none; border-radius:12px; padding:10px 14px; font-weight:800; color:#EA4335; cursor:pointer;">
                  ✕ Exit
                </button>
              </div>

              <script>
                const map = L.map('map', {
                  zoomControl: false
                }).setView([${centerLat}, ${centerLng}], 9);

                L.control.zoom({ position: 'bottomright' }).addTo(map);

                // Google Maps Official Vector & Raster Tiles
                const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
                  attribution: '© Google Maps',
                  maxZoom: 20
                });

                const googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
                  attribution: '© Google Satellite',
                  maxZoom: 20
                });

                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap',
                  maxZoom: 19
                });

                googleRoads.addTo(map);

                L.control.layers({
                  "Google Map": googleRoads,
                  "Google Satellite": googleSatellite,
                  "OpenStreetMap": osmLayer
                }, null, { position: 'bottomleft' }).addTo(map);

                const srcIcon = L.divIcon({
                  className: '',
                  html: '<div class="origin-pin"><span>A</span></div>',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                });

                const dstIcon = L.divIcon({
                  className: '',
                  html: '<div class="dest-pin"><span>B</span></div>',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                });

                const originMarker = L.marker([${srcLat}, ${srcLon}], { icon: srcIcon }).addTo(map);
                originMarker.bindPopup('<b style="color:#188038;font-size:14px;">Origin (A):</b><br/><b>${source}</b>').openPopup();

                const destMarker = L.marker([${dstLat}, ${dstLon}], { icon: dstIcon }).addTo(map);
                destMarker.bindPopup('<b style="color:#EA4335;font-size:14px;">Destination (B):</b><br/><b>${destination}</b>');

                const coords = ${JSON.stringify(coords)};

                // Outer border stroke (Google Maps dark blue outline)
                L.polyline(coords, {
                  color: '#1A73E8',
                  weight: 8,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(map);

                // Inner primary stroke (Google Maps vibrant navigation blue)
                const routeLine = L.polyline(coords, {
                  color: '#4285F4',
                  weight: 5,
                  opacity: 1.0,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(map);

                if (coords.length > 0) {
                  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
                }

                // In-App Turn-by-Turn Navigation Engine Simulation
                let navActive = false;
                let navCarMarker = null;
                let navTimer = null;
                let watchId = null;
                let currentCoordIndex = 0;

                function startInAppNav() {
                  navActive = true;
                  document.getElementById('overview-card').style.display = 'none';
                  document.getElementById('nav-hud').style.display = 'block';
                  document.getElementById('nav-bottom').style.display = 'flex';

                  // Focus map closely on origin
                  currentCoordIndex = 0;
                  const startLatLng = coords.length > 0 ? coords[0] : [${srcLat}, ${srcLon}];
                  map.setView(startLatLng, 16, { animate: true });

                  const carIcon = L.divIcon({
                    className: '',
                    html: '<div style="background:#1A73E8; width:22px; height:22px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 0 12px #1A73E8;"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                  });

                  if (navCarMarker) {
                    map.removeLayer(navCarMarker);
                  }
                  navCarMarker = L.marker(startLatLng, { icon: carIcon }).addTo(map);

                  const el = document.getElementById('speedo-val');
                  if (el) el.innerText = '0';

                  // 1. Map Navigation Simulation: Move the car marker along the route path
                  navTimer = setInterval(() => {
                    if (coords.length === 0) return;
                    
                    // Increment coordinate index to move car along the route path
                    if (currentCoordIndex < coords.length - 1) {
                      currentCoordIndex++;
                    } else {
                      currentCoordIndex = 0; // Loop navigation route
                    }
                    
                    const nextLatLng = coords[currentCoordIndex];
                    if (navCarMarker) {
                      navCarMarker.setLatLng(nextLatLng);
                    }
                    
                    // Pan map to follow the car along the route path
                    map.setView(nextLatLng, 16);
                    
                    // Update turn-by-turn guidance prompts dynamically based on coordinate progress
                    const pct = currentCoordIndex / coords.length;
                    document.getElementById('nav-dist-label').innerText = "In " + Math.round(450 * (1 - (pct % 0.1) * 10)) + " m";
                  }, 1000);

                  // 2. Real GPS Speedometer: Query actual physical device speed (0 if stationary)
                  let lastRealPos = null;
                  let lastRealTime = null;

                  if (navigator.geolocation) {
                    watchId = navigator.geolocation.watchPosition((position) => {
                      const c = position.coords;
                      let speedKmh = 0;

                      if (c.speed !== null && c.speed !== undefined && c.speed > 0) {
                        speedKmh = Math.round(c.speed * 3.6);
                      } else if (lastRealPos && lastRealTime) {
                        // Calculate speed from distance delta of physical coordinates
                        const dt = (position.timestamp - lastRealTime) / 1000;
                        if (dt > 0.5) {
                          const dist = map.distance(
                            [lastRealPos.latitude, lastRealPos.longitude],
                            [c.latitude, c.longitude]
                          );
                          speedKmh = Math.round((dist / dt) * 3.6);
                        }
                      }

                      if (speedKmh > 125) speedKmh = 0; // Filter jumps
                      if (el) el.innerText = speedKmh;

                      lastRealPos = c;
                      lastRealTime = position.timestamp;
                    }, (err) => {
                      console.warn("GPS speed tracking warning:", err);
                    }, {
                      enableHighAccuracy: true,
                      maximumAge: 1000,
                      timeout: 5000
                    });
                  }
                }

                function stopInAppNav() {
                  navActive = false;
                  if (navTimer) clearInterval(navTimer);
                  if (watchId) navigator.geolocation.clearWatch(watchId);
                  document.getElementById('overview-card').style.display = 'flex';
                  document.getElementById('nav-hud').style.display = 'none';
                  document.getElementById('nav-bottom').style.display = 'none';
                  if (coords.length > 0) {
                    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
                  }
                }
              </script>
            </body>
            </html>
          `;

          setMapHtml(html);
        }
      } catch (err) {
        console.warn('Route map error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRoute();
    return () => { isMounted = false; };
  }, [source, destination]);

  let WebViewComponent = null;
  try {
    if (Platform.OS !== 'web') {
      WebViewComponent = require('react-native-webview').WebView;
    }
  } catch (e) {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      {/* Header Bar */}
      <View style={{
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E7FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A1A2E' }}>Google Route Navigation</Text>
          <Text style={{ fontSize: 12, color: '#4A5568', fontWeight: '600', marginTop: 1 }}>Live Turn-by-Turn GPS Guidance</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Map Container */}
      <View style={{ flex: 1, backgroundColor: '#E8EAED' }}>
        {loading || !mapHtml ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={{ color: '#1A1A2E', fontWeight: '800', fontSize: 15, marginTop: 14 }}>
              Loading Google Navigation Route...
            </Text>
          </View>
        ) : Platform.OS === 'web' ? (
          /* Web Native iframe */
          <iframe
            title="Google Route Map"
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          /* Mobile WebView */
          WebViewComponent ? (
            <WebViewComponent source={{ html: mapHtml }} style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text>Map preview available</Text>
            </View>
          )
        )}
      </View>

      {/* Bottom Route Summary & Navigation Actions */}
      <View style={{
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E7FF',
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 14 }}>🟢</Text>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '800', color: '#1A1A2E', flex: 1 }}>{source}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 14 }}>🔴</Text>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '800', color: '#1A1A2E', flex: 1 }}>{destination}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#4361EE' }}>{routeInfo.distance}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>{routeInfo.duration}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// S28 — Cost Comparison
export function CompareScreen({ navigation, route }) {
  const { data, source, destination, material, tons } = route?.params || { source: 'Mumbai', destination: 'Delhi', material: 'Steel', data: { distance: 1420 }, tons: 1 };
  const dist = data?.distance || 1420;
  const weight = tons || 1;
  const { MATERIALS: mats } = require('../../data');
  const rate = mats.find(m => m.id === material)?.rate || 8;
  const PORT_CITIES = new Set([
    'chennai', 'mumbai', 'kolkata', 'kochi', 'visakhapatnam', 'vizag',
    'paradip', 'haldia', 'kandla', 'mundra', 'pipavav', 'mormugao',
    'new mangalore', 'mangalore', 'ennore', 'kamarajar', 'tuticorin',
    'thoothukudi', 'krishnapatnam', 'gangavaram', 'kakinada',
  ]);

  const isPortCity = (city) => PORT_CITIES.has((city || '').toLowerCase().trim());
  const shipAvailable = isPortCity(source) && isPortCity(destination);

  const transports = [
    { icon: '🚛', name: 'Truck', range: '< 100 km', speed: 40, mult: 1.2, color: colors.orange, available: true },
    { icon: '🚂', name: 'Train', range: '100–800 km', speed: 60, mult: 0.8, color: colors.blue, available: true },
    { icon: '🚢', name: 'Ship', range: 'Port cities only', speed: 30, mult: 0.5, color: colors.purple, available: shipAvailable },
  ];
  const compared = transports.map(t => ({
    ...t,
    cost: t.available ? dist * rate * t.mult * weight : null,
    time: t.available ? dist / t.speed : null,
    pkm: t.available ? (rate * t.mult).toFixed(1) : null,
  }));
  const minCost = Math.min(...compared.filter(c => c.available).map(c => c.cost));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Cost Comparison</Text>
        <Text style={sub}>{source} → {destination} · {material} · {weight} tons</Text>
        {/* Bar Chart */}
        <Card>
          <SectionLabel label="Cost Chart (₹)" />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 10 }}>
            {compared.map((t, i) => {
              const maxCost = Math.max(...compared.filter(c => c.available).map(c => c.cost));
              const h = t.available ? (t.cost / maxCost) * 100 : 8;
              return (
                <View key={t.name} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 12, color: t.available ? t.color : colors.textMuted, fontWeight: '700' }}>
                    {t.available ? `₹${(t.cost / 1000).toFixed(0)}K` : 'N/A'}
                  </Text>
                  <View style={{ width: '100%', height: `${h}%`, backgroundColor: t.available ? t.color : colors.border, borderRadius: 4 }} />
                  <Text style={{ fontSize: 11, color: t.available ? t.color : colors.textMuted }}>{t.icon} {t.name}</Text>
                </View>
              );
            })}
          </View>
        </Card>
        {compared.map(t => {
          const h = t.available ? Math.floor(t.time) : 0;
          const m = t.available ? Math.round((t.time - h) * 60) : 0;
          const isBest = t.available && t.cost === minCost;
          return (
            <Card key={t.name} style={{ borderColor: isBest ? t.color + '66' : t.available ? colors.border : colors.border, opacity: t.available ? 1 : 0.5, position: 'relative' }}>
              {!t.available && (
                <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: colors.red + 'CC', paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: colors.white }}>🚫 NOT APPLICABLE</Text>
                </View>
              )}
              {isBest && (
                <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: t.color, paddingHorizontal: 10, paddingVertical: 4, borderRadius: `0 ${radius.lg}px 0 ${radius.lg}px`, borderBottomLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: colors.bg }}>⭐ BEST</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: t.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: t.color }}>{t.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>{t.range}</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '900', color: t.available ? t.color : colors.textMuted }}>
                  {t.available ? `₹${t.cost.toFixed(0)}` : 'N/A'}
                </Text>
              </View>
              {t.available ? (
                <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 8, padding: 10 }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{h}h {m}m</Text>
                    <Text style={{ fontSize: 10, color: colors.sub }}>Time</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: colors.border }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{t.speed} km/h</Text>
                    <Text style={{ fontSize: 10, color: colors.sub }}>Speed</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: colors.border }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>₹{t.pkm}/ton-km</Text>
                    <Text style={{ fontSize: 10, color: colors.sub }}>Rate</Text>
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: colors.surface2, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: colors.sub, fontSize: 13 }}>🚫 No sea route between these cities</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>Ship freight requires both cities to be major ports</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// S29 — Route History
export function RouteHistoryScreen({ navigation }) {
  const history = [
    { icon: '🚛', from: 'Mumbai', to: 'Delhi', material: 'Steel', date: 'Today', cost: 14200 },
    { icon: '🚛', from: 'Chennai', to: 'Bangalore', material: 'Cement', date: 'Yesterday', cost: 2076 },
    { icon: '🚛', from: 'Kolkata', to: 'Mumbai', material: 'Coal', date: '2 days ago', cost: 9900 },
    { icon: '🚛', from: 'Delhi', to: 'Hyderabad', material: 'Aluminium', date: '3 days ago', cost: 18000 },
    { icon: '🚛', from: 'Pune', to: 'Surat', material: 'Wood', date: '5 days ago', cost: 1680 },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Route History</Text>
        <Text style={sub}>Your past optimizations</Text>
        {history.map((r, i) => (
          <TouchableOpacity key={i} onPress={() => navigation.navigate('Result')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{r.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{r.from} → {r.to}</Text>
                <Text style={{ fontSize: 12, color: colors.sub }}>{r.material} · {r.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, color: colors.accent, fontWeight: '700' }}>₹{r.cost.toLocaleString()}</Text>
                <Text style={{ fontSize: 12, color: colors.blue }}>Re-optimize</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// S30 — Saved Routes
export function SavedRoutesScreen({ navigation }) {
  const saved = [
    { from: 'Mumbai', to: 'Delhi', material: 'Steel', avg: 14200, last: 'Today', icon: '🚛' },
    { from: 'Chennai', to: 'Bangalore', material: 'Cement', avg: 2076, last: 'Yesterday', icon: '🚛' },
    { from: 'Kolkata', to: 'Mumbai', material: 'Coal', avg: 9900, last: 'Last week', icon: '🚛' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen()}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
            <Text style={h1}>Saved Routes</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.accent }}>+ Save</Text>
        </View>
        {saved.map((r, i) => (
          <Card key={i} style={{ borderColor: colors.accent + '22' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>⭐ {r.icon} {r.from} → {r.to}</Text>
                <Text style={{ fontSize: 12, color: colors.sub }}>{r.material} · Avg ₹{r.avg.toLocaleString()}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Last used: {r.last}</Text>
              </View>
              <Text style={{ fontSize: 20, color: colors.sub }}>🗑</Text>
            </View>
            <Btn label="⚡ Optimize Again" onPress={() => navigation.navigate('Result')} style={{ paddingVertical: 10, marginBottom: 0 }} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const sug = StyleSheet.create({
  wrap: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, zIndex: 100 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { fontSize: 13, color: colors.text },
});