// S01 — Splash Screen
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Btn, AppLogo } from '../../components';

export function SplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true })
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding1'), 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={s.splash}>
      <Animated.View style={{ transform: [{ scale }], opacity, marginBottom: 20 }}>
        <AppLogo size={90} />
      </Animated.View>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <Text style={s.splashTitle}>LogiRoute</Text>
        <Text style={s.splashSub}>Smart Logistics Optimizer</Text>
      </Animated.View>
      <Animated.View style={[s.splashBar, { opacity }]} />
    </View>
  );
}

// S02 — Onboarding 1
export function Onboarding1Screen({ navigation }) {
  return (
    <SafeAreaView style={s.ob}>
      <TouchableOpacity onPress={() => navigation.replace('UserType')} style={s.skip}><Text style={s.skipText}>Skip</Text></TouchableOpacity>
      <View style={s.obContent}>
        <Text style={s.obEmoji}>⚡</Text>
        <Text style={s.obTitle}>Smart Route Optimizer</Text>
        <Text style={s.obDesc}>AI-powered routing finds the cheapest, fastest transport for your cargo — truck, train, or ship.</Text>
        <View style={s.dots}><View style={[s.dot, s.dotActive]} /><View style={s.dot} /><View style={s.dot} /></View>
        <Btn label="Next →" onPress={() => navigation.navigate('Onboarding2')} />
        <Btn label="Skip" onPress={() => navigation.replace('UserType')} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

// S03 — Onboarding 2
export function Onboarding2Screen({ navigation }) {
  return (
    <SafeAreaView style={s.ob}>
      <TouchableOpacity onPress={() => navigation.replace('UserType')} style={s.skip}><Text style={s.skipText}>Skip</Text></TouchableOpacity>
      <View style={s.obContent}>
        <Text style={s.obEmoji}>🗺</Text>
        <Text style={s.obTitle}>Live GPS Tracking</Text>
        <Text style={s.obDesc}>Track your shipments in real-time from pickup to delivery. Never lose sight of your cargo.</Text>
        <View style={s.dots}><View style={s.dot} /><View style={[s.dot, s.dotActive]} /><View style={s.dot} /></View>
        <Btn label="Next →" onPress={() => navigation.navigate('UserType')} />
        <Btn label="← Back" onPress={() => navigation.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

// S04 — User Type
export function UserTypeScreen({ navigation }) {
  const [selected, setSelected] = React.useState('company');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.screen}>
        <Text style={s.h1}>I am a...</Text>
        <Text style={s.subText}>Choose your role to get started</Text>
        <TouchableOpacity 
          style={[
            s.typeCard, 
            { backgroundColor: '#f7b0bb' },
            selected === 'company' && { borderColor: colors.accent, borderWidth: 3 }
          ]} 
          onPress={() => setSelected('company')}
        >
          <Text style={{ fontSize: 48, marginBottom: 10 }}>🏢</Text>
          <Text style={[s.typeName, selected === 'company' && { color: colors.accent }]}>Company / Manager</Text>
          <Text style={s.typeDesc}>Manage shipments, optimize routes, control costs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            s.typeCard, 
            { backgroundColor: '#f7b0bb' },
            selected === 'driver' && { borderColor: colors.green, borderWidth: 3 }
          ]} 
          onPress={() => setSelected('driver')}
        >
          <Text style={{ fontSize: 48, marginBottom: 10 }}>🚛</Text>
          <Text style={[s.typeName, selected === 'driver' && { color: colors.green }]}>Driver / Vendor</Text>
          <Text style={s.typeDesc}>Find jobs, track trips, manage earnings</Text>
        </TouchableOpacity>
        <Btn label="Continue →" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 14 },
  splashLogo: { width: 90, height: 90, backgroundColor: colors.accent, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  splashTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -1, textAlign: 'center' },
  splashSub: { fontSize: 14, color: colors.sub, textAlign: 'center', marginTop: 4 },
  splashBar: { width: 50, height: 4, backgroundColor: colors.accent, borderRadius: 2, marginTop: 16 },
  ob: { flex: 1, backgroundColor: colors.bg },
  skip: { alignSelf: 'flex-end', padding: 20 },
  skipText: { fontSize: 14, color: colors.sub },
  obContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  obEmoji: { fontSize: 80, marginBottom: 24 },
  obTitle: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  obDesc: { fontSize: 15, color: colors.sub, textAlign: 'center', lineHeight: 24, marginBottom: 32, maxWidth: 300 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 32 },
  dot: { width: 8, height: 4, backgroundColor: colors.border, borderRadius: 2 },
  dotActive: { width: 24, backgroundColor: colors.accent },
  screen: { padding: 20, paddingTop: 60, flexGrow: 1 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  subText: { fontSize: 14, color: colors.sub, marginBottom: 28 },
  typeCard: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 14 },
  typeCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentS },
  typeName: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  typeDesc: { fontSize: 13, color: colors.sub, textAlign: 'center' },
});
