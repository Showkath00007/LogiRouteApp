// ============================================================
// LogiRoute — Premium Indigo-Slate Theme Tokens
// Curated, ultra-clean modern logistics aesthetic
// ============================================================

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────
  bg: '#0A0F1D',           // Obsidian Navy bg
  surface: '#151F32',      // Slate cards
  card: '#151F32',
  surface2: '#1E293B',     // darker slate gray
  border: '#24334C',       // slate border

  // ── Primary Brand Colors ──────────────────────────────────
  accent: '#06B6D4',       // glowing cyan accent
  accentDark: '#0891B2',
  accentLight: 'rgba(6, 182, 212, 0.15)',

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
  text: '#F8FAFC',         // slate-50 high contrast text
  textSub: '#94A3B8',      // slate-400 secondary text
  textMuted: '#64748B',    // slate-500 muted text
  white: '#FFFFFF',
  black: '#0A0F1D',

  // ── Tints (for backgrounds) ───────────────────────────────
  blueTint: 'rgba(59, 130, 246, 0.1)',
  purpleTint: 'rgba(139, 92, 246, 0.1)',
  orangeTint: 'rgba(249, 115, 22, 0.1)',
  greenTint: 'rgba(16, 185, 129, 0.1)',
  pinkTint: 'rgba(236, 72, 153, 0.1)',
  yellowTint: 'rgba(245, 158, 11, 0.1)',
  cyanTint: 'rgba(6, 182, 212, 0.1)',

  // ── Gradients (start/end pairs) ───────────────────────────
  grad1: ['#06B6D4', '#6366F1'],   // cyan → indigo
  grad2: ['#F97316', '#F59E0B'],   // orange → amber
  grad3: ['#10B981', '#06B6D4'],   // green → cyan
  grad4: ['#EF4444', '#F97316'],   // red → orange
  grad5: ['#06B6D4', '#4F46E5'],   // cyan → indigo

  overlay: 'rgba(10,15,29,0.5)',
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