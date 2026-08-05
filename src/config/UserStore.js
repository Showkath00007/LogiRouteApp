// ============================================================
// UserStore — Persistent profile using AsyncStorage
// Import and use across all screens for real data persistence
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'logiroute_user_profile';

const DEFAULT_PROFILE = {
  name: 'Kadiyala Logistics',
  company: 'Kadiyala Transport Co.',
  phone: '+91 93928 59818',
  email: 'admin@logiroute.in',
  city: 'Chennai',
  gst: '33ABCDE1234F1Z5',
  type: 'company',
  verified: true,
};

// ─── Get profile ─────────────────────────────────────────────
export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

// ─── Save profile ─────────────────────────────────────────────
export async function saveProfile(data) {
  try {
    const existing = await getProfile();
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('UserStore save error:', e);
    return data;
  }
}

// ─── Clear profile (logout) ────────────────────────────────────
export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {}
}

export default { getProfile, saveProfile, clearProfile, DEFAULT_PROFILE };