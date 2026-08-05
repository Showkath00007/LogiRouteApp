import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert, Animated
} from 'react-native';
import { colors, radius } from '../../theme';
import { BackBtn, Card, SectionLabel } from '../../components';

const WEATHER_KEY = '0d7bee9540147acd4608483dbc9de854';
const GEO_KEY = 'bd32dbcd6016403e9d5a828f643d4cdb';

const DEFAULT_CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata'];

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

const getAlert = (code) => {
  if (code >= 200 && code < 300) return { msg: '⚡ Thunderstorm — avoid open roads', level: 'danger' };
  if (code >= 500 && code < 600) return { msg: '🌧 Heavy rain — check route conditions', level: 'warning' };
  if (code >= 600 && code < 700) return { msg: '❄️ Snowfall alert — drive carefully', level: 'warning' };
  if (code >= 700 && code < 800) return { msg: '🌫 Low visibility — reduce speed', level: 'warning' };
  return null;
};

async function fetchCityWeather(cityName) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&appid=${WEATHER_KEY}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) return null;
    const code = data.weather[0].id;
    const desc = data.weather[0].description;
    return {
      city: data.name,
      state: data.sys?.country || 'IN',
      temp: Math.round(data.main.temp),
      feels: Math.round(data.main.feels_like),
      min: Math.round(data.main.temp_min),
      max: Math.round(data.main.temp_max),
      condition: desc.charAt(0).toUpperCase() + desc.slice(1),
      icon: getWeatherIcon(code),
      wind: Math.round(data.wind.speed * 3.6),
      humidity: data.main.humidity,
      visibility: Math.round((data.visibility || 10000) / 1000),
      pressure: data.main.pressure,
      alert: getAlert(code),
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (e) {
    return null;
  }
}

export default function WeatherScreen({ navigation }) {
  const [weatherList, setWeatherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const debounceRef = useRef(null);

  // Load default cities
  const loadDefaults = async () => {
    try {
      const results = await Promise.all(DEFAULT_CITIES.map(fetchCityWeather));
      setWeatherList(results.filter(Boolean));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadDefaults(); }, []);

  // Search with debounce + Geoapify suggestions
  const handleSearch = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=countrycode:in&limit=7&apiKey=${GEO_KEY}`
        );
        const data = await res.json();
        const results = data.features?.map(f => {
          const p = f.properties;
          const name = p.city || p.town || p.village || p.name || '';
          const state = p.state || '';
          const district = p.county || '';
          return { name, state, district, display: district ? `${name}, ${district}, ${state}` : `${name}, ${state}` };
        }).filter(s => s.name) || [];
        // Remove duplicates
        const unique = results.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        setSuggestions(unique.slice(0, 7));
      } catch (e) {
        setSuggestions([]);
      }
      setSearchLoading(false);
    }, 400);
  };

  // Select a suggestion → fetch weather
  const selectCity = async (suggestion) => {
    setSuggestions([]);
    setSearch('');
    setLoading(true);
    const weather = await fetchCityWeather(suggestion.name);
    if (weather) {
      // Add to top if not already in list
      setWeatherList(prev => {
        const filtered = prev.filter(w => w.city.toLowerCase() !== weather.city.toLowerCase());
        return [weather, ...filtered];
      });
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      Alert.alert('Not Found', `Weather data not available for ${suggestion.name}. Try a nearby larger city.`);
    }
    setLoading(false);
  };

  const onRefresh = () => { setRefreshing(true); loadDefaults(); };

  const removeCity = (cityName) => {
    setWeatherList(prev => prev.filter(w => w.city !== cityName));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0, marginRight: 10 }} />
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, flex: 1 }}>Weather</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={{ fontSize: 18 }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={{ position: 'relative', zIndex: 100 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: search.length > 0 ? colors.accent : colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: 14 }}
              placeholder="Search any city or village in India..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={handleSearch}
              autoCapitalize="words"
            />
            {searchLoading && <ActivityIndicator size="small" color={colors.accent} />}
            {search.length > 0 && !searchLoading && (
              <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]); }}>
                <Text style={{ fontSize: 16, color: colors.muted }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <View style={{
              position: 'absolute', top: 50, left: 0, right: 0,
              backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
              borderRadius: 12, overflow: 'hidden', zIndex: 999,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
            }}>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={`${s.name}-${i}`}
                  onPress={() => selectCity(s)}
                  style={{ padding: 14, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{s.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{s.district ? `${s.district}, ` : ''}{s.state}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.accent }}>Get Weather →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {lastUpdated ? (
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>🕐 Updated {lastUpdated} · Pull to refresh</Text>
        ) : null}
      </View>

      {/* Weather list */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.sub, marginTop: 12 }}>Fetching live weather...</Text>
          </View>
        ) : (
          weatherList.map(w => (
            <Card key={w.city} style={{ marginBottom: 14 }}>
              {/* City header row */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 42, marginRight: 12 }}>{w.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text }}>{w.city}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>{w.condition}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>↓{w.min}° ↑{w.max}°</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 34, fontWeight: '900', color: colors.accent }}>{w.temp}°C</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Feels {w.feels}°C</Text>
                  <TouchableOpacity onPress={() => removeCity(w.city)} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: colors.red }}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats grid */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                {[
                  { icon: '💨', val: `${w.wind}`, unit: 'km/h', label: 'Wind' },
                  { icon: '💧', val: `${w.humidity}`, unit: '%', label: 'Humidity' },
                  { icon: '👁', val: `${w.visibility}`, unit: 'km', label: 'Visibility' },
                  { icon: '🌡', val: `${w.pressure}`, unit: 'hPa', label: 'Pressure' },
                ].map(stat => (
                  <View key={stat.label} style={{ flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>{stat.icon}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 2 }}>{stat.val}</Text>
                    <Text style={{ fontSize: 8, color: colors.muted }}>{stat.unit}</Text>
                    <Text style={{ fontSize: 9, color: colors.sub }}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Sunrise / Sunset */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface2, borderRadius: 8, padding: 10, marginBottom: w.alert ? 10 : 0 }}>
                <Text style={{ fontSize: 12, color: colors.sub }}>🌅 Sunrise  {w.sunrise}</Text>
                <Text style={{ fontSize: 12, color: colors.sub }}>🌇 Sunset  {w.sunset}</Text>
              </View>

              {/* Alert */}
              {w.alert && (
                <View style={{
                  backgroundColor: w.alert.level === 'danger' ? colors.redS : colors.accentS,
                  borderRadius: 8, padding: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: w.alert.level === 'danger' ? colors.red : colors.accent,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: w.alert.level === 'danger' ? colors.red : colors.accent }}>
                    {w.alert.msg}
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('RoadAlerts')}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>🚧 View Road Alerts</Text>
          <Text style={{ fontSize: 16, color: colors.muted }}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}