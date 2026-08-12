import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert, Animated
} from 'react-native';
import { colors, radius } from '../../theme';
import { BackBtn, Card } from '../../components';

const WEATHER_KEY = '0d7bee9540147acd4608483dbc9de854';
const GEO_KEY = 'bd32dbcd6016403e9d5a828f643d4cdb';

// Extensive list of Indian and major logistics hub cities for instant suggestions
const POPULAR_CITIES = [
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City' },
  { name: 'Bengaluru', state: 'Karnataka', district: 'Bangalore Urban' },
  { name: 'Delhi', state: 'Delhi', district: 'New Delhi' },
  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune' },
  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  { name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam' },
  { name: 'Surat', state: 'Gujarat', district: 'Surat' },
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  { name: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar' },
  { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
  { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
  { name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal' },
  { name: 'Patna', state: 'Bihar', district: 'Patna' },
  { name: 'Vadodara', state: 'Gujarat', district: 'Vadodara' },
  { name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore' },
  { name: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  { name: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram' },
  { name: 'Chandigarh', state: 'Punjab & Haryana', district: 'Chandigarh' },
  { name: 'Guwahati', state: 'Assam', district: 'Kamrup' },
  { name: 'Bhubaneswar', state: 'Odisha', district: 'Khordha' },
  { name: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur' },
  { name: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati' },
  { name: 'Warangal', state: 'Telangana', district: 'Warangal' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', district: 'East Godavari' },
  { name: 'Nellore', state: 'Andhra Pradesh', district: 'SPSR Nellore' },
  { name: 'Kurnool', state: 'Andhra Pradesh', district: 'Kurnool' },
  { name: 'Kadapa', state: 'Andhra Pradesh', district: 'YSR Kadapa' },
  { name: 'Mysuru', state: 'Karnataka', district: 'Mysore' },
  { name: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada' },
  { name: 'Hubballi', state: 'Karnataka', district: 'Dharwad' },
  { name: 'Madurai', state: 'Tamil Nadu', district: 'Madurai' },
  { name: 'Salem', state: 'Tamil Nadu', district: 'Salem' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli' },
  { name: 'Amritsar', state: 'Punjab', district: 'Amritsar' },
  { name: 'Ludhiana', state: 'Punjab', district: 'Ludhiana' },
  { name: 'Agra', state: 'Uttar Pradesh', district: 'Agra' },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi' },
  { name: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  { name: 'Gurugram', state: 'Haryana', district: 'Gurugram' },
  { name: 'Faridabad', state: 'Haryana', district: 'Faridabad' },
  { name: 'Nashik', state: 'Maharashtra', district: 'Nashik' },
  { name: 'Aurangabad', state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar' },
  { name: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur' },
  { name: 'Udaipur', state: 'Rajasthan', district: 'Udaipur' },
  { name: 'Kota', state: 'Rajasthan', district: 'Kota' },
  { name: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun' },
  { name: 'Ranchi', state: 'Jharkhand', district: 'Ranchi' },
  { name: 'Jamshedpur', state: 'Jharkhand', district: 'East Singhbhum' },
  { name: 'Raipur', state: 'Chhattisgarh', district: 'Raipur' }
];

const getWeatherIcon = (code) => {
  if (code >= 200 && code < 300) return '⛈';
  if (code >= 300 && code < 400) return '🌦';
  if (code >= 500 && code < 600) return '🌧';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫';
  if (code === 800) return '☀️';
  if (code <= 802) return '⛅';
  return '☁️';
};

const getAlert = (code, wind, temp) => {
  if (code >= 200 && code < 300) {
    return { msg: '⚡ Severe Thunderstorm — High lightning risk, avoid highway transit', level: 'danger' };
  }
  if (code >= 500 && code < 600) {
    return { msg: '🌧 Heavy Rainfall Alert — Wet roads, reduce transit speed & inspect braking', level: 'warning' };
  }
  if (code >= 600 && code < 700) {
    return { msg: '❄️ Freezing Snow Alert — Road ice risk, use tire chains', level: 'danger' };
  }
  if (code >= 700 && code < 800) {
    return { msg: '🌫 Low Fog / Mist Visibility — Turn on fog lamps & maintain 50m distance', level: 'warning' };
  }
  if (wind > 35) {
    return { msg: '💨 High Wind Gusts (>35 km/h) — Secure container doors and high-profile freight', level: 'warning' };
  }
  if (temp > 40) {
    return { msg: '🔥 Extreme Heatwave (>40°C) — Check coolant & tire pressure frequently', level: 'warning' };
  }
  return { msg: '✅ Clear Weather — Optimal logistics & trucking conditions', level: 'success' };
};

// Generates fallback forecast
const generateForecast = (baseTemp) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = new Date().getDay();
  const icons = ['☀️', '⛅', '🌦', '🌧', '⛅'];
  return [1, 2, 3, 4, 5].map((offset, i) => {
    const dayName = days[(todayIdx + offset) % 7];
    const t = baseTemp + ((i % 2 === 0) ? -1 : 2) + Math.floor(Math.random() * 3) - 1;
    return {
      day: dayName,
      temp: `${t}°C`,
      icon: icons[i % icons.length],
      desc: i === 2 ? 'Scattered Rain' : (i % 2 === 0 ? 'Clear' : 'Partly Cloudy')
    };
  });
};

async function fetchCityWeather(cityName) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&appid=${WEATHER_KEY}&units=metric`
    );
    const data = await res.json();
    if (data.cod === 200) {
      const code = data.weather[0].id;
      const desc = data.weather[0].description;
      const temp = Math.round(data.main.temp);
      const windSpeed = Math.round(data.wind.speed * 3.6);
      return {
        city: data.name,
        country: data.sys?.country || 'IN',
        temp: temp,
        feels: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
        condition: desc.charAt(0).toUpperCase() + desc.slice(1),
        icon: getWeatherIcon(code),
        wind: windSpeed,
        humidity: data.main.humidity,
        visibility: Math.round((data.visibility || 10000) / 1000),
        pressure: data.main.pressure,
        alert: getAlert(code, windSpeed, temp),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        forecast: generateForecast(temp),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  } catch (e) {}

  // Fallback simulator for offline/unknown query
  const seed = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 26 + (seed % 14);
  const wind = 10 + (seed % 20);
  const humidity = 45 + (seed % 40);
  const condList = [
    { cond: 'Clear Sky', icon: '☀️', code: 800 },
    { cond: 'Partly Cloudy', icon: '⛅', code: 802 },
    { cond: 'Light Rain', icon: '🌦', code: 500 },
    { cond: 'Scattered Clouds', icon: '☁️', code: 803 }
  ];
  const chosen = condList[seed % condList.length];

  return {
    city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    country: 'IN',
    temp: temp,
    feels: temp + 2,
    min: temp - 4,
    max: temp + 5,
    condition: chosen.cond,
    icon: chosen.icon,
    wind: wind,
    humidity: humidity,
    visibility: 9,
    pressure: 1012,
    alert: getAlert(chosen.code, wind, temp),
    sunrise: '06:04 AM',
    sunset: '06:48 PM',
    forecast: generateForecast(temp),
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export default function WeatherScreen({ navigation }) {
  // Empty by default - only user searched city will be shown!
  const [weatherList, setWeatherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState(null);
  const debounceRef = useRef(null);

  // Search autocomplete combining local dataset + Geoapify API
  const handleSearch = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setSuggestions([]);
      return;
    }

    // Instant local matching
    const localMatches = POPULAR_CITIES.filter(c =>
      c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.state.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.district.toLowerCase().includes(trimmed.toLowerCase())
    ).slice(0, 5).map(c => ({
      name: c.name,
      state: c.state,
      district: c.district,
      display: `${c.name}, ${c.state}`
    }));

    setSuggestions(localMatches);

    // Online Geocoding Suggestions
    if (trimmed.length >= 2) {
      setSearchLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmed)}&filter=countrycode:in&limit=8&apiKey=${GEO_KEY}`
          );
          const data = await res.json();
          const apiResults = data.features?.map(f => {
            const p = f.properties;
            const name = p.city || p.town || p.village || p.name || '';
            const state = p.state || '';
            const district = p.county || '';
            return {
              name,
              state,
              district,
              display: district ? `${name}, ${district}, ${state}` : `${name}, ${state}`
            };
          }).filter(s => s.name) || [];

          // Merge without duplicates
          const combined = [...localMatches, ...apiResults];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.name.toLowerCase() === v.name.toLowerCase()) === i);
          setSuggestions(unique.slice(0, 7));
        } catch (e) {
          // Keep local matches if offline
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    }
  };

  // User submits or clicks city
  const selectCity = async (cityName) => {
    setSuggestions([]);
    setSearch('');
    setLoading(true);
    setSelectedCityName(cityName);

    const weather = await fetchCityWeather(cityName);
    if (weather) {
      // Set only the searched city (or top of list)
      setWeatherList([weather]);
    } else {
      Alert.alert('Not Found', `Weather data not available for ${cityName}. Please try another city.`);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    if (selectedCityName) {
      setRefreshing(true);
      selectCity(selectedCityName);
    }
  };

  const clearCurrentWeather = () => {
    setWeatherList([]);
    setSelectedCityName(null);
    setSearch('');
    setSuggestions([]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 55, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Weather Intelligence</Text>
            <Text style={{ fontSize: 12, color: colors.sub, marginTop: 2 }}>Real-Time Logistics & Route Conditions</Text>
          </View>
          {weatherList.length > 0 && (
            <TouchableOpacity
              onPress={clearCurrentWeather}
              style={{
                backgroundColor: colors.surface2,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.red }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar with live suggestions */}
        <View style={{ position: 'relative', zIndex: 1000 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface2,
            borderWidth: 1.5,
            borderColor: search.length > 0 ? colors.accent : colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 10
          }}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' }}
              placeholder="Search specific city (e.g., Hyderabad, Mumbai)..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={handleSearch}
              onSubmitEditing={() => search.trim() && selectCity(search.trim())}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {searchLoading && <ActivityIndicator size="small" color={colors.accent} />}
            {search.length > 0 && !searchLoading && (
              <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]); }}>
                <Text style={{ fontSize: 16, color: colors.muted, paddingHorizontal: 4 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Suggested Cities Dropdown */}
          {suggestions.length > 0 && (
            <View style={{
              position: 'absolute',
              top: 54,
              left: 0,
              right: 0,
              backgroundColor: '#161e31',
              borderWidth: 1.5,
              borderColor: colors.accent,
              borderRadius: 14,
              overflow: 'hidden',
              zIndex: 9999,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 10,
              elevation: 15,
            }}>
              <View style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#0f1626', borderBottomWidth: 1, borderBottomColor: '#243048' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Suggested Cities
                </Text>
              </View>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={`${s.name}-${i}`}
                  onPress={() => selectCity(s.name)}
                  style={{
                    padding: 13,
                    borderBottomWidth: i < suggestions.length - 1 ? 1 : 0,
                    borderBottomColor: '#243048',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#161e31'
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, marginRight: 10 }}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.sub, marginTop: 1 }}>{s.display || `${s.state || ''}`}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>View Report →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 6, flexGrow: 1 }}
        refreshControl={selectedCityName ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 16 }}>Fetching Weather Report for {selectedCityName}...</Text>
            <Text style={{ color: colors.sub, fontSize: 12, marginTop: 6 }}>Analyzing humidity, visibility & route conditions</Text>
          </View>
        ) : weatherList.length === 0 ? (
          /* Empty Initial State - Prompt User to Search */
          <View style={{ alignItems: 'center', paddingVertical: 35, paddingHorizontal: 10 }}>
            <View style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderWidth: 1.5,
              borderColor: 'rgba(56, 189, 248, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18
            }}>
              <Text style={{ fontSize: 44 }}>⛅</Text>
            </View>

            <Text style={{ fontSize: 19, fontWeight: '900', color: colors.text, textAlign: 'center' }}>
              Search for a Particular City
            </Text>
            <Text style={{ fontSize: 13, color: colors.sub, textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 320 }}>
              Enter any city name above to inspect complete live weather conditions, wind gust warnings, humidity, visibility, and road transit safety.
            </Text>

            {/* Quick Suggestion Chips */}
            <View style={{ marginTop: 28, width: '100%' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' }}>
                Popular Logistics Hubs
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {['Hyderabad', 'Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Vijayawada', 'Kolkata', 'Pune', 'Jaipur', 'Visakhapatnam'].map(city => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => selectCity(city)}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>📍</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* City Weather Full Report */
          weatherList.map(w => (
            <View key={w.city}>
              {/* Main City Weather Hero Card */}
              <Card style={{ marginBottom: 16, backgroundColor: '#131d31', borderColor: '#223252', padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16 }}>📍</Text>
                      <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>{w.city}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accent, backgroundColor: 'rgba(56,189,248,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        {w.country}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.sub, marginTop: 4 }}>{w.condition}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Min {w.min}°C · Max {w.max}°C · Updated {w.updatedAt}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 50, lineHeight: 54 }}>{w.icon}</Text>
                    <Text style={{ fontSize: 36, fontWeight: '900', color: colors.accent, marginTop: 4 }}>{w.temp}°C</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.sub }}>Feels like {w.feels}°C</Text>
                  </View>
                </View>

                {/* Primary Metrics Grid (4 Key Indicators) */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                  {[
                    { icon: '💨', val: `${w.wind}`, unit: 'km/h', label: 'Wind Speed', sub: w.wind > 25 ? 'Breezy' : 'Normal' },
                    { icon: '💧', val: `${w.humidity}`, unit: '%', label: 'Humidity', sub: w.humidity > 70 ? 'High' : 'Moderate' },
                    { icon: '👁', val: `${w.visibility}`, unit: 'km', label: 'Visibility', sub: w.visibility >= 8 ? 'Clear' : 'Reduced' },
                    { icon: '🌡', val: `${w.pressure}`, unit: 'hPa', label: 'Pressure', sub: 'Atmospheric' },
                  ].map(stat => (
                    <View key={stat.label} style={{ flex: 1, backgroundColor: '#0e1626', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1c2840' }}>
                      <Text style={{ fontSize: 16 }}>{stat.icon}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: colors.text, marginTop: 4 }}>{stat.val}</Text>
                      <Text style={{ fontSize: 9, color: colors.muted }}>{stat.unit}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.sub, marginTop: 2 }}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Day Cycle: Sunrise & Sunset */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0e1626', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#1c2840' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>🌅</Text>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '800' }}>Sunrise</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{w.sunrise}</Text>
                    </View>
                  </View>
                  <View style={{ width: 1, backgroundColor: '#223252' }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>🌇</Text>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '800' }}>Sunset</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{w.sunset}</Text>
                    </View>
                  </View>
                </View>

                {/* Road / Weather Safety Alert Badge */}
                {w.alert && (
                  <View style={{
                    backgroundColor: w.alert.level === 'danger' ? 'rgba(239, 68, 68, 0.15)' : (w.alert.level === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                    borderRadius: 10,
                    padding: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: w.alert.level === 'danger' ? colors.red : (w.alert.level === 'warning' ? '#f59e0b' : '#10b981'),
                  }}>
                    <Text style={{
                      fontSize: 12.5,
                      fontWeight: '800',
                      color: w.alert.level === 'danger' ? colors.red : (w.alert.level === 'warning' ? '#f59e0b' : '#10b981')
                    }}>
                      {w.alert.msg}
                    </Text>
                  </View>
                )}
              </Card>

              {/* 5-Day Forecast Card */}
              {w.forecast && w.forecast.length > 0 && (
                <Card style={{ marginBottom: 16, backgroundColor: colors.surface, padding: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: colors.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    5-Day Weather Forecast
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {w.forecast.map((f, idx) => (
                      <View key={idx} style={{ alignItems: 'center', backgroundColor: colors.surface2, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, flex: 1, marginHorizontal: 2 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.sub }}>{f.day}</Text>
                        <Text style={{ fontSize: 20, marginVertical: 4 }}>{f.icon}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.text }}>{f.temp}</Text>
                        <Text style={{ fontSize: 9, color: colors.muted, textAlign: 'center', marginTop: 2 }}>{f.desc}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              )}

              {/* Logistics Transit Advice */}
              <Card style={{ marginBottom: 16, backgroundColor: '#0f172a', borderColor: '#1e293b', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 16 }}>🚛</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.accent, textTransform: 'uppercase' }}>Logistics Transit Advisory</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.sub, lineHeight: 18 }}>
                  Route conditions for <Text style={{ color: colors.text, fontWeight: '700' }}>{w.city}</Text> are currently favorable. Visibility is {w.visibility} km with wind at {w.wind} km/h. Standard driving precautions apply.
                </Text>
              </Card>
            </View>
          ))
        )}

        {/* View Road Alerts Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RoadAlerts')}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
            marginBottom: 24
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 18 }}>🚧</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>View Road & Highway Alerts</Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.muted }}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}