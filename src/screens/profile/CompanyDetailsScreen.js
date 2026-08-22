import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { colors } from '../../theme';
import { BackBtn, Input, Btn, SectionLabel } from '../../components';
import { getProfile, saveProfile } from '../../config/UserStore';

export default function CompanyDetailsScreen({ navigation }) {
  const [company, setCompany] = useState('');
  const [gst, setGst] = useState('');
  const [reg, setReg] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  const [pan, setPan] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const prof = await getProfile().catch(() => null);
        if (prof) {
          setCompany(prof.company || (prof.name?.toLowerCase() === 'uri' ? 'Uri Logistics' : ''));
          setGst(prof.gst || '');
          setReg(prof.reg || '');
          setAddress(prof.address || '');
          setCity(prof.city || '');
          setState(prof.state || '');
          setPin(prof.pin || '');
          setPan(prof.pan || '');
        }
      } catch (e) {}
    };
    loadProfile();
  }, []);

  const save = async () => {
    try {
      await saveProfile({ company, gst, reg, address, city, state, pin, pan });
      Alert.alert('Company Details Updated!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save company details.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Company Details</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>GST, address & registration info</Text>

        <SectionLabel label="Company Info" />
        <Input placeholder="Company Name" value={company} onChangeText={setCompany} />
        <Input placeholder="PAN Number" value={pan} onChangeText={setPan} />
        <Input placeholder="GST Number" value={gst} onChangeText={setGst} />
        <Input placeholder="Registration Number" value={reg} onChangeText={setReg} />

        <SectionLabel label="Address" />
        <Input placeholder="Street Address" value={address} onChangeText={setAddress} />
        <Input placeholder="City" value={city} onChangeText={setCity} />
        <Input placeholder="State" value={state} onChangeText={setState} />
        <Input placeholder="PIN Code" value={pin} onChangeText={setPin} keyboardType="numeric" />

        <Btn label="Save Changes ✓" onPress={save} style={{ marginTop: 10 }} />
        <Btn label="Cancel" onPress={() => navigation.goBack()} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}
