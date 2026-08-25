import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../config/UserStore';
import { colors as baseColors } from '../theme';

const ThemeContext = createContext();

export const THEMES = {
  indigo: {
    name: 'Neo-Midnight (Default)',
    accent: '#06B6D4',
    accentDark: '#0891B2',
    accentLight: 'rgba(6, 182, 212, 0.15)',
    grad1: ['#06B6D4', '#6366F1'],
    icon: '🌌'
  },
  emerald: {
    name: 'Neon-Mint',
    accent: '#10B981',
    accentDark: '#047857',
    accentLight: 'rgba(16, 185, 129, 0.15)',
    grad1: ['#10B981', '#00F2FE'],
    icon: '🌿'
  },
  midnight: {
    name: 'Amethyst-Glow',
    accent: '#A855F7',
    accentDark: '#7E22CE',
    accentLight: 'rgba(168, 85, 247, 0.15)',
    grad1: ['#A855F7', '#EC4899'],
    icon: '🔮'
  },
  sunset: {
    name: 'Sunset-Amber',
    accent: '#F97316',
    accentDark: '#C2410C',
    accentLight: 'rgba(249, 117, 22, 0.15)',
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
