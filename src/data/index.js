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
  { id: 'Steel', icon: '🔩', color: '#4F8EF7', rate: 10 },
  { id: 'Cement', icon: '🧱', color: '#8892A4', rate: 6 },
  { id: 'Aluminium', icon: '🥈', color: '#A78BFA', rate: 12 },
  { id: 'Coal', icon: '⬛', color: '#4A5568', rate: 5 },
  { id: 'Wood', icon: '🪵', color: '#FF7A3D', rate: 7 },
];

// ============================================================
// API FUNCTIONS — switches between mock and real
// ============================================================

export async function apiOptimize(material, source, destination, tons = 1) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE}/optimize_with_city?material=${encodeURIComponent(material)}&source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    return res.json();
  }

  try {
    // Get real coordinates for source and destination
    const [srcRes, dstRes] = await Promise.all([
      fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(source)}&filter=countrycode:in&limit=1&apiKey=bd32dbcd6016403e9d5a828f643d4cdb`),
      fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(destination)}&filter=countrycode:in&limit=1&apiKey=bd32dbcd6016403e9d5a828f643d4cdb`)
    ]);
    const srcData = await srcRes.json();
    const dstData = await dstRes.json();

    const srcCoords = srcData.features?.[0]?.geometry?.coordinates || [72.8777, 19.0760];
    const dstCoords = dstData.features?.[0]?.geometry?.coordinates || [77.1025, 28.7041];

    // Get real route distance using Geoapify Routing API
    const routeRes = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${srcCoords[1]},${srcCoords[0]}|${dstCoords[1]},${dstCoords[0]}&mode=drive&apiKey=bd32dbcd6016403e9d5a828f643d4cdb`
    );
    const routeData = await routeRes.json();

    const distance = Math.round((routeData.features?.[0]?.properties?.distance || 0) / 1000); // convert to km
    const timeSeconds = routeData.features?.[0]?.properties?.time || 0;
    const hours = Math.floor(timeSeconds / 3600);
    const mins = Math.round((timeSeconds % 3600) / 60);

    const rate = MATERIALS.find(m => m.id === material)?.rate || 8;
    const transport = distance < 300 ? 'truck' : distance < 1000 ? 'train' : 'ship';
    const cost = distance * rate * tons;
    const geometry = routeData.features?.[0]?.geometry || null;

    return {
      distance,
      time_text: `${hours}h ${String(mins).padStart(2, '0')}m`,
      best_transport: transport,
      best_vessel: transport === 'ship' ? 'Large Vessel' : 'Not Required',
      minimum_cost: cost,
      source_coords: srcCoords,
      destination_coords: dstCoords,
      route_geometry: geometry,
    };
  } catch (e) {
    // Fallback to mock if API fails
    const rate = MATERIALS.find(m => m.id === material)?.rate || 8;
    const distance = Math.floor(Math.random() * 1500) + 300;
    const transport = distance < 300 ? 'truck' : distance < 1000 ? 'train' : 'ship';
    const cost = distance * rate;
    const hours = Math.floor(distance / 60);
    const mins = Math.round(((distance / 60) - hours) * 60);
    return {
      distance,
      time_text: `${hours}h ${String(mins).padStart(2, '0')}m`,
      best_transport: transport,
      best_vessel: transport === 'ship' ? 'Large Vessel' : 'Not Required',
      minimum_cost: cost,
      source_coords: [72.8777, 19.0760],
      destination_coords: [77.1025, 28.7041],
      route_geometry: null,
    };
  }
}

export async function apiAutocomplete(query) {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:in&limit=6&type=city&apiKey=bd32dbcd6016403e9d5a828f643d4cdb`
    );
    const data = await res.json();
    return data.features?.map(f => {
      const city = f.properties.city || f.properties.name || '';
      const state = f.properties.state || '';
      return `${city}, ${state}`;
    }).filter(Boolean) || [];
  } catch (e) {
    const cities = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Kolkata',
      'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    return cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }
}
