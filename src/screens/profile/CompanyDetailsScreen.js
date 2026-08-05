import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { colors } from '../../theme';
import { BackBtn, Input, Btn, SectionLabel } from '../../components';

export default function CompanyDetailsScreen({ navigation }) {
  const [company, setCompany] = useState('Kadiyala Logistics');
  const [gst, setGst] = useState('33AABCK1234M1Z5');
  const [reg, setReg] = useState('U60200TN2020PTC123456');
  const [address, setAddress] = useState('12, Anna Salai, Chennai');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [pin, setPin] = useState('600002');
  const [pan, setPan] = useState('AABCK1234M');

  const save = () => {
    Alert.alert('Company Details Updated!');
    navigation.goBack();
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
