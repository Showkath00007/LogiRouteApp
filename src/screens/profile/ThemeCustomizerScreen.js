import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors as baseColors, radius, shadow } from '../../theme';
import { BackBtn, Card, Btn } from '../../components';
import { useTheme, THEMES } from '../../context/ThemeContext';

export default function ThemeCustomizerScreen({ navigation }) {
  const { themeKey, changeTheme, colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          <View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>Theme Settings</Text>
            <Text style={{ fontSize: 13, color: colors.textSub }}>Personalize your logistics portal</Text>
          </View>
        </View>

        {/* Live Theme Preview Card */}
        <Card style={{ marginBottom: 24, padding: 20, backgroundColor: colors.surface }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMuted, marginBottom: 12, letterSpacing: 0.5 }}>ACTIVE PREVIEW</Text>
          
          {/* Mock Dashboard Widget */}
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Route Optimizer</Text>
                <Text style={{ fontSize: 11, color: colors.textSub }}>Fastest path activated</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.accentLight }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.accent }}>100% Secure</Text>
              </View>
            </View>

            {/* Mock bar chart preview */}
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 40, paddingVertical: 4 }}>
              {[0.4, 0.7, 0.55, 0.9, 0.65].map((h, i) => (
                <View key={i} style={{ flex: 1, height: `${h * 100}%`, backgroundColor: colors.accent, borderRadius: 3, opacity: 0.3 + (i * 0.15) }} />
              ))}
            </View>

            <Btn label="Preview Action Button" onPress={() => {}} style={{ marginBottom: 0, paddingVertical: 10 }} />
          </View>
        </Card>

        {/* Theme List Selection */}
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textSub, marginBottom: 12, marginLeft: 4 }}>AVAILABLE THEMES</Text>
        <View style={{ gap: 12, marginBottom: 24 }}>
          {Object.keys(THEMES).map((key) => {
            const th = THEMES[key];
            const isSelected = themeKey === key;
            return (
              <TouchableOpacity key={key} onPress={() => changeTheme(key)} activeOpacity={0.9}>
                <Card style={{
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderWidth: 1.5,
                  backgroundColor: colors.surface,
                  ...shadow.sm
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: th.accentLight || colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ fontSize: 24 }}>{th.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{th.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' }}>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: th.accent }} />
                        <View style={{ width: 32, height: 8, borderRadius: 4, backgroundColor: th.accentLight }} />
                      </View>
                    </View>
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.accent : colors.border,
                      backgroundColor: isSelected ? colors.accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isSelected && <Text style={{ color: colors.surface, fontSize: 11, fontWeight: '900' }}>✓</Text>}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <Btn label="Save & Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}
