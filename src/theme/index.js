// ============================================================
// LogiRoute — Premium Indigo-Slate Theme Tokens
// Curated, ultra-clean modern logistics aesthetic
// ============================================================

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────
  bg: '#FDFBF7',           // Clean Light Ivory bg
  surface: '#F2EAD9',      // Richer Darker Cream cards
  card: '#F2EAD9',
  surface2: '#FAF0E1',     // soft sand gray
  border: '#E3DAC9',       // warm sand border

  // ── Primary Brand Colors ──────────────────────────────────
  accent: '#4F46E5',       // modern Indigo accent
  accentDark: '#3730A3',
  accentLight: '#EEF2FF',

  // ── Color Palette ─────────────────────────────────────────
  blue: '#3B82F6',         // electric blue
  purple: '#8B5CF6',       // modern violet
  orange: '#F97316',       // vivid orange
  green: '#10B981',        // emerald green
  pink: '#EC4899',         // modern hot pink
  yellow: '#F59E0B',       // warm amber yellow
  cyan: '#06B6D4',         // clean cyan

  // ── Semantic Colors ───────────────────────────────────────
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',

  // ── Text ─────────────────────────────────────────────────
  text: '#1C1A17',         // deep warm charcoal text
  textSub: '#57534E',      // warm slate gray text
  textMuted: '#A8A29E',    // warm muted gray text
  white: '#FFFFFF',
  black: '#1C1A17',

  // ── Tints (for backgrounds) ───────────────────────────────
  blueTint: '#EFF6FF',
  purpleTint: '#F5F3FF',
  orangeTint: '#FFF7ED',
  greenTint: '#ECFDF5',
  pinkTint: '#FDF2F8',
  yellowTint: '#FEF3C7',
  cyanTint: '#ECFEFF',

  // ── Gradients (start/end pairs) ───────────────────────────
  grad1: ['#4F46E5', '#8B5CF6'],   // indigo → purple
  grad2: ['#F97316', '#F59E0B'],   // orange → amber
  grad3: ['#10B981', '#06B6D4'],   // green → cyan
  grad4: ['#EF4444', '#F97316'],   // red → orange
  grad5: ['#06B6D4', '#4F46E5'],   // cyan → indigo

  overlay: 'rgba(28,26,23,0.15)',
  red: '#EF4444',
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
  sm: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  colored: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 12, elevation: 6 }),
};

export default { colors, fonts, radius, spacing, shadow };