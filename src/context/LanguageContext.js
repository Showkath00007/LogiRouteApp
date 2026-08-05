import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'LogiRoute',
    tagline: 'Smart Logistics Optimizer',
    getStarted: 'Get Started',
    login: 'Login',
    register: 'Create Account',
    email: 'Email / Phone',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    welcome: 'Welcome Back 👋',
    loginSub: 'Login to your account',
    dashboard: 'Dashboard',
    shipments: 'Shipments',
    optimize: 'Optimize',
    analytics: 'Analytics',
    profile: 'Profile',
    newShipment: 'New Shipment',
    activeShipments: 'Active Shipments',
    trackLive: 'Track Live',
    bookTransport: 'Book Transport',
    payment: 'Payment',
    confirmed: 'Booking Confirmed!',
    weather: 'Weather',
    history: 'History',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    source: 'Source city...',
    destination: 'Destination city...',
    optimizeRoute: '⚡ Optimize Route',
    material: 'Material',
    route: 'Route',
    distance: 'Distance',
    estTime: 'Est. Time',
    transport: 'Transport',
    minCost: 'MINIMUM COST',
    viewMap: '🗺 View Route Map',
    compareAll: '📊 Compare All Costs',
    bookThis: '✅ Book This Transport',
    driver: 'Driver',
    earnings: 'Earnings',
    myTrips: 'My Trips',
    jobs: 'Available Jobs',
    vehicle: 'Vehicle Status',
    goodMorning: 'Good Morning 👋',
    noAlerts: 'No weather alerts. Safe to dispatch.',
    selectMaterial: 'SELECT MATERIAL',
    proceed: 'Proceed to Pay',
    payNow: '🔒 Pay',
    back: '← Back',
    skip: 'Skip',
    next: 'Next →',
    chat: 'Chat',
    scanQR: 'Scan QR Code',
    offline: 'You are offline',
    offlineSub: 'Showing cached data',
    adminPanel: 'Admin Panel',
  },
  ta: {
    appName: 'LogiRoute',
    tagline: 'ஸ்மார்ட் லாஜிஸ்டிக்ஸ் ஆப்டிமைசர்',
    getStarted: 'தொடங்கு',
    login: 'உள்நுழைய',
    register: 'கணக்கு உருவாக்கு',
    email: 'மின்னஞ்சல் / தொலைபேசி',
    password: 'கடவுச்சொல்',
    forgotPassword: 'கடவுச்சொல் மறந்தீர்களா?',
    welcome: 'மீண்டும் வருக 👋',
    loginSub: 'உங்கள் கணக்கில் உள்நுழைக',
    dashboard: 'டாஷ்போர்டு',
    shipments: 'ஏற்றுமதிகள்',
    optimize: 'உகந்தமாக்கு',
    analytics: 'பகுப்பாய்வு',
    profile: 'சுயவிவரம்',
    newShipment: 'புதிய ஏற்றுமதி',
    activeShipments: 'செயலில் உள்ள ஏற்றுமதிகள்',
    trackLive: 'நேரடி கண்காணிப்பு',
    bookTransport: 'போக்குவரத்து பதிவு',
    payment: 'கட்டணம்',
    confirmed: 'பதிவு உறுதிப்படுத்தப்பட்டது!',
    weather: 'வானிலை',
    history: 'வரலாறு',
    notifications: 'அறிவிப்புகள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    source: 'மூல நகரம்...',
    destination: 'இலக்கு நகரம்...',
    optimizeRoute: '⚡ பாதையை உகந்தமாக்கு',
    material: 'பொருள்',
    route: 'பாதை',
    distance: 'தூரம்',
    estTime: 'மதிப்பிட்ட நேரம்',
    transport: 'போக்குவரத்து',
    minCost: 'குறைந்தபட்ச செலவு',
    viewMap: '🗺 வரைபடம் காண்',
    compareAll: '📊 அனைத்து செலவுகளை ஒப்பிடு',
    bookThis: '✅ இந்த போக்குவரத்தை பதிவு செய்',
    driver: 'ஓட்டுநர்',
    earnings: 'வருவாய்',
    myTrips: 'என் பயணங்கள்',
    jobs: 'கிடைக்கும் வேலைகள்',
    vehicle: 'வாகன நிலை',
    goodMorning: 'காலை வணக்கம் 👋',
    noAlerts: 'வானிலை எச்சரிக்கை இல்லை. அனுப்புவதற்கு பாதுகாப்பானது.',
    selectMaterial: 'பொருளைத் தேர்ந்தெடு',
    proceed: 'கட்டணத்திற்கு தொடரவும்',
    payNow: '🔒 கட்டணம் செலுத்து',
    back: '← பின்',
    skip: 'தவிர்',
    next: 'அடுத்து →',
    chat: 'அரட்டை',
    scanQR: 'QR குறியீட்டை ஸ்கேன் செய்',
    offline: 'நீங்கள் ஆஃப்லைனில் இருக்கிறீர்கள்',
    offlineSub: 'தற்காலிக தரவு காட்டப்படுகிறது',
    adminPanel: 'நிர்வாக பலகம்',
  },
  hi: {
    appName: 'LogiRoute',
    tagline: 'स्मार्ट लॉजिस्टिक्स ऑप्टिमाइज़र',
    getStarted: 'शुरू करें',
    login: 'लॉगिन',
    register: 'अकाउंट बनाएं',
    email: 'ईमेल / फोन',
    password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    welcome: 'वापसी पर स्वागत है 👋',
    loginSub: 'अपने अकाउंट में लॉगिन करें',
    dashboard: 'डैशबोर्ड',
    shipments: 'शिपमेंट',
    optimize: 'ऑप्टिमाइज़',
    analytics: 'एनालिटिक्स',
    profile: 'प्रोफ़ाइल',
    newShipment: 'नया शिपमेंट',
    activeShipments: 'सक्रिय शिपमेंट',
    trackLive: 'लाइव ट्रैक करें',
    bookTransport: 'ट्रांसपोर्ट बुक करें',
    payment: 'भुगतान',
    confirmed: 'बुकिंग कन्फर्म!',
    weather: 'मौसम',
    history: 'इतिहास',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    source: 'स्रोत शहर...',
    destination: 'गंतव्य शहर...',
    optimizeRoute: '⚡ रूट ऑप्टिमाइज़ करें',
    material: 'सामग्री',
    route: 'रूट',
    distance: 'दूरी',
    estTime: 'अनुमानित समय',
    transport: 'परिवहन',
    minCost: 'न्यूनतम लागत',
    viewMap: '🗺 मैप देखें',
    compareAll: '📊 सभी लागत तुलना करें',
    bookThis: '✅ यह ट्रांसपोर्ट बुक करें',
    driver: 'ड्राइवर',
    earnings: 'कमाई',
    myTrips: 'मेरी यात्राएं',
    jobs: 'उपलब्ध काम',
    vehicle: 'वाहन स्थिति',
    goodMorning: 'सुप्रभात 👋',
    noAlerts: 'कोई मौसम चेतावनी नहीं। भेजना सुरक्षित है।',
    selectMaterial: 'सामग्री चुनें',
    proceed: 'भुगतान के लिए आगे बढ़ें',
    payNow: '🔒 भुगतान करें',
    back: '← वापस',
    skip: 'छोड़ें',
    next: 'अगला →',
    chat: 'चैट',
    scanQR: 'QR कोड स्कैन करें',
    offline: 'आप ऑफलाइन हैं',
    offlineSub: 'कैश्ड डेटा दिखाया जा रहा है',
    adminPanel: 'एडमिन पैनल',
  },
};

const LangContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  return (
    <LangContext.Provider value={{ lang, setLang, t, translations }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// Language Selector Component
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function LanguageSelector() {
  const { lang, setLang } = useLang();
  const options = [
    { id: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { id: 'ta', label: 'தமிழ்', flag: '🇮🇳', name: 'Tamil' },
    { id: 'hi', label: 'हिंदी', flag: '🇮🇳', name: 'Hindi' },
  ];
  return (
    <View style={ls.row}>
      {options.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => setLang(opt.id)} style={[ls.btn, lang === opt.id && ls.btnActive]}>
          <Text style={ls.flag}>{opt.flag}</Text>
          <Text style={[ls.label, lang === opt.id && ls.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const ls = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1C2030', borderWidth: 1, borderColor: '#2E3450', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  btnActive: { borderColor: '#F5C842', backgroundColor: 'rgba(245,200,66,0.15)' },
  flag: { fontSize: 14 },
  label: { fontSize: 12, color: '#8892A4', fontWeight: '600' },
  labelActive: { color: '#F5C842' },
});
