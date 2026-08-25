import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Platform } from 'react-native';
import { colors, fonts, radius, spacing, shadow } from '../theme';

// ── Button ──────────────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'primary', disabled, loading, style }) {
  const configs = {
    primary: { bg: colors.accent, text: colors.white, border: 'transparent' },
    success: { bg: colors.green, text: colors.white, border: 'transparent' },
    danger: { bg: colors.pink, text: colors.white, border: 'transparent' },
    ghost: { bg: 'transparent', text: colors.accent, border: colors.border },
    outline: { bg: 'transparent', text: colors.accent, border: colors.accent },
    orange: { bg: colors.orange, text: colors.white, border: 'transparent' },
    purple: { bg: colors.purple, text: colors.white, border: 'transparent' },
  };
  const c = configs[variant] || configs.primary;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      style={[{ backgroundColor: c.bg, borderWidth: 1.5, borderColor: c.border, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', opacity: disabled ? 0.5 : 1 }, shadow.sm, style]}>
      {loading ? <ActivityIndicator color={c.text} size="small" /> : <Text style={{ color: c.text, fontSize: fonts.base, fontWeight: '700', letterSpacing: 0.3 }}>{label}</Text>}
    </TouchableOpacity>
  );
}

// ── Card ────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress, accent }) {
  const cardStyle = [
    { 
      backgroundColor: colors.surface, 
      borderRadius: radius.lg, 
      padding: spacing.base, 
      borderWidth: 1.5, 
      borderColor: accent ? accent + '40' : colors.border, 
      borderLeftWidth: accent ? 5 : 1.5, 
      borderLeftColor: accent || colors.border,
      shadowColor: accent || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: accent ? 0.15 : 0.04,
      shadowRadius: 10,
      elevation: 3
    }, 
    style
  ];
  if (onPress) return <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={cardStyle}>{children}</TouchableOpacity>;
  return <View style={cardStyle}>{children}</View>;
}

// ── ColorCard ────────────────────────────────────────────────────────────
export function ColorCard({ children, color = colors.blue, style, onPress }) {
  const cardStyle = [{ backgroundColor: color + '12', borderRadius: radius.lg, padding: spacing.base, borderWidth: 1.5, borderColor: color + '30' }, shadow.sm, style];
  if (onPress) return <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardStyle}>{children}</TouchableOpacity>;
  return <View style={cardStyle}>{children}</View>;
}

// ── Input ────────────────────────────────────────────────────────────────
export function Input({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, multiline, style, icon }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={{ color: colors.textSub, fontSize: fonts.sm, marginBottom: 6, fontWeight: '700' }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, ...shadow.sm }}>
        {icon && <Text style={{ marginRight: 8, fontSize: 16 }}>{icon}</Text>}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[{ flex: 1, color: colors.text, fontSize: fonts.base, paddingVertical: 13 }, style]}
        />
      </View>
    </View>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────
export function Badge({ label, color = colors.accent }) {
  return (
    <View style={{ backgroundColor: color + '18', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: color + '33' }}>
      <Text style={{ color, fontSize: fonts.xs, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

// ── StatusBadge ──────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    'In Transit': colors.blue, 'Delivered': colors.green, 'Pending': colors.yellow,
    'Cancelled': colors.pink, 'Completed': colors.green, 'On Trip': colors.blue,
    'Available': colors.green, 'Maintenance': colors.orange, 'Off Duty': colors.textMuted,
  };
  return <Badge label={status} color={map[status] || colors.textMuted} />;
}

// ── Header ────────────────────────────────────────────────────────────────
export function Header({ title, subtitle, onBack, right, nav }) {
  return (
    <View style={{ paddingHorizontal: spacing.base, paddingTop: 52, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack && (
          <TouchableOpacity onPress={() => nav ? nav.goBack() : onBack()} style={{ marginRight: 12, width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border }}>
            <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '700' }}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '900' }}>{title}</Text>
          {subtitle && <Text style={{ color: colors.textSub, fontSize: fonts.sm, marginTop: 2 }}>{subtitle}</Text>}
        </View>
      </View>
      {right && right}
    </View>
  );
}

// ── BackBtn ────────────────────────────────────────────────────────────────
export function BackBtn({ onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, marginBottom: 16 }, style]}>
      <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '700' }}>‹</Text>
    </TouchableOpacity>
  );
}

// ── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = colors.accent, sub, style }) {
  return (
    <View style={[{ backgroundColor: color + '12', borderRadius: radius.lg, padding: 12, borderWidth: 1.5, borderColor: color + '25' }, shadow.sm, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {icon && (
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16 }}>{icon}</Text>
          </View>
        )}
      </View>
      <Text style={{ color, fontSize: fonts.xl, fontWeight: '900', marginBottom: 2 }}>{value}</Text>
      <Text style={{ color: colors.textSub, fontSize: fonts.xs, fontWeight: '700' }}>{label}</Text>
      {sub && <Text style={{ color: colors.textMuted, fontSize: fonts.xs, marginTop: 2 }}>{sub}</Text>}
    </View>
  );
}

// ── SectionLabel ────────────────────────────────────────────────────────────
export function SectionLabel({ label, style }) {
  return (
    <Text style={[{ fontSize: fonts.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 10, marginTop: 4, textTransform: 'uppercase' }, style]}>{label}</Text>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ color: colors.textMuted, fontSize: fonts.xs, paddingHorizontal: 10 }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, sub, action, onAction }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 36 }}>{icon}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '950', marginBottom: 6, textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: colors.textSub, fontSize: fonts.sm, textAlign: 'center', marginBottom: 20 }}>{sub}</Text>
      {action && onAction && <Btn label={action} onPress={onAction} style={{ minWidth: 160 }} />}
    </View>
  );
}

// ── ProgressBar ────────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, color = colors.accent, height = 6 }) {
  return (
    <View style={{ height, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.round(value * 100))}%`, height, backgroundColor: color, borderRadius: radius.full }} />
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────
export function Avatar({ name = '?', size = 40, color = colors.accent }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: color + '40' }}>
      <Text style={{ color, fontSize: size * 0.36, fontWeight: '800' }}>{initials}</Text>
    </View>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onTab }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginHorizontal: spacing.base, marginBottom: spacing.base, borderWidth: 1.5, borderColor: colors.border, ...shadow.sm }}>
      {tabs.map(t => (
        <TouchableOpacity key={t} onPress={() => onTab(t)} activeOpacity={0.7}
          style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.sm, backgroundColor: active === t ? colors.accent : 'transparent' }}>
          <Text style={{ color: active === t ? colors.white : colors.textSub, fontSize: fonts.sm, fontWeight: '700' }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Chip ────────────────────────────────────────────────────────────────
export function Chip({ label, icon, selected, color = colors.accent, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: selected ? color : colors.border, backgroundColor: selected ? color + '15' : colors.surface, marginRight: 8, marginBottom: 8, ...shadow.sm }}>
      {icon && <Text style={{ fontSize: 14 }}>{icon}</Text>}
      <Text style={{ fontSize: fonts.sm, fontWeight: '700', color: selected ? color : colors.textSub }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── FuelBar ────────────────────────────────────────────────────────────────
export function FuelBar({ level = 0 }) {
  const color = level > 60 ? colors.green : level > 30 ? colors.orange : colors.pink;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 14 }}>⛽</Text>
      <View style={{ flex: 1 }}>
        <ProgressBar value={level / 100} color={color} height={6} />
      </View>
      <Text style={{ color, fontSize: fonts.sm, fontWeight: '800', width: 34, textAlign: 'right' }}>{level}%</Text>
    </View>
  );
}

// ── Row / ListItem ────────────────────────────────────────────────────────────
export function ListItem({ left, title, subtitle, right, onPress, style }) {
  const content = (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.border }, style]}>
      {left && <View style={{ marginRight: 14 }}>{left}</View>}
      <View style={{ flex: 1 }}>
        {typeof title === 'string'
          ? <Text style={{ color: colors.text, fontSize: fonts.base, fontWeight: '600' }}>{title}</Text>
          : title}
        {subtitle && <Text style={{ color: colors.textSub, fontSize: fonts.sm, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {right || <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity> : content;
}

// ── CostHero ────────────────────────────────────────────────────────────────
export function CostHero({ cost, label = 'MINIMUM COST', sub, style }) {
  return (
    <View style={[{ backgroundColor: colors.accent, borderRadius: radius.xl, padding: 24, alignItems: 'center', marginBottom: 14 }, shadow.lg, style]}>
      <Text style={{ fontSize: fonts.xs, color: colors.white + 'BB', letterSpacing: 1.5, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontSize: 38, fontWeight: '900', color: colors.white }}>₹{typeof cost === 'number' ? cost.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : cost}</Text>
      {sub && <Text style={{ fontSize: fonts.sm, color: colors.white + 'CC', marginTop: 6, textAlign: 'center' }}>{sub}</Text>}
    </View>
  );
}

// ── TransportIcon ────────────────────────────────────────────────────────
export function TransportIcon({ type, size = 28 }) {
  const map = { truck: '🚛', train: '🚂', ship: '🚢', air: '✈️', bike: '🏍️' };
  return <Text style={{ fontSize: size }}>{map[type] || '🚛'}</Text>;
}

// ── BottomNav ────────────────────────────────────────────────────────────
export function BottomNav({ tabs, activeTab, onTabPress }) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      backgroundColor: colors.surface, 
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.xl,
      marginHorizontal: 16,
      marginBottom: Platform.OS === 'ios' ? 34 : 16,
      paddingVertical: 10,
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 8 }, 
      shadowOpacity: 0.18, 
      shadowRadius: 15, 
      elevation: 6 
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity key={tab.id} onPress={() => onTabPress(tab.id)} activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isActive ? colors.accent + '18' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            </View>
            <Text style={{ fontSize: 10, fontWeight: isActive ? '800' : '600', color: isActive ? colors.accent : colors.textMuted }}>{tab.label}</Text>
            {isActive && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Row (alias for ListItem) ──────────────────────────────────────────────
export function Row({ left, right, sub, border, onPress, icon }) {
  const content = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: border ? 1 : 0, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {icon && <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: fonts.base, fontWeight: '600' }}>{left}</Text>
          {sub && <Text style={{ color: colors.textSub, fontSize: fonts.sm, marginTop: 2 }}>{sub}</Text>}
        </View>
      </View>
      <Text style={{ color: typeof right === 'string' ? colors.textSub : colors.text, fontSize: fonts.sm }}>{right || '›'}</Text>
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity> : content;
}

// ── NotifCard ────────────────────────────────────────────────────────────
export function NotifCard({ icon, title, msg, time, color = colors.accent, unread, delay }) {
  return (
    <View style={{ backgroundColor: unread ? color + '08' : colors.surface, borderRadius: radius.lg, padding: spacing.base, marginBottom: 10, borderWidth: 1.5, borderColor: unread ? color + '25' : colors.border, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: fonts.base, fontWeight: '700', color: colors.text, flex: 1 }}>{title}</Text>
          {unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginLeft: 8 }} />}
        </View>
        <Text style={{ fontSize: fonts.sm, color: colors.textSub, lineHeight: 18 }}>{msg}</Text>
        <Text style={{ fontSize: fonts.xs, color: colors.textMuted, marginTop: 4 }}>{time}</Text>
      </View>
    </View>
  );
}

// ── AppLogo (Premium Vector Branding) ───────────────────────────────────────────
export function AppLogo({ size = 80 }) {
  const innerSize = size * 0.85;
  const radiusVal = size * 0.28;
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: radiusVal,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 15,
      elevation: 8,
    }}>
      <View style={{
        width: innerSize,
        height: innerSize,
        borderRadius: radiusVal * 0.9,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <View style={{ width: '60%', height: '60%', position: 'relative' }}>
          {/* Node 1 */}
          <View style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />
          {/* Path line 1 */}
          <View style={{ position: 'absolute', top: 3, left: 6, width: '65%', height: 2, backgroundColor: 'rgba(255, 255, 255, 0.6)', transform: [{ rotate: '25deg' }] }} />
          {/* Node 2 */}
          <View style={{ position: 'absolute', top: '35%', right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange, borderWidth: 1.5, borderColor: colors.white }} />
          {/* Path line 2 */}
          <View style={{ position: 'absolute', bottom: 6, left: 8, width: '55%', height: 2, backgroundColor: 'rgba(255, 255, 255, 0.6)', transform: [{ rotate: '-30deg' }] }} />
          {/* Node 3 */}
          <View style={{ position: 'absolute', bottom: 0, left: '20%', width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green }} />
          {/* Center delivery truck icon */}
          <View style={{ position: 'absolute', top: '15%', left: '15%', alignItems: 'center', justifyContent: 'center', width: '70%', height: '70%' }}>
            <Text style={{ fontSize: size * 0.32 }}>🚛</Text>
          </View>
        </View>
      </View>
    </View>
  );
}