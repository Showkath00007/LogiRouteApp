import React, { createContext, useContext, useState } from 'react';

const darkColors = {
  bg: '#0A0C12', surface: '#13161F', surface2: '#1C2030', surface3: '#242840',
  border: '#2E3450', accent: '#F5C842', accentS: 'rgba(245,200,66,0.15)',
  blue: '#4F8EF7', blueS: 'rgba(79,142,247,0.15)',
  green: '#2ECC8A', greenS: 'rgba(46,204,138,0.15)',
  orange: '#FF7A3D', orangeS: 'rgba(255,122,61,0.15)',
  red: '#FF4F6A', redS: 'rgba(255,79,106,0.15)',
  purple: '#A78BFA', purpleS: 'rgba(167,139,250,0.15)',
  text: '#E8EBF5', sub: '#8892A4', muted: '#4A5568', white: '#FFFFFF',
  isDark: true,
};

const lightColors = {
  bg: '#F5F7FA', surface: '#FFFFFF', surface2: '#F0F2F8', surface3: '#E8EBF5',
  border: '#D1D5E0', accent: '#E6B800', accentS: 'rgba(230,184,0,0.12)',
  blue: '#2563EB', blueS: 'rgba(37,99,235,0.1)',
  green: '#16A34A', greenS: 'rgba(22,163,74,0.1)',
  orange: '#EA580C', orangeS: 'rgba(234,88,12,0.1)',
  red: '#DC2626', redS: 'rgba(220,38,38,0.1)',
  purple: '#7C3AED', purpleS: 'rgba(124,58,237,0.1)',
  text: '#111827', sub: '#4B5563', muted: '#9CA3AF', white: '#FFFFFF',
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
