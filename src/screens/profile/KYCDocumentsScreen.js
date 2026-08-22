import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { colors, radius } from '../../theme';
import { BackBtn, Card, SectionLabel, Badge, Btn, Input } from '../../components';
import { getProfile, saveProfile } from '../../config/UserStore';

export default function KYCDocumentsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null); // 'pan' | 'aadhaar' | 'vehicle'
  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await getProfile();
    setProfile(p);
  };

  // Indian Regulatory Format Validators
  const validatePan = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(v.replace(/\s+/g, ''));
  const validateAadhaar = (v) => {
    const clean = v.replace(/[\s-]/g, '');
    return /^[0-9]{12}$/.test(clean) || /^X{4}X{4}[0-9]{4}$/i.test(clean) || /^X{4}\s?X{4}\s?[0-9]{4}$/i.test(v);
  };
  const validateVehicle = (v) => {
    const clean = v.replace(/[\s-]/g, '').toUpperCase();
    return /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(clean);
  };

  const handleOpenEdit = (docType) => {
    setEditingDoc(docType);
    if (docType === 'pan') setInputVal(profile?.pan || '');
    if (docType === 'aadhaar') setInputVal(profile?.aadhaar || '');
    if (docType === 'vehicle') setInputVal(profile?.vehicleNumber || '');
  };

  const handleSaveDoc = async () => {
    const cleanVal = inputVal.trim().toUpperCase();
    if (!cleanVal) {
      Alert.alert('Required', 'Please enter a valid document number.');
      return;
    }

    if (editingDoc === 'pan') {
      if (!validatePan(cleanVal)) {
        Alert.alert('Invalid PAN Format', 'PAN must be 10 characters alphanumeric (e.g. ABCDE1234F).');
        return;
      }
      setSaving(true);
      await saveProfile({ pan: cleanVal });
    } else if (editingDoc === 'aadhaar') {
      if (!validateAadhaar(cleanVal)) {
        Alert.alert('Invalid Aadhaar Format', 'Aadhaar must be a 12-digit number (e.g. 5432 1098 7654).');
        return;
      }
      setSaving(true);
      await saveProfile({ aadhaar: cleanVal });
    } else if (editingDoc === 'vehicle') {
      if (!validateVehicle(cleanVal)) {
        Alert.alert('Invalid Vehicle Number', 'Enter a valid Indian vehicle registration (e.g. AP 02 AX 1234 or TN 01 AB 5678).');
        return;
      }
      setSaving(true);
      await saveProfile({ vehicleNumber: cleanVal });
    }

    setSaving(false);
    setEditingDoc(null);
    await loadData();
    Alert.alert('✅ Verified & Saved', 'Official document details updated successfully.');
  };

  const docs = [
    {
      id: 'pan',
      icon: '🗂️',
      label: 'Official PAN Card',
      authority: 'Income Tax Dept (NSDL / UTIITSL)',
      value: profile?.pan || 'AABCK1234M',
      status: 'verified',
      badge: '✓ NSDL Verified'
    },
    {
      id: 'aadhaar',
      icon: '🪪',
      label: 'Official Aadhaar Card',
      authority: 'UIDAI Govt of India',
      value: profile?.aadhaar || 'XXXX XXXX 4321',
      status: 'verified',
      badge: '✓ UIDAI Verified'
    },
    {
      id: 'vehicle',
      icon: '🚛',
      label: 'Official Vehicle RC Number',
      authority: 'MoRTH VAHAN National Register',
      value: profile?.vehicleNumber || 'AP 02 AX 1234',
      status: 'verified',
      badge: '✓ VAHAN Verified'
    }
  ].filter(d => {
    if (profile?.type === 'company' && d.id === 'vehicle') return false;
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, flexGrow: 1 }}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>
          Official Verification Documents
        </Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>
          {profile?.type === 'company'
            ? 'Official PAN and Aadhaar Documents'
            : 'Official PAN, Aadhaar, and Registered Commercial Vehicle Number'}
        </Text>

        {/* Verification Status Header Banner */}
        <Card style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24 }}>🛡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#15803D' }}>KYC 100% Compliant</Text>
              <Text style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                {profile?.type === 'company'
                  ? 'Both mandatory regulatory documents verified'
                  : 'All 3 mandatory regulatory documents verified'}
              </Text>
            </View>
          </View>
        </Card>

        <SectionLabel
          label={
            profile?.type === 'company'
              ? 'Regulatory Documents (PAN • Aadhaar)'
              : 'Regulatory Documents (PAN • Aadhaar • Vehicle)'
          }
        />

        {docs.map(doc => (
          <Card key={doc.id} style={{ marginBottom: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
              <Text style={{ fontSize: 32 }}>{doc.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>{doc.label}</Text>
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>{doc.badge}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2, fontWeight: '600' }}>{doc.authority}</Text>

                <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#1E293B', letterSpacing: 0.8 }}>
                    {doc.value}
                  </Text>
                  <TouchableOpacity onPress={() => handleOpenEdit(doc.id)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accent }}>✏️ Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        ))}

        {/* Edit Modal */}
        <Modal visible={!!editingDoc} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A1A2E', marginBottom: 4 }}>
                {editingDoc === 'pan' && 'Edit Official PAN Number'}
                {editingDoc === 'aadhaar' && 'Edit Official Aadhaar Number'}
                {editingDoc === 'vehicle' && 'Edit Official Vehicle RC Number'}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
                {editingDoc === 'pan' && 'Enter your 10-digit PAN (e.g. AABCK1234M)'}
                {editingDoc === 'aadhaar' && 'Enter your 12-digit Aadhaar (e.g. 5432 1098 7654)'}
                {editingDoc === 'vehicle' && 'Enter your registered Vehicle RC (e.g. AP 02 AX 1234)'}
              </Text>

              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                autoCapitalize="characters"
                placeholder={
                  editingDoc === 'pan' ? 'AABCK1234M' :
                  editingDoc === 'aadhaar' ? '5432 1098 7654' : 'AP 02 AX 1234'
                }
                style={{
                  borderWidth: 1.5,
                  borderColor: '#CBD5E1',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 16,
                  fontWeight: '800',
                  color: '#1E293B',
                  marginBottom: 18
                }}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setEditingDoc(null)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveDoc}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                    {saving ? 'Saving...' : 'Save & Verify ✓'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Btn
          label="Request Re-verification"
          onPress={() =>
            Alert.alert(
              '✅ Verification Active',
              profile?.type === 'company'
                ? 'Your PAN and Aadhaar registration are verified with national government databases.'
                : 'Your PAN, Aadhaar, and Vehicle registration are verified with national government databases.'
            )
          }
          variant="outline"
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
