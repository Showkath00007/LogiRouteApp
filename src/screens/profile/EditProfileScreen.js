import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { colors } from '../../theme';
import { BackBtn, Input, Btn, SectionLabel } from '../../components';
import { getProfile, saveProfile } from '../../config/UserStore';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', city: '', gst: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    getProfile().then(p => {
      setForm({
        name: p.name || '',
        company: p.company || '',
        phone: p.phone || '',
        email: p.email || '',
        city: p.city || '',
        gst: p.gst || '',
        avatar: p.avatar || ''
      });
      setLoading(false);
    });
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to upload a profile picture.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        set('avatar', result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Missing Field', 'Please enter your name.'); return; }
    setSaving(true);
    await saveProfile({
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      gst: form.gst.trim(),
      avatar: form.avatar
    });
    setSaving(false);
    Alert.alert('✅ Profile Updated!', 'Your changes have been saved successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading profile...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 20 }}>Edit Profile</Text>
        <TouchableOpacity onPress={pickImage} style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24, borderWidth: 3, borderColor: colors.accent + '55' }}>
          {form.avatar ? (
            <Image source={{ uri: form.avatar }} style={{ width: 84, height: 84, borderRadius: 42 }} />
          ) : (
            <Text style={{ fontSize: 38 }}>👤</Text>
          )}
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.accent, borderRadius: 12, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg }}>
            <Text style={{ fontSize: 12 }}>✏️</Text>
          </View>
        </TouchableOpacity>
        <SectionLabel label="Personal Info" />
        <Input placeholder="Full Name" value={form.name} onChangeText={v => set('name', v)} />
        <Input placeholder="Phone Number" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
        <Input placeholder="Email Address" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
        <Input placeholder="City" value={form.city} onChangeText={v => set('city', v)} />
        <SectionLabel label="Company Info" style={{ marginTop: 8 }} />
        <Input placeholder="Company Name" value={form.company} onChangeText={v => set('company', v)} />
        <Input placeholder="GST Number" value={form.gst} onChangeText={v => set('gst', v)} autoCapitalize="characters" />
        <Btn label="Save Changes ✓" onPress={handleSave} loading={saving} style={{ marginTop: 16 }} />
        <Btn label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}