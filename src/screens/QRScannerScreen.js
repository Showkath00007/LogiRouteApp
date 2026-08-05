import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { colors, radius } from '../theme';
import { BackBtn, Btn, Card } from '../components';

export default function QRScannerScreen({ navigation, route }) {
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);

  // Simulate a scan result (in real app, use expo-barcode-scanner)
  const simulateScan = () => {
    const mockData = { bookingId: '#LR-2024-0512', from: 'Mumbai', to: 'Delhi', material: 'Steel', status: 'In Transit' };
    setResult(mockData);
    setScanned(true);
  };

  const handleRescan = () => { setScanned(false); setResult(null); };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
        <Text style={s.title}>Scan QR Code</Text>
        <View style={{ width: 60 }} />
      </View>

      {!scanned ? (
        <View style={s.scanArea}>
          {/* Camera viewfinder mock */}
          <View style={s.viewfinder}>
            <View style={s.cameraPlaceholder}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
              <Text style={{ fontSize: 14, color: colors.sub, textAlign: 'center' }}>Camera preview</Text>
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>Point at shipment QR code</Text>
            </View>
            {/* Corner brackets */}
            {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
              <View key={i} style={[s.corner, pos,
                { borderTopWidth: pos.top === 0 ? 3 : 0, borderLeftWidth: pos.left === 0 ? 3 : 0, borderRightWidth: pos.right === 0 ? 3 : 0, borderBottomWidth: pos.bottom === 0 ? 3 : 0 }
              ]} />
            ))}
            {/* Scan line animation */}
            <View style={s.scanLine} />
          </View>

          <Text style={s.hint}>📦 Scan shipment QR to track instantly</Text>

          <TouchableOpacity style={s.simulateBtn} onPress={simulateScan}>
            <Text style={s.simulateBtnText}>⚡ Simulate Scan (Demo)</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}><View style={s.divLine} /><Text style={s.divText}>or enter manually</Text><View style={s.divLine} /></View>

          <Btn label="Enter Booking ID →" onPress={() => navigation.navigate('TrackShipment')} variant="outline" style={{ marginHorizontal: 20 }} />
        </View>
      ) : (
        <View style={{ padding: 20 }}>
          <View style={s.successIcon}><Text style={{ fontSize: 40 }}>✅</Text></View>
          <Text style={s.successTitle}>QR Scanned!</Text>
          <Text style={s.successSub}>Shipment found</Text>

          <Card style={{ marginTop: 8 }}>
            {[
              ['Booking ID', result.bookingId],
              ['Route', `${result.from} → ${result.to}`],
              ['Material', result.material],
              ['Status', result.status],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ fontSize: 13, color: colors.sub }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: k === 'Status' ? colors.green : colors.text }}>{v}</Text>
              </View>
            ))}
          </Card>

          <Btn label="📍 Track This Shipment" onPress={() => navigation.navigate('DeliveryStatus')} />
          <Btn label="🔄 Scan Another" onPress={handleRescan} variant="outline" />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  scanArea: { flex: 1, alignItems: 'center', paddingTop: 20 },
  viewfinder: { width: 260, height: 260, position: 'relative', marginBottom: 24 },
  cameraPlaceholder: { width: '100%', height: '100%', backgroundColor: colors.surface2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: colors.accent },
  scanLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: colors.accent, opacity: 0.8 },
  hint: { fontSize: 13, color: colors.sub, marginBottom: 24 },
  simulateBtn: { backgroundColor: colors.accentS, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 24, marginBottom: 16 },
  simulateBtnText: { fontSize: 14, fontWeight: '700', color: colors.accent },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingHorizontal: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divText: { fontSize: 12, color: colors.muted },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.greenS, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center' },
  successSub: { fontSize: 13, color: colors.sub, textAlign: 'center', marginBottom: 16 },
});
