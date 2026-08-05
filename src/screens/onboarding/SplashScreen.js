import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding1'), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.wrap}>
      {/* Background blobs */}
      <View style={[s.blob, { backgroundColor: colors.blue, top: -60, right: -60, width: 200, height: 200 }]} />
      <View style={[s.blob, { backgroundColor: colors.purple, bottom: 80, left: -80, width: 250, height: 250 }]} />
      <View style={[s.blob, { backgroundColor: colors.cyan, top: '40%', right: -40, width: 120, height: 120 }]} />

      <Animated.View style={[s.logoWrap, { opacity: fade, transform: [{ scale }] }]}>
        {/* Logo */}
        <View style={s.logoBox}>
          <View style={s.logoInner}>
            <Text style={s.logoIcon}>🚛</Text>
          </View>
          {/* Color dots */}
          <View style={[s.dot, { backgroundColor: colors.orange, top: 0, right: 0 }]} />
          <View style={[s.dot, { backgroundColor: colors.green, bottom: 0, left: 0 }]} />
          <View style={[s.dot, { backgroundColor: colors.pink, bottom: 0, right: 0 }]} />
        </View>

        <Animated.View style={{ transform: [{ translateY: slide }], alignItems: 'center' }}>
          <Text style={s.brand}>LogiRoute</Text>
          <View style={s.taglineRow}>
            {['Smart', '·', 'Fast', '·', 'Optimized'].map((w, i) => (
              <Text key={i} style={[s.tagWord, w === '·' && { color: colors.orange }]}>{w} </Text>
            ))}
          </View>
        </Animated.View>

        {/* Color bar */}
        <View style={s.colorBar}>
          {[colors.blue, colors.purple, colors.orange, colors.green, colors.pink].map((c, i) => (
            <View key={i} style={[s.colorDash, { backgroundColor: c }]} />
          ))}
        </View>
      </Animated.View>

      <Animated.Text style={[s.powered, { opacity: fade }]}>Powered by AI · Made for India 🇮🇳</Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  logoWrap: { alignItems: 'center', gap: 16 },
  logoBox: { width: 110, height: 110, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoInner: { width: 100, height: 100, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  logoIcon: { fontSize: 50 },
  dot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.white },
  brand: { color: colors.text, fontSize: fonts.xxxl, fontWeight: '900', letterSpacing: -1.5 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tagWord: { color: colors.textSub, fontSize: fonts.base, fontWeight: '600' },
  colorBar: { flexDirection: 'row', gap: 6, marginTop: 8 },
  colorDash: { width: 28, height: 5, borderRadius: 3 },
  powered: { position: 'absolute', bottom: 44, color: colors.textMuted, fontSize: fonts.sm, fontWeight: '600' },
});