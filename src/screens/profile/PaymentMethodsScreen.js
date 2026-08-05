import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme';
import { BackBtn, Card, SectionLabel, Btn } from '../../components';

export default function PaymentMethodsScreen({ navigation }) {
  const [selected, setSelected] = useState('upi1');

  const upiAccounts = [
    { id: 'upi1', icon: '📱', label: 'kadiyala@okicici', app: 'iMobile Pay', primary: true },
    { id: 'upi2', icon: '📱', label: 'kadiyala@ybl', app: 'PhonePe', primary: false },
  ];

  const bankAccounts = [
    { id: 'bank1', icon: '🏦', label: 'SBI Savings', number: 'XXXX XXXX 7890', ifsc: 'SBIN0001234' },
    { id: 'bank2', icon: '🏦', label: 'ICICI Current', number: 'XXXX XXXX 4321', ifsc: 'ICIC0001234' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, flexGrow: 1 }}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Payment Methods</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>Manage UPI & bank accounts</Text>

        <SectionLabel label="UPI Accounts" />
        {upiAccounts.map(upi => (
          <TouchableOpacity key={upi.id} onPress={() => setSelected(upi.id)}>
            <Card style={{ borderColor: selected === upi.id ? colors.accent : colors.border, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 28 }}>{upi.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{upi.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.sub }}>{upi.app}</Text>
                </View>
                {upi.primary && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.accentS }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>Primary</Text>
                  </View>
                )}
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selected === upi.id ? colors.accent : colors.border, backgroundColor: selected === upi.id ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {selected === upi.id && <Text style={{ fontSize: 10, color: colors.bg }}>✓</Text>}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => Alert.alert('Add UPI', 'Coming soon!')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 20, color: colors.accent }}>＋</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent }}>Add UPI ID</Text>
        </TouchableOpacity>

        <SectionLabel label="Bank Accounts" />
        {bankAccounts.map(bank => (
          <Card key={bank.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28 }}>{bank.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{bank.label}</Text>
                <Text style={{ fontSize: 12, color: colors.sub }}>{bank.number} · {bank.ifsc}</Text>
              </View>
            </View>
          </Card>
        ))}
        <TouchableOpacity onPress={() => Alert.alert('Add Bank', 'Coming soon!')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 20, color: colors.accent }}>＋</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent }}>Add Bank Account</Text>
        </TouchableOpacity>

        <Btn label="Save Changes ✓" onPress={() => { Alert.alert('Saved!'); navigation.goBack(); }} />
      </ScrollView>
    </SafeAreaView>
  );
}
