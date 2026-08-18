import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { BackBtn, Card, SectionLabel, Btn, Input } from '../../components';
import { saveUserProfile, getUserProfile } from '../../config/firebaseService';

export default function PaymentMethodsScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [upiAccounts, setUpiAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Form states for manual additions
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiApp, setNewUpiApp] = useState('');

  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankLabel, setNewBankLabel] = useState('');
  const [newBankNumber, setNewBankNumber] = useState('');
  const [newBankIfsc, setNewBankIfsc] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getUserProfile();
        if (profile?.upiAccounts && Array.isArray(profile.upiAccounts)) {
          setUpiAccounts(profile.upiAccounts);
        }
        if (profile?.bankAccounts && Array.isArray(profile.bankAccounts)) {
          setBankAccounts(profile.bankAccounts);
        }
        if (profile?.selectedUpiId) {
          setSelected(profile.selectedUpiId);
        }
      } catch (e) {
        console.log('Error loading payment methods:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (bankAccounts.length === 0) {
      Alert.alert('Action Required', 'Please add a bank account first.');
      return;
    }
    setSaving(true);
    try {
      await saveUserProfile({
        upiAccounts,
        bankAccounts,
        selectedUpiId: selected
      });
      Alert.alert('✅ Success', 'Payment methods updated successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save payment methods. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpi = () => {
    const formattedUpi = newUpiId.trim();
    const appName = newUpiApp.trim() || 'UPI App';

    if (!formattedUpi) {
      Alert.alert('Validation Error', 'Please enter a UPI ID.');
      return;
    }
    if (!formattedUpi.includes('@')) {
      Alert.alert('Invalid UPI ID', 'UPI ID must contain the "@" symbol (e.g. name@okaxis).');
      return;
    }

    const newObj = {
      id: 'upi_' + Date.now(),
      icon: '📱',
      label: formattedUpi,
      app: appName,
      primary: upiAccounts.length === 0
    };

    setUpiAccounts(prev => [...prev, newObj]);
    if (upiAccounts.length === 0) {
      setSelected(newObj.id);
    }

    // Reset inputs
    setNewUpiId('');
    setNewUpiApp('');
    setShowAddUpi(false);
  };

  const handleAddBank = () => {
    const bankLabel = newBankLabel.trim();
    const rawNumber = newBankNumber.trim();
    const ifsc = newBankIfsc.trim().toUpperCase();

    if (!bankLabel || !rawNumber || !ifsc) {
      Alert.alert('Validation Error', 'Please fill out all bank details.');
      return;
    }
    if (rawNumber.length < 9 || isNaN(rawNumber)) {
      Alert.alert('Invalid Account Number', 'Bank account number must be at least 9 numeric digits.');
      return;
    }
    if (ifsc.length !== 11) {
      Alert.alert('Invalid IFSC Code', 'IFSC code must be exactly 11 alphanumeric characters.');
      return;
    }

    // Mask account number to show last 4 digits (e.g. XXXX XXXX 1234)
    const masked = 'XXXX XXXX ' + rawNumber.slice(-4);

    const newObj = {
      id: 'bank_' + Date.now(),
      icon: '🏦',
      label: bankLabel,
      number: masked,
      ifsc: ifsc
    };

    setBankAccounts(prev => [...prev, newObj]);

    // Reset inputs
    setNewBankLabel('');
    setNewBankNumber('');
    setNewBankIfsc('');
    setShowAddBank(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Payment Methods</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>Manage UPI & bank accounts</Text>

        {bankAccounts.length === 0 && (
          <View style={{
            backgroundColor: '#FFF8F2',
            borderWidth: 1.5,
            borderColor: '#FFC085',
            borderRadius: radius.md,
            padding: 14,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
          }}>
            <Text style={{ fontSize: 20 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#D97706' }}>Action Required</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#B45309', marginTop: 2 }}>
                Please add at least one Bank Account first before configuring payment details.
              </Text>
            </View>
          </View>
        )}

        <SectionLabel label="UPI Accounts" />
        {upiAccounts.length === 0 && (
          <Card style={{ marginBottom: 10, borderStyle: 'dashed', borderColor: colors.border, borderWidth: 1.5, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>No UPI Accounts added yet.</Text>
          </Card>
        )}
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

        {/* Add UPI Form Inline */}
        {showAddUpi ? (
          <Card style={{ marginBottom: 20, borderColor: colors.accent, borderWidth: 1.5 }}>
            <Text style={{ fontSize: 14, fontWeight: '850', color: colors.text, marginBottom: 12 }}>Add New UPI ID</Text>
            
            <Input
              label="UPI ID"
              placeholder="e.g. kadiyala@okicici"
              value={newUpiId}
              onChangeText={setNewUpiId}
              style={{ marginBottom: 12 }}
            />

            <Input
              label="Provider App Name"
              placeholder="e.g. PhonePe, GPay, Paytm"
              value={newUpiApp}
              onChangeText={setNewUpiApp}
              style={{ marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn label="Cancel" onPress={() => setShowAddUpi(false)} variant="ghost" style={{ flex: 1 }} />
              <Btn label="Add UPI ID" onPress={handleAddUpi} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <TouchableOpacity onPress={() => setShowAddUpi(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, color: colors.accent }}>＋</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent }}>Add UPI ID</Text>
          </TouchableOpacity>
        )}

        <SectionLabel label="Bank Accounts" />
        {bankAccounts.length === 0 && (
          <Card style={{ marginBottom: 10, borderStyle: 'dashed', borderColor: colors.border, borderWidth: 1.5, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>No Bank Accounts added yet.</Text>
          </Card>
        )}
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

        {/* Add Bank Form Inline */}
        {showAddBank ? (
          <Card style={{ marginBottom: 20, borderColor: colors.accent, borderWidth: 1.5 }}>
            <Text style={{ fontSize: 14, fontWeight: '850', color: colors.text, marginBottom: 12 }}>Add New Bank Account</Text>

            <Input
              label="Bank & Account Label"
              placeholder="e.g. SBI Savings, HDFC Current"
              value={newBankLabel}
              onChangeText={setNewBankLabel}
              style={{ marginBottom: 12 }}
            />

            <Input
              label="Account Number"
              placeholder="Enter numeric account number"
              value={newBankNumber}
              onChangeText={setNewBankNumber}
              keyboardType="numeric"
              style={{ marginBottom: 12 }}
            />

            <Input
              label="IFSC Code"
              placeholder="e.g. SBIN0001234"
              value={newBankIfsc}
              onChangeText={setNewBankIfsc}
              style={{ marginBottom: 16 }}
              autoCapitalize="characters"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn label="Cancel" onPress={() => setShowAddBank(false)} variant="ghost" style={{ flex: 1 }} />
              <Btn label="Add Account" onPress={handleAddBank} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <TouchableOpacity onPress={() => setShowAddBank(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, color: colors.accent }}>＋</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent }}>Add Bank Account</Text>
          </TouchableOpacity>
        )}

        <Btn label="Save Changes ✓" onPress={handleSave} loading={saving} style={{ marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
