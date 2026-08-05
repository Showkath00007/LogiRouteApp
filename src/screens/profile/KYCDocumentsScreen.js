import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme';
import { BackBtn, Card, SectionLabel, Badge, Btn } from '../../components';

export default function KYCDocumentsScreen({ navigation }) {
  const docs = [
    { id: 'aadhaar', icon: '🪪', label: 'Aadhaar Card', status: 'verified', number: 'XXXX XXXX 4321' },
    { id: 'pan', icon: '🗂️', label: 'PAN Card', status: 'verified', number: 'AABCK1234M' },
    { id: 'gst', icon: '🏛️', label: 'GST Certificate', status: 'verified', number: '33AABCK1234M1Z5' },
    { id: 'trade', icon: '📋', label: 'Trade License', status: 'pending', number: 'Upload pending' },
    { id: 'bank', icon: '🏦', label: 'Cancelled Cheque', status: 'verified', number: 'SBI A/C XXXX7890' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, flexGrow: 1 }}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>KYC Documents</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>Your verification documents</Text>

        <Card style={{ backgroundColor: colors.accentS, borderColor: colors.accent + '44', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28 }}>✅</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.accent }}>KYC Verified</Text>
              <Text style={{ fontSize: 12, color: colors.sub }}>4 of 5 documents approved</Text>
            </View>
          </View>
        </Card>

        <SectionLabel label="Documents" />
        {docs.map(doc => (
          <Card key={doc.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28 }}>{doc.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{doc.label}</Text>
                <Text style={{ fontSize: 12, color: colors.sub, marginTop: 2 }}>{doc.number}</Text>
              </View>
              <Badge
                label={doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                type={doc.status === 'verified' ? 'green' : 'yellow'}
              />
            </View>
            {doc.status === 'pending' && (
              <TouchableOpacity
                onPress={() => Alert.alert('Upload', 'Document upload coming soon!')}
                style={{ marginTop: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.bg }}>Upload Document</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}

        <Btn label="Request Re-verification" onPress={() => Alert.alert('Request sent!')} variant="outline" style={{ marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
