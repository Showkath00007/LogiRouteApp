import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { BackBtn, Card, SectionLabel, Btn, Input, Badge } from '../../components';
import { saveUserProfile, getUserProfile, listenBookings } from '../../config/firebaseService';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

async function sendTwilioSMS(to, body) {
  console.log(`[Twilio Simulation] SMS sent to ${to}: "${body}"`);
  return { sid: 'SM_SIMULATED_SUCCESS_' + Date.now() };
}

export default function PaymentMethodsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [upiAccounts, setUpiAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Form states for manual additions
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiPhone, setNewUpiPhone] = useState('');

  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankLabel, setNewBankLabel] = useState('');
  const [newBankNumber, setNewBankNumber] = useState('');
  // OTP Verification states
  const [verifyingUpiObj, setVerifyingUpiObj] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const uProf = await getUserProfile();
        setProfile(uProf);
        if (uProf?.upiAccounts && Array.isArray(uProf.upiAccounts)) {
          setUpiAccounts(uProf.upiAccounts);
        }
        if (uProf?.bankAccounts && Array.isArray(uProf.bankAccounts)) {
          setBankAccounts(uProf.bankAccounts);
        }
        if (uProf?.selectedUpiId) {
          setSelected(uProf.selectedUpiId);
        }
      } catch (e) {
        console.log('Error loading payment methods:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    if (profile?.type === 'company') {
      const unsub = listenBookings(data => {
        setBookings(data);
      });
      return unsub;
    }
  }, [profile?.type]);

  useEffect(() => {
    if (profile?.type === 'company') {
      const r = ref(db, 'drivers');
      const unsub = onValue(r, snap => {
        if (snap.exists()) {
          setDrivers(Object.values(snap.val()));
        } else {
          setDrivers([]);
        }
      });
      return unsub;
    }
  }, [profile?.type]);

  const handleSave = async () => {
    if (bankAccounts.length === 0) {
      showAlert('Action Required', 'Please add a bank account first.');
      return;
    }
    setSaving(true);
    try {
      await saveUserProfile({
        upiAccounts,
        bankAccounts,
        selectedUpiId: selected
      });
      showAlert('✅ Success', 'Payment methods updated successfully!');
      navigation.goBack();
    } catch (e) {
      showAlert('Error', 'Could not save payment methods. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpi = async () => {
    const formattedUpi = newUpiId.trim();
    const appName = 'BHIM UPI';
    let phone = newUpiPhone.trim();

    if (!formattedUpi) {
      showAlert('Validation Error', 'Please enter a UPI ID.');
      return;
    }
    if (!formattedUpi.includes('@')) {
      showAlert('Invalid UPI ID', 'UPI ID must contain the "@" symbol (e.g. name@okaxis).');
      return;
    }
    if (!phone) {
      showAlert('Validation Error', 'Please enter your UPI-linked mobile number.');
      return;
    }
    
    // Automatically format 10-digit number to E.164 (prepend +91)
    if (!phone.startsWith('+')) {
      if (phone.length === 10) {
        phone = '+91' + phone;
      } else if (phone.length === 11 && phone.startsWith('0')) {
        phone = '+91' + phone.substring(1);
      } else {
        showAlert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    const newObj = {
      id: 'upi_' + Date.now(),
      icon: '📱',
      label: formattedUpi,
      app: appName,
      primary: upiAccounts.length === 0
    };

    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    setSentOtpCode(generatedCode);
    setVerifyingUpiObj(newObj);
    setOtpInput('');

    try {
      setSaving(true);
      await sendTwilioSMS(phone, `Your LogiRoute UPI Verification OTP is: ${generatedCode}. Do not share this with anyone.`);
      setSaving(false);
      setShowOtpModal(true);
      showAlert('🔐 OTP Sent (Simulated)', `A simulated verification code has been dispatched to ${phone}.\n\nYour OTP is: ${generatedCode}`);
    } catch (e) {
      setSaving(false);
      showAlert(
        '🔐 OTP Sent (Simulated Fallback)',
        `A simulated verification code has been dispatched.\n\nYour OTP is: 123456`
      );
      setSentOtpCode('123456');
      setShowOtpModal(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() !== sentOtpCode) {
      showAlert('Verification Failed', 'Invalid OTP code. Please enter the correct OTP code.');
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setShowOtpModal(false);
      
      const newObj = { ...verifyingUpiObj };
      setUpiAccounts(prev => [...prev, newObj]);
      if (upiAccounts.length === 0 || !selected) {
        setSelected(newObj.id);
      }
      
      showAlert('✅ UPI Linked', `UPI ID ${newObj.label} has been verified and successfully linked!`);
      
      setVerifyingUpiObj(null);
      setOtpInput('');
      setNewUpiId('');
      setNewUpiApp('');
      setNewUpiPhone('');
      setShowAddUpi(false);
    }, 1000);
  };

  const handleAddBank = () => {
    const bankLabel = newBankLabel.trim();
    const rawNumber = newBankNumber.trim();
    const ifsc = newBankIfsc.trim().toUpperCase();

    if (!bankLabel || !rawNumber || !ifsc) {
      showAlert('Validation Error', 'Please fill out all bank details.');
      return;
    }
    if (rawNumber.length < 9 || isNaN(rawNumber)) {
      showAlert('Invalid Account Number', 'Bank account number must be at least 9 numeric digits.');
      return;
    }
    if (ifsc.length !== 11) {
      showAlert('Invalid IFSC Code', 'IFSC code must be exactly 11 alphanumeric characters.');
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
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Bank Details</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 20 }}>Manage UPI & bank accounts to receive payouts</Text>

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
              label="Linked Mobile Number"
              placeholder="e.g. +919392859818"
              value={newUpiPhone}
              onChangeText={setNewUpiPhone}
              keyboardType="phone-pad"
              style={{ marginBottom: 12 }}
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

      {/* UPI Verification OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            width: '100%',
            maxWidth: 380,
            padding: 24,
            borderWidth: 1.5,
            borderColor: colors.border,
            ...shadow.lg
          }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 6 }}>🔒 Verify UPI ID</Text>
            <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>
              A 6-digit OTP code has been simulated for your UPI link request. Enter the OTP code to verify ownership.
            </Text>

            <Input
              label={sentOtpCode === '123456' ? "OTP Code (Hint: 123456)" : "OTP Code (Sent to mobile)"}
              placeholder="Enter 6-digit code"
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="numeric"
              maxLength={6}
              style={{ marginBottom: 18 }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn
                label="Cancel"
                onPress={() => {
                  setShowOtpModal(false);
                  setVerifyingUpiObj(null);
                  setOtpInput('');
                }}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <Btn
                label="Verify & Link"
                onPress={handleVerifyOtp}
                loading={verifying}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
