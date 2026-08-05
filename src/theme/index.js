// ============================================================
// LogiRoute — Vibrant Light Theme
// Multi-color, energetic, modern logistics palette
// ============================================================

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────
  bg: '#F0F4FF',           // soft blue-white background
  surface: '#FFFFFF',      // white cards
  card: '#FFFFFF',
  surface2: '#F5F7FF',
  border: '#E0E7FF',

  // ── Primary Brand Colors ──────────────────────────────────
  accent: '#4361EE',       // vibrant blue (primary)
  accentDark: '#2D46C8',
  accentLight: '#EEF2FF',

  // ── Color Palette (5 vibrant colors) ─────────────────────
  blue: '#4361EE',         // electric blue
  purple: '#7B2FBE',       // rich purple
  orange: '#F77F00',       // vivid orange
  green: '#06D6A0',        // mint green
  pink: '#EF233C',         // vivid red-pink
  yellow: '#FFD166',       // golden yellow
  cyan: '#4CC9F0',         // sky cyan

  // ── Semantic Colors ───────────────────────────────────────
  success: '#06D6A0',
  warning: '#FFD166',
  danger: '#EF233C',
  info: '#4CC9F0',

  // ── Text ─────────────────────────────────────────────────
  text: '#1A1A2E',         // deep navy text
  textSub: '#4A5568',      // secondary text
  textMuted: '#9AA5B1',    // muted text
  white: '#FFFFFF',
  black: '#1A1A2E',

  // ── Tints (for backgrounds) ───────────────────────────────
  blueTint: '#EEF2FF',
  purpleTint: '#F3EEFF',
  orangeTint: '#FFF4E6',
  greenTint: '#E6FFF9',
  pinkTint: '#FFF0F2',
  yellowTint: '#FFFBEA',
  cyanTint: '#E8FAFF',

  // ── Gradients (start/end pairs) ───────────────────────────
  grad1: ['#4361EE', '#7B2FBE'],   // blue → purple
  grad2: ['#F77F00', '#FFD166'],   // orange → yellow
  grad3: ['#06D6A0', '#4CC9F0'],   // green → cyan
  grad4: ['#EF233C', '#F77F00'],   // pink → orange
  grad5: ['#4CC9F0', '#4361EE'],   // cyan → blue

  overlay: 'rgba(26,26,46,0.15)',
  red: '#EF233C',
};

export const fonts = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const shadow = {
  sm: { shadowColor: '#4361EE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  md: { shadowColor: '#4361EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  lg: { shadowColor: '#4361EE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  colored: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }),
};

export default { colors, fonts, radius, spacing, shadow };