// ============================================================
// API CONFIGURATION
// Switch between MOCK and REAL backend here
// ============================================================

// Set to true to use real FastAPI backend
export const USE_REAL_API = false;

// Your backend URL - change this to your Mac's IP when testing on phone
export const API_BASE = 'http://192.168.1.10:8000';

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_USER = {
  name: 'Kadiyala Showkathali',
  company: 'Kadiyala Logistics',
  city: 'Chennai',
  email: 'kadiyalashowkath6.com',
  phone: '+91 9392859818',
  type: 'company', // 'company' or 'driver'
  verified: true,
  gst: '33AABCK1234M1Z5',
};

export const MOCK_DRIVER = {
  name: 'Rajesh Kumar',
  phone: '+91 98765 11111',
  vehicle: 'TN-01-AB-1234',
  vehicleModel: 'Tata LPT 2516',
  rating: 4.8,
  trips: 342,
  earnings: 84200,
  thisMonth: 8400,
  available: 6200,
  type: 'driver',
};

export const MOCK_SHIPMENTS = [
  { id: 'SH001', from: 'Mumbai', to: 'Delhi', material: 'Steel', km: 1420, transport: 'train', progress: 65, status: 'In Transit', cost: 14200, time: '23h 40m', driver: 'Rajesh Kumar', date: 'Today' },
  { id: 'SH002', from: 'Chennai', to: 'Bangalore', material: 'Cement', km: 346, transport: 'truck', progress: 20, status: 'Pickup', cost: 2076, time: '8h 39m', driver: 'Priya Logistics', date: 'Today' },
  { id: 'SH003', from: 'Kolkata', to: 'Mumbai', material: 'Coal', km: 1980, transport: 'ship', progress: 5, status: 'Booked', cost: 9900, time: '66h', driver: 'Coastal Freight', date: 'Tomorrow' },
  { id: 'SH004', from: 'Delhi', to: 'Hyderabad', material: 'Aluminium', km: 1500, transport: 'train', progress: 0, status: 'Scheduled', cost: 18000, time: '25h', driver: 'Northern Rails', date: 'May 12' },
  { id: 'SH005', from: 'Pune', to: 'Surat', material: 'Wood', km: 240, transport: 'truck', progress: 100, status: 'Delivered', cost: 1680, time: '6h', driver: 'Suresh Verma', date: 'Yesterday' },
];

export const MOCK_HISTORY = [
  { id: 'H001', from: 'Mumbai', to: 'Delhi', material: 'Steel', transport: 'train', cost: 14200, date: 'Today', status: 'Done' },
  { id: 'H002', from: 'Chennai', to: 'Bangalore', material: 'Cement', transport: 'truck', cost: 2076, date: 'Yesterday', status: 'Done' },
  { id: 'H003', from: 'Kolkata', to: 'Mumbai', material: 'Coal', transport: 'ship', cost: 9900, date: '2 days ago', status: 'Done' },
  { id: 'H004', from: 'Delhi', to: 'Hyderabad', material: 'Aluminium', transport: 'train', cost: 18000, date: '3 days ago', status: 'Cancelled' },
  { id: 'H005', from: 'Pune', to: 'Surat', material: 'Wood', transport: 'truck', cost: 1680, date: '5 days ago', status: 'Done' },
];

export const MOCK_DRIVERS = [
  { id: 'D001', name: 'Rajesh Kumar', transport: 'truck', rating: 4.8, trips: 342, location: 'Mumbai', price: '₹12/km', available: true, specialty: 'Steel & Heavy Metals', icon: '🚛' },
  { id: 'D002', name: 'Tamil Rail Co.', transport: 'train', rating: 4.9, trips: 890, location: 'Chennai', price: '₹10/km', available: true, specialty: 'Bulk Coal & Minerals', icon: '🚂' },
  { id: 'D003', name: 'Priya Logistics', transport: 'truck', rating: 4.5, trips: 127, location: 'Bangalore', price: '₹13/km', available: true, specialty: 'Wood & Timber', icon: '🚛' },
  { id: 'D004', name: 'Coastal Freight', transport: 'ship', rating: 4.7, trips: 156, location: 'Mumbai', price: '₹5/km', available: false, specialty: 'Long-Haul Sea Routes', icon: '🚢' },
  { id: 'D005', name: 'Northern Rails', transport: 'train', rating: 4.8, trips: 540, location: 'Delhi', price: '₹8/km', available: true, specialty: 'Aluminium & Metals', icon: '🚂' },
  { id: 'D006', name: 'Suresh Verma', transport: 'truck', rating: 4.6, trips: 218, location: 'Delhi', price: '₹11/km', available: true, specialty: 'Cement & Construction', icon: '🚛' },
];

export const MOCK_JOBS = [
  { id: 'J001', from: 'Mumbai', to: 'Pune', material: 'Steel', km: 150, date: 'Today', earn: 3200, icon: '🚛', urgent: true },
  { id: 'J002', from: 'Delhi', to: 'Jaipur', material: 'Cement', km: 280, date: 'Tomorrow', earn: 2800, icon: '🚛', urgent: false },
  { id: 'J003', from: 'Chennai', to: 'Hyderabad', material: 'Coal', km: 620, date: 'May 12', earn: 5600, icon: '🚂', urgent: false },
  { id: 'J004', from: 'Mumbai', to: 'Surat', material: 'Aluminium', km: 270, date: 'May 13', earn: 3240, icon: '🚛', urgent: false },
];

export const MOCK_WEATHER = {
  Mumbai: { temp: 32, condition: 'Humid & Cloudy', icon: '🌦', wind: 18, humidity: 85, alert: 'Heavy rain possible along coastal routes', alertLevel: 'warning' },
  Delhi: { temp: 38, condition: 'Hot & Hazy', icon: '☀️', wind: 12, humidity: 30, alert: null, alertLevel: null },
  Chennai: { temp: 34, condition: 'Partly Cloudy', icon: '⛅', wind: 22, humidity: 75, alert: 'Cyclone watch active', alertLevel: 'danger' },
  Kolkata: { temp: 30, condition: 'Thunderstorms', icon: '⛈', wind: 35, humidity: 90, alert: 'Avoid low-lying roads', alertLevel: 'warning' },
  Hyderabad: { temp: 35, condition: 'Clear & Sunny', icon: '☀️', wind: 10, humidity: 40, alert: null, alertLevel: null },
  Bangalore: { temp: 26, condition: 'Light Rain', icon: '🌧', wind: 15, humidity: 70, alert: null, alertLevel: null },
};

export const MOCK_NOTIFICATIONS = [
  { id: 'N001', icon: '📦', title: 'Shipment Arrived', msg: 'Mumbai → Delhi delivered successfully', time: '2 min ago', color: '#F5C842', unread: true },
  { id: 'N002', icon: '⚠️', title: 'Route Alert', msg: 'Traffic delay on NH-48 near Vadodara', time: '15 min ago', color: '#FF7A3D', unread: true },
  { id: 'N003', icon: '✅', title: 'Payment Confirmed', msg: '₹16,200 received for #LR-2024-0512', time: '1 hr ago', color: '#2ECC8A', unread: true },
  { id: 'N004', icon: '👤', title: 'New Driver Available', msg: 'Tamil Rail Co. available for your route', time: '3 hrs ago', color: '#4F8EF7', unread: false },
  { id: 'N005', icon: '🌦', title: 'Weather Alert', msg: 'Heavy rain forecast for Mumbai tomorrow', time: '5 hrs ago', color: '#A78BFA', unread: false },
  { id: 'N006', icon: '📊', title: 'Monthly Report Ready', msg: 'Your May 2026 report is ready', time: 'Yesterday', color: '#F5C842', unread: false },
];

export const MOCK_TEAM = [
  { id: 'T001', name: 'Kadiyala Showkathali', role: 'Admin · Owner', status: 'Active', avatar: '🏢' },
  { id: 'T002', name: 'Ravi Shankar', role: 'Manager', status: 'Active', avatar: '👤' },
  { id: 'T003', name: 'Priya Nair', role: 'Logistics Officer', status: 'Away', avatar: '👤' },
  { id: 'T004', name: 'Arjun Mehta', role: 'Finance', status: 'Active', avatar: '👤' },
];

export const MATERIALS = [
  { id: 'Steel', icon: '🔩', color: '#4F8EF7', rate: 12 },
  { id: 'Cement', icon: '🧱', color: '#8892A4', rate: 8 },
  { id: 'Aluminium', icon: '🥈', color: '#A78BFA', rate: 14 },
  { id: 'Coal', icon: '⬛', color: '#4A5568', rate: 6 },
  { id: 'Wood', icon: '🪵', color: '#FF7A3D', rate: 9 },
  { id: 'Iron Ore', icon: '🪨', color: '#B3542E', rate: 7 },
  { id: 'Copper', icon: '🪙', color: '#CA7642', rate: 16 },
  { id: 'Sand', icon: '⏳', color: '#E4CD6D', rate: 5 },
  { id: 'Gravel', icon: '⛰️', color: '#7E8890', rate: 6 },
  { id: 'Bricks', icon: '🧱', color: '#B23A22', rate: 8 },
  { id: 'Granite', icon: '🪨', color: '#566573', rate: 13 },
  { id: 'Marble', icon: '🏛️', color: '#85C1E9', rate: 15 },
  { id: 'Fertilizers', icon: '🌱', color: '#27AE60', rate: 9 },
  { id: 'Wheat', icon: '🌾', color: '#D4AC0D', rate: 7 },
  { id: 'Sugar', icon: '🍬', color: '#EC7063', rate: 8 },
  { id: 'Rice', icon: '🍚', color: '#F4F6F6', rate: 7 },
  { id: 'Cotton', icon: '☁️', color: '#E5E7E9', rate: 10 },
  { id: 'Chemicals', icon: '🧪', color: '#C0392B', rate: 18 },
  { id: 'Petroleum', icon: '🛢️', color: '#1B4F72', rate: 20 },
  { id: 'Paper', icon: '📦', color: '#F39C12', rate: 9 },
  { id: 'Electronics', icon: '💻', color: '#8E44AD', rate: 25 },
  { id: 'Auto Parts', icon: '⚙️', color: '#2C3E50', rate: 22 },
  { id: 'Textiles', icon: '👕', color: '#16A085', rate: 11 },
  { id: 'Plastics', icon: '🥤', color: '#D35400', rate: 10 },
  { id: 'Glass', icon: '🥃', color: '#5DADE2', rate: 16 },
];

// ============================================================
// OFFLINE SIMULATED API CATALOG (TRAINED KEYLESS LOGIC)
// ============================================================

export const INDIAN_CITIES = {
  mumbai: { name: 'Mumbai', state: 'Maharashtra', coords: [72.8777, 19.0760] },
  delhi: { name: 'Delhi', state: 'Delhi', coords: [77.1025, 28.7041] },
  bengaluru: { name: 'Bengaluru', state: 'Karnataka', coords: [77.5946, 12.9716] },
  bangalore: { name: 'Bengaluru', state: 'Karnataka', coords: [77.5946, 12.9716] },
  banglore: { name: 'Bengaluru', state: 'Karnataka', coords: [77.5946, 12.9716] },
  chennai: { name: 'Chennai', state: 'Tamil Nadu', coords: [80.2707, 13.0827] },
  kolkata: { name: 'Kolkata', state: 'West Bengal', coords: [88.3639, 22.5726] },
  hyderabad: { name: 'Hyderabad', state: 'Telangana', coords: [78.4867, 17.3850] },
  pune: { name: 'Pune', state: 'Maharashtra', coords: [73.8567, 18.5204] },
  nellore: { name: 'Nellore', state: 'Andhra Pradesh', coords: [79.9865, 14.4426] },
  jaipur: { name: 'Jaipur', state: 'Rajasthan', coords: [75.7873, 26.9124] },
  lucknow: { name: 'Lucknow', state: 'Uttar Pradesh', coords: [80.9462, 26.8467] },
  ahmedabad: { name: 'Ahmedabad', state: 'Gujarat', coords: [72.5714, 23.0225] },
  visakhapatnam: { name: 'Visakhapatnam', state: 'Andhra Pradesh', coords: [83.2185, 17.6868] },
  coimbatore: { name: 'Coimbatore', state: 'Tamil Nadu', coords: [76.9558, 11.0168] },
  madurai: { name: 'Madurai', state: 'Tamil Nadu', coords: [78.1198, 9.9252] },
  guntakal: { name: 'Guntakal', state: 'Andhra Pradesh', coords: [77.3673, 15.1678] },
  anantapur: { name: 'Anantapur', state: 'Andhra Pradesh', coords: [77.6006, 14.6819] },
  tirupati: { name: 'Tirupati', state: 'Andhra Pradesh', coords: [79.4192, 13.6288] },
  vijayawada: { name: 'Vijayawada', state: 'Andhra Pradesh', coords: [80.6480, 16.5062] },
  guntur: { name: 'Guntur', state: 'Andhra Pradesh', coords: [80.4365, 16.3067] },
  kadapa: { name: 'Kadapa', state: 'Andhra Pradesh', coords: [78.8242, 14.4673] },
  kurnool: { name: 'Kurnool', state: 'Andhra Pradesh', coords: [78.0357, 15.8281] },
};

export function getCityDetails(name = '') {
  const norm = name.trim().toLowerCase().split(',')[0].trim();
  
  // Parse (lat, lon) suffix
  const match = name.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    return {
      name: name.split('(')[0].trim() || 'Current Location',
      state: 'GPS',
      coords: [lon, lat]
    };
  }

  // Parse raw comma-separated coordinates
  if (name.includes(',')) {
    const parts = name.split(',');
    if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
      return {
        name: 'Current Location',
        state: 'GPS',
        coords: [parseFloat(parts[1]), parseFloat(parts[0])]
      };
    }
  }

  return INDIAN_CITIES[norm] || { name: name || 'City', state: 'India', coords: [77.0, 20.0] };
}

export function calculateDistance(lon1, lat1, lon2, lat2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const dist = R * c;
  return Math.round(dist * 1.25); // Add 25% road curvature factor
}

export function getSimulatedRouteGeometry(coords1, coords2) {
  const steps = 10;
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lon = coords1[0] + (coords2[0] - coords1[0]) * ratio;
    // Add a slight arc to the coordinate path to look like realistic road curves
    const lat = coords1[1] + (coords2[1] - coords1[1]) * ratio + Math.sin(ratio * Math.PI) * 0.4;
    coordinates.push([lon, lat]);
  }
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    }
  };
}

// ============================================================
// API FUNCTIONS — offline simulated / trained
// ============================================================

export async function geocodeCityAsync(cityName) {
  if (!cityName) return [77.0, 20.0];
  
  const gpsMatch = cityName.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (gpsMatch) {
    const lat = parseFloat(gpsMatch[1]);
    const lon = parseFloat(gpsMatch[2]);
    return [lon, lat];
  }

  const norm = cityName.toLowerCase().replace(/,/g, '').trim().split(' ')[0];
  if (INDIAN_CITIES[norm]) {
    return INDIAN_CITIES[norm].coords;
  }
  
  if (norm.startsWith('bang') || norm.includes('bengaluru')) {
    return INDIAN_CITIES['bengaluru'].coords;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      return [match.longitude, match.latitude];
    }
  } catch (err) {
    console.log('Error in geocodeCityAsync:', err);
  }

  return [77.0, 20.0];
}

export async function getRealDrivingRoute(fromCoords, toCoords) {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?overview=full&geometries=geojson`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: Math.round(route.distance / 1000), // in km
        durationMin: Math.round(route.duration / 60), // in minutes
        geometry: route.geometry, // GeoJSON LineString
      };
    }
  } catch (err) {
    console.log('OSRM routing error:', err);
  }
  
  // Fallback to geodetic straight line calculation
  const dist = calculateDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
  const speed = 60;
  return {
    distance: dist,
    durationMin: Math.round((dist / speed) * 60),
    geometry: getSimulatedRouteGeometry(fromCoords, toCoords).geometry,
  };
}

export async function apiOptimize(material, source, destination, tons = 1) {
  const [srcCoords, dstCoords] = await Promise.all([
    geocodeCityAsync(source),
    geocodeCityAsync(destination),
  ]);
  const routeData = await getRealDrivingRoute(srcCoords, dstCoords);
  const distance = routeData.distance;

  const hours = Math.floor(routeData.durationMin / 60);
  const mins = Math.round(routeData.durationMin % 60);

  const rate = MATERIALS.find(m => m.id === material)?.rate || 8;
  const transport = distance < 300 ? 'truck' : distance < 1000 ? 'train' : 'ship';
  const cost = distance * rate * tons;

  return {
    distance,
    time_text: `${hours}h ${String(mins).padStart(2, '0')}m`,
    best_transport: transport,
    best_vessel: transport === 'ship' ? 'Large Vessel' : 'Not Required',
    minimum_cost: cost,
    source_coords: srcCoords,
    destination_coords: dstCoords,
    route_geometry: routeData.geometry,
  };
}

export async function apiAutocomplete(query) {
  if (query.length < 2) return [];
  const normalized = query.toLowerCase().trim();

  // 1. Search local catalog (keys, names, and states)
  const localMatches = Object.entries(INDIAN_CITIES)
    .filter(([key, c]) => 
      key.includes(normalized) || 
      c.name.toLowerCase().includes(normalized) || 
      c.state.toLowerCase().includes(normalized)
    )
    .map(([_, c]) => `${c.name}, ${c.state}`);

  // 2. Query live Open-Meteo Geocoding API
  let apiMatches = [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      apiMatches = data.results
        .filter(r => r.country_code === 'IN' || r.country === 'India')
        .map(r => `${r.name}, ${r.admin1 || 'India'}`);
    }
  } catch (err) {
    console.log('Autocomplete Open-Meteo Geocoding API error:', err);
  }

  // 3. Combine both lists, preserving order and removing duplicates
  const combined = Array.from(new Set([...localMatches, ...apiMatches]));
  return combined.slice(0, 6);
}
