import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../config/UserStore';
import { colors as baseColors } from '../theme';

const ThemeContext = createContext();

export const THEMES = {
  indigo: {
    name: 'Slate-Indigo (Default)',
    accent: '#4F46E5',
    accentDark: '#3730A3',
    accentLight: '#EEF2FF',
    grad1: ['#4F46E5', '#8B5CF6'],
    icon: '🔮'
  },
  emerald: {
    name: 'Emerald-Forest',
    accent: '#10B981',
    accentDark: '#047857',
    accentLight: '#ECFDF5',
    grad1: ['#10B981', '#06B6D4'],
    icon: '🌿'
  },
  midnight: {
    name: 'Midnight-Navy',
    accent: '#0F172A',
    accentDark: '#020617',
    accentLight: '#F1F5F9',
    grad1: ['#1E293B', '#475569'],
    icon: '🌌'
  },
  sunset: {
    name: 'Sunset-Amber',
    accent: '#F97316',
    accentDark: '#C2410C',
    accentLight: '#FFF7ED',
    grad1: ['#F97316', '#F59E0B'],
    icon: '🌅'
  }
};

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState('indigo');

  useEffect(() => {
    async function loadTheme() {
      try {
        const profile = await getProfile();
        if (profile?.theme && THEMES[profile.theme]) {
          const key = profile.theme;
          setThemeKey(key);
          applyGlobalColors(key);
        }
      } catch (e) {
        console.log('Error loading theme:', e);
      }
    }
    loadTheme();
  }, []);

  const applyGlobalColors = (key) => {
    const active = THEMES[key];
    if (active) {
      baseColors.accent = active.accent;
      baseColors.accentDark = active.accentDark;
      baseColors.accentLight = active.accentLight;
      baseColors.grad1 = active.grad1;
    }
  };

  const changeTheme = async (key) => {
    if (THEMES[key]) {
      setThemeKey(key);
      applyGlobalColors(key);
      await saveProfile({ theme: key });
    }
  };

  const activeTheme = THEMES[themeKey];
  const colors = {
    ...baseColors,
    accent: activeTheme.accent,
    accentDark: activeTheme.accentDark,
    accentLight: activeTheme.accentLight,
    grad1: activeTheme.grad1,
  };

  return (
    <ThemeContext.Provider value={{ themeKey, changeTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
