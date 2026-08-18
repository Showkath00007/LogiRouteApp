import AsyncStorage from '@react-native-async-storage/async-storage';

export const TRANSLATIONS = {
  en: {
    // Headers & Screens
    settings: 'Settings',
    notifications: 'Notifications',
    profile: 'Profile',
    kyc_docs: 'KYC & Vehicle Documents',
    company_details: 'Company Details',
    edit_profile: 'Edit Profile',
    route_map: 'Google Route Navigation',
    road_alerts: 'Road feasibility report',
    
    // Settings screen
    push_notifs: 'Push Notifications',
    email_alerts: 'Email Alerts',
    sms_updates: 'SMS Updates',
    display: 'Display',
    language: 'Language',
    currency: 'Currency',
    security: 'Security',
    change_password: 'Change Password',
    biometric_login: 'Biometric Login',
    logout: 'Logout',
    select_language: 'Select Language',
    select_currency: 'Select Default Currency',
    
    // Common Actions
    save: 'Save Changes ✓',
    cancel: 'Cancel',
    start_nav: '🧭 Start Navigation',
    open_gmaps: 'Google Maps ↗',
    exit: '✕ Exit',
    loading_map: 'Loading Google Navigation Route...',
    loading_profile: 'Loading profile...',
    
    // Labels
    personal_info: 'Personal Info',
    company_info: 'Company Info',
    full_name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    city: 'City',
    gst: 'GST Number',
    pan: 'Official PAN Card',
    aadhaar: 'Official Aadhaar Card',
    vehicle: 'Official Vehicle RC Number',
    address: 'Address',
    street: 'Street Address',
    state: 'State',
    pin: 'PIN Code',
    request_reverify: 'Request Re-verification',
    verified: 'Verified ✓',
    pending: 'Pending',
    
    // Alerts
    lang_updated: 'Language Updated',
    lang_changed_to: 'System language set to English.',
    curr_updated: 'Currency Updated',
    curr_changed_to: 'Default system currency set to INR (₹).'
  },
  hi: {
    settings: 'सेटिंग्स',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    kyc_docs: 'केवाईसी और वाहन दस्तावेज',
    company_details: 'कंपनी का विवरण',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    route_map: 'गूगल रूट नेविगेशन',
    road_alerts: 'सड़क व्यवहार्यता रिपोर्ट',
    
    push_notifs: 'पुश नोटिफिकेशन',
    email_alerts: 'ईमेल अलर्ट',
    sms_updates: 'एसएमएस अपडेट',
    display: 'प्रदर्शन',
    language: 'भाषा',
    currency: 'मुद्रा',
    security: 'सुरक्षा',
    change_password: 'पासवर्ड बदलें',
    biometric_login: 'बायोमेट्रिक लॉगिन',
    logout: 'लॉगआउट',
    select_language: 'भाषा चुनें',
    select_currency: 'डिफ़ॉल्ट मुद्रा चुनें',
    
    save: 'बदलाव सहेजें ✓',
    cancel: 'रद्द करें',
    start_nav: '🧭 नेविगेशन शुरू करें',
    open_gmaps: 'गूगल मैप्स ↗',
    exit: '✕ बाहर निकलें',
    loading_map: 'गूगल नेविगेशन रूट लोड हो रहा है...',
    loading_profile: 'प्रोफ़ाइल लोड हो रही है...',
    
    personal_info: 'व्यक्तिगत जानकारी',
    company_info: 'कंपनी की जानकारी',
    full_name: 'पूरा नाम',
    phone: 'फ़ोन नंबर',
    email: 'ईमेल पता',
    city: 'शहर',
    gst: 'जीएसटी नंबर',
    pan: 'आधिकारिक पैन कार्ड',
    aadhaar: 'आधिकारिक आधार कार्ड',
    vehicle: 'आधिकारिक वाहन आरसी नंबर',
    address: 'पता',
    street: 'गली का पता',
    state: 'राज्य',
    pin: 'पिन कोड',
    request_reverify: 'पुनः सत्यापन का अनुरोध करें',
    verified: 'सत्यापित ✓',
    pending: 'लंबित',
    
    lang_updated: 'भाषा अपडेट की गई',
    lang_changed_to: 'सिस्टम की भाषा हिंदी पर सेट की गई है।',
    curr_updated: 'मुद्रा अपडेट की गई',
    curr_changed_to: 'डिफ़ॉल्ट सिस्टम मुद्रा INR (₹) सेट की गई है।'
  },
  ta: {
    settings: 'அமைப்புகள்',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம்',
    kyc_docs: 'KYC & வாகன ஆவணங்கள்',
    company_details: 'நிறுவனத்தின் விவரங்கள்',
    edit_profile: 'சுயவிவரத்தைத் திருத்து',
    route_map: 'கூகிள் வழிசெலுத்தல்',
    road_alerts: 'சாலை சாத்தியக்கூறு அறிக்கை',
    
    push_notifs: 'புஷ் அறிவிப்புகள்',
    email_alerts: 'மின்னஞ்சல் எச்சரிக்கைகள்',
    sms_updates: 'எஸ்எம்எஸ் புதுப்பிப்புகள்',
    display: 'காட்சி அமைப்புகள்',
    language: 'மொழி',
    currency: 'நாணயம்',
    security: 'பாதுகாப்பு',
    change_password: 'கடவுச்சொல்லை மாற்று',
    biometric_login: 'கைரேகை உள்நுழைவு',
    logout: 'வெளியேறு',
    select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    select_currency: 'நாணயத்தைத் தேர்ந்தெடுக்கவும்',
    
    save: 'மாற்றங்களைச் சேமி ✓',
    cancel: 'ரತುசெய்',
    start_nav: '🧭 வழிசெலுத்தலைத் தொடங்கு',
    open_gmaps: 'கூகிள் மேப்ஸ் ↗',
    exit: '✕ வெளியேறு',
    loading_map: 'வழிசெலுத்தல் ஏற்றப்படுகிறது...',
    loading_profile: 'சுயವಿವರಂ ஏற்றப்படுகிறது...',
    
    personal_info: 'தனிப்பட்ட தகவல்',
    company_info: 'நிறுவனத்தின் தகவல்',
    full_name: 'முழு பெயர்',
    phone: 'தொலைபேசி எண்',
    email: 'மின்னஞ்சல் முகவரி',
    city: 'நகரம்',
    gst: 'ஜிஎஸ்டி எண்',
    pan: 'அதிகாரப்பூர்வ பான் கார்டு',
    aadhaar: 'அதிகாரப்பூர்வ ஆதார் கார்டு',
    vehicle: 'அதிகாரப்பூர்வ வாகன பதிவு எண்',
    address: 'முகவரி',
    street: 'தெರು முகவரி',
    state: 'மாநிலம்',
    pin: 'அஞ்சல் குறியீடு',
    request_reverify: 'மீண்டும் சரிபார்க்க கோரிக்கை',
    verified: 'சரிபார்க்கப்பட்டது ✓',
    pending: 'நிலுவையில் உள்ளது',
    
    lang_updated: 'மொழி மாற்றப்பட்டது',
    lang_changed_to: 'அமைப்பு மொழி தமிழ் என மாற்றப்பட்டுள்ளது.',
    curr_updated: 'நாணயம் மாற்றப்பட்டது',
    curr_changed_to: 'அமைப்பு நாணயம் INR (₹) என மாற்றப்பட்டுள்ளது.'
  },
  te: {
    settings: 'సెట్టింగులు',
    notifications: 'నోటిఫికేషన్లు',
    profile: 'ప్రొఫైల్',
    kyc_docs: 'KYC & వాహన పత్రాలు',
    company_details: 'కంపెనీ వివరాలు',
    edit_profile: 'ప్రొఫైల్ సవరించండి',
    route_map: 'గూగుల్ రూట్ నావిగేషన్',
    road_alerts: 'రోడ్ అనుకూలత నివేదిక',
    
    push_notifs: 'పుష్ నోటిఫికేషన్లు',
    email_alerts: 'ఈమెయిల్ హెచ్చరికలు',
    sms_updates: 'SMS అప్‌డేట్లు',
    display: 'డిస్ప్లే',
    language: 'భాష',
    currency: 'కరెన్సీ',
    security: 'భద్రత',
    change_password: 'పాస్‌వర్డ్ మార్చండి',
    biometric_login: 'బయోమెట్రిక్ లాగిన్',
    logout: 'లాగౌట్',
    select_language: 'భాషను ఎంచుకోండి',
    select_currency: 'కరెన్సీని ఎంచుకోండి',
    
    save: 'మార్పులను సేవ్ చేయండి ✓',
    cancel: 'ರದ್ದು చేయి',
    start_nav: '🧭 నావిగేషన్ ప్రారంభించండి',
    open_gmaps: 'గూగుల్ మ్యాప్స్ ↗',
    exit: '✕ నిష్క్రమించు',
    loading_map: 'నావిగేషన్ లోడ్ అవుతోంది...',
    loading_profile: 'ప్రొఫైల్ లోడ్ అవుతోంది...',
    
    personal_info: 'వ్యక్తిగత సమాచారం',
    company_info: 'కంపెనీ సమాచారం',
    full_name: 'పూర్తి పేరు',
    phone: 'ఫోన్ నంబర్',
    email: 'ఈమెయిల్ చిరునామా',
    city: 'నగరం',
    gst: 'GST సంఖ్య',
    pan: 'అధికారిక పాన్ కార్డ్',
    aadhaar: 'అధికారిక ఆధార్ కార్డ్',
    vehicle: 'అధికారిక వాహన రిజిస్ట్రేషన్ సంఖ్య',
    address: 'చిరునామా',
    street: 'వీధి చిరునామా',
    state: 'రాష్ట్రం',
    pin: 'పిన్ కోడ్',
    request_reverify: 'తిరిగి ధృవీకరణను అభ్యర్థించండి',
    verified: 'ధృవీకరించబడింది ✓',
    pending: 'పెండింగ్',
    
    lang_updated: 'భాష నవీకరించబడింది',
    lang_changed_to: 'సిస్టమ్ భాష తెలుగుకు సెట్ చేయబడింది.',
    curr_updated: 'కరెన్సీ నవీకరించబడింది',
    curr_changed_to: 'సిస్టమ్ కరెన్సీ INR (₹) గా సెట్ చేయబడింది.'
  },
  kn: {
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    kyc_docs: 'KYC ಮತ್ತು ವಾಹನ ದಾಖಲೆಗಳು',
    company_details: 'ಕಂಪನಿ ವಿವರಗಳು',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    route_map: 'ಗೂಗಲ್ ರೂಟ್ ನ್ಯಾವಿಗೇಷನ್',
    road_alerts: 'ರಸ್ತೆ ಕಾರ್ಯಸಾಧ್ಯತೆಯ ವರದಿ',
    
    push_notifs: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು',
    email_alerts: 'ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳು',
    sms_updates: 'SMS ನವೀಕರಣಗಳು',
    display: 'ಡಿಸ್ಪ್ಲೇ',
    language: 'ಭಾಷೆ',
    currency: 'ಕರೆನ್ಸಿ',
    security: 'ಭದ್ರತೆ',
    change_password: 'ಪಾಸ್ವರ್ಡ್ ಬದಲಾಯಿಸಿ',
    biometric_login: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್',
    logout: 'ಲಾಗ್ಔಟ್',
    select_language: 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
    select_currency: 'ಕರೆನ್ಸಿಯನ್ನು ಆರಿಸಿ',
    
    save: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ ✓',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    start_nav: '🧭 ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭಿಸಿ',
    open_gmaps: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ↗',
    exit: '✕ ನಿರ್ಗಮಿಸಿ',
    loading_map: 'ನ್ಯಾವಿಗೇಷನ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    loading_profile: 'ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    
    personal_info: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',
    company_info: 'ಕಂಪನಿ ಮಾಹಿತಿ',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    city: 'ನಗರ',
    gst: 'GST ಸಂಖ್ಯೆ',
    pan: 'ಅಧಿಕೃತ ಪ್ಯಾನ್ ಕಾರ್ಡ್',
    aadhaar: 'ಅಧಿಕೃತ ಆಧಾರ್ ಕಾರ್ಡ್',
    vehicle: 'ಅಧಿಕೃತ ವಾಹನ ನೋಂದಣಿ ಸಂಖ್ಯೆ',
    address: 'ವಿಳಾಸ',
    street: 'ಬೀದಿ ವಿಳಾಸ',
    state: 'ರಾಜ್ಯ',
    pin: 'ಪಿನ್ ಕೋಡ್',
    request_reverify: 'ಮರು ಪರಿಶೀಲನೆಗೆ ವಿನಂತಿಸಿ',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ ✓',
    pending: 'ಬಾಕಿ ಉಳಿದಿದೆ',
    
    lang_updated: 'ಭಾಷೆ ನವೀಕರಿಸಲಾಗಿದೆ',
    lang_changed_to: 'ಸಿಸ್ಟಮ್ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.',
    curr_updated: 'ಕರೆನ್ಸಿ ನವೀಕರಿಸಲಾಗಿದೆ',
    curr_changed_to: 'ಸಿಸ್ಟಮ್ ಕರೆನ್ಸಿಯನ್ನು INR (₹) ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ.'
  }
};

const KEY = 'logiroute_user_profile';

export async function getCurrentLanguage() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return 'en';
    const parsed = JSON.parse(raw);
    return parsed.language || 'en';
  } catch (e) {
    return 'en';
  }
}

export function translate(key, lang = 'en') {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dictionary[key] || TRANSLATIONS['en'][key] || key;
}

export default { translate, getCurrentLanguage, TRANSLATIONS };
