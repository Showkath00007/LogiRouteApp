import React, { createContext, useContext, useState } from 'react';

const darkColors = {
  bg: '#0B0F19',           // rich space cadet navy bg
  surface: '#151B2C',      // deep navy cards
  surface2: '#1E293B',     // lighter slate-navy
  surface3: '#334155',     // hover/active highlights
  border: '#2E3A52',       // crisp border line
  accent: '#6366F1',       // electric indigo (primary brand color)
  accentS: 'rgba(99,102,241,0.15)',
  blue: '#3B82F6',         // electric blue
  blueS: 'rgba(59,130,246,0.15)',
  green: '#10B981',        // emerald green
  greenS: 'rgba(16,185,129,0.15)',
  orange: '#F97316',       // vivid orange
  orangeS: 'rgba(249,115,22,0.15)',
  red: '#EF4444',          // neon red
  redS: 'rgba(239,68,68,0.15)',
  purple: '#8B5CF6',       // modern violet
  purpleS: 'rgba(139,92,246,0.15)',
  text: '#F8FAFC',         // slate-50 white text
  sub: '#94A3B8',          // slate-400 sub text
  muted: '#64748B',        // slate-500 muted text
  white: '#FFFFFF',
  isDark: true,
};

const lightColors = {
  bg: '#F8FAFC',           // ultra-clean slate bg
  surface: '#FFFFFF',      // white cards
  surface2: '#F1F5F9',     // soft slate gray
  surface3: '#E2E8F0',     // active highlight
  border: '#E2E8F0',       // soft divider border
  accent: '#4F46E5',       // rich brand indigo
  accentS: 'rgba(79,70,229,0.12)',
  blue: '#2563EB',         // primary royal blue
  blueS: 'rgba(37,99,235,0.1)',
  green: '#15803D',        // rich forest green
  greenS: 'rgba(21,128,61,0.1)',
  orange: '#EA580C',       // safety orange
  orangeS: 'rgba(234,88,12,0.1)',
  red: '#DC2626',          // deep crimson
  redS: 'rgba(220,38,38,0.1)',
  purple: '#7C3AED',       // violet purple
  purpleS: 'rgba(124,58,237,0.1)',
  text: '#0F172A',         // slate-900 high contrast text
  sub: '#475569',          // slate-600 secondary text
  muted: '#94A3B8',        // slate-400 muted text
  white: '#FFFFFF',
  isDark: false,
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const colors = isDark ? darkColors : lightColors;
  const toggle = () => setIsDark(prev => !prev);
  return (
    <ThemeContext.Provider value={{ colors, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Dark/Light Toggle Component
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function ThemeToggle() {
  const { isDark, toggle, colors } = useTheme();
  return (
    <TouchableOpacity onPress={toggle} style={[ts.wrap, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
      <View style={[ts.thumb, { left: isDark ? 2 : 24, backgroundColor: colors.accent }]}>
        <Text style={{ fontSize: 12 }}>{isDark ? '🌙' : '☀️'}</Text>
      </View>
      <Text style={[ts.labelLeft, { opacity: isDark ? 1 : 0.3 }]}>🌙</Text>
      <Text style={[ts.labelRight, { opacity: isDark ? 0.3 : 1 }]}>☀️</Text>
    </TouchableOpacity>
  );
}

const ts = StyleSheet.create({
  wrap: { width: 64, height: 32, borderRadius: 16, borderWidth: 1, position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  thumb: { position: 'absolute', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', top: 2 },
  labelLeft: { fontSize: 13, zIndex: 0 },
  labelRight: { fontSize: 13, zIndex: 0 },
});
