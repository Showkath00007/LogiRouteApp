import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Btn, Input, Card, BackBtn, Chip } from '../../components';
import { MATERIALS } from '../../data';
import { auth } from '../../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { saveUserProfile } from '../../config/firebaseService';

const screen = { padding: 20, paddingTop: 60, flexGrow: 1 };
const h1 = { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 6 };
const subText = { fontSize: 14, color: colors.sub, marginBottom: 24 };

// S05 — Company Login
export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('CompanyDashboard');
    } catch (err) {
      const code = err.code || '';
      let msg = '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        msg = 'No account found with this email. Please register first.';
      } else if (code === 'auth/wrong-password') {
        msg = 'Wrong password. Please try again.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      } else {
        msg = err.message || 'Login failed. Please try again.';
      }
      setError(msg);
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 32, marginTop: 20 }}>
          <Text style={h1}>Welcome Back 👋</Text>
          <Text style={subText}>Login to your account</Text>
        </View>

        {/* Company / Driver toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.full, padding: 4, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.bg }}>🏢 Company</Text>
          </View>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
            onPress={() => navigation.replace('DriverLogin')}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.sub }}>🚛 Driver</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>EMAIL</Text>
        <Input
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={s.label}>PASSWORD</Text>
        <Input
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 }}>
          <Text style={{ color: colors.accent, fontSize: 13 }}>Forgot Password?</Text>
        </TouchableOpacity>
        {error ? (
          <View style={{ backgroundColor: colors.red + '18', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.red + '44' }}>
            <Text style={{ color: colors.red, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>⚠ {error}</Text>
          </View>
        ) : null}
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 16 }} />
        ) : (
          <Btn label="Login" onPress={handleLogin} />
        )}
        <View style={s.orRow}>
          <View style={s.line} />
          <Text style={s.or}>or</Text>
          <View style={s.line} />
        </View>
        <Btn label="Create New Account" onPress={() => navigation.navigate('Register')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S05B — Driver Login
export function DriverLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDriverLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('DriverDashboard');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        Alert.alert('Account Not Found', 'No driver account found with this email.', [
          { text: 'Register as Driver', onPress: () => navigation.navigate('DriverRegister') },
          { text: 'Try Again', style: 'cancel' },
        ]);
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Wrong Password', 'The password you entered is incorrect.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 32, marginTop: 20 }}>
          <Text style={h1}>Driver Login 🚛</Text>
          <Text style={subText}>Access your driver account</Text>
        </View>

        {/* Company / Driver toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.full, padding: 4, marginBottom: 24 }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
            onPress={() => navigation.replace('Login')}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.sub }}>🏢 Company</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, backgroundColor: colors.green, borderRadius: radius.full, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.bg }}>🚛 Driver</Text>
          </View>
        </View>

        <Text style={s.label}>EMAIL</Text>
        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={s.label}>PASSWORD</Text>
        <Input
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 }}>
          <Text style={{ color: colors.green, fontSize: 13 }}>Forgot Password?</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} style={{ marginVertical: 16 }} />
        ) : (
          <Btn label="Driver Login 🚛" onPress={handleDriverLogin} style={{ backgroundColor: colors.green }} />
        )}
        <View style={s.orRow}>
          <View style={s.line} />
          <Text style={s.or}>or</Text>
          <View style={s.line} />
        </View>
        <Btn label="Register as Driver" onPress={() => navigation.navigate('DriverRegister')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

// S05C — Driver Register
export function DriverRegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !vehicle.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Privacy Policy.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await saveUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        vehicle: vehicle.trim(),
        type: 'driver',
        status: 'pending',
        verified: false,
        registeredAt: Date.now(),
      });
      // Save to drivers/ node for real-time matching
      try {
        const { registerDriver } = require('../config/DriverService');
        await registerDriver({ name: name.trim(), phone: phone.trim(), license: '', vehicle: vehicle.trim(), vehicleType: 'Heavy', experience: '', city: '' }, '');
      } catch (e) {}
      setLoading(false);
      Alert.alert(
        '🎉 Application Submitted!',
        'Your driver application is pending admin approval. You will be notified within 24-48 hours.',
        [{ text: 'OK', onPress: () => navigation.replace('DriverLogin') }]
      );
      return;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Account Exists', 'An account with this email already exists.', [
          { text: 'Login', onPress: () => navigation.navigate('DriverLogin') },
          { text: 'Try Again', style: 'cancel' },
        ]);
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Registration Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Driver Registration 🚛</Text>
        <Text style={subText}>Create your driver account</Text>
        <Input placeholder="Full Name" value={name} onChangeText={setName} />
        <Input placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input placeholder="Vehicle Number (e.g. TN-01-AB-1234)" value={vehicle} onChangeText={setVehicle} autoCapitalize="characters" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <View style={[s.checkbox, agreed && { backgroundColor: colors.green, borderColor: colors.green }]}>
            {agreed && <Text style={{ fontSize: 12, color: colors.bg }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 13, color: colors.sub, flex: 1 }}>
            I agree to <Text style={{ color: colors.green }}>Terms & Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} style={{ marginVertical: 16 }} />
        ) : (
          <Btn label="Create Driver Account →" onPress={handleRegister} style={{ backgroundColor: colors.green }} />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('DriverLogin')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: colors.sub }}>
            Already have an account? <Text style={{ color: colors.green }}>Login →</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// S06 — Company Register
export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Privacy Policy.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await saveUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        type: 'company',
        verified: false,
      });
      navigation.navigate('OTP');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Account Exists', 'An account with this email already exists. Please login instead.', [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
          { text: 'Try Again', style: 'cancel' },
        ]);
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Registration Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>Create Account</Text>
        <Text style={subText}>Join LogiRoute today</Text>
        <Input placeholder="Full Name" value={name} onChangeText={setName} />
        <Input placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <View style={[s.checkbox, agreed && { backgroundColor: colors.accent }]}>
            {agreed && <Text style={{ fontSize: 12, color: colors.bg }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 13, color: colors.sub, flex: 1 }}>
            I agree to <Text style={{ color: colors.accent }}>Terms & Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 16 }} />
        ) : (
          <Btn label="Create Account →" onPress={handleRegister} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// S07 — OTP
export function OTPScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[screen, { alignItems: 'center' }]}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />
        <Text style={{ fontSize: 56, marginVertical: 20 }}>📱</Text>
        <Text style={h1}>Verify Phone</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 4 }}>OTP sent to your number</Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 24 }}>Valid for 5 minutes</Text>
        <View style={s.otpRow}>
          {['', '', '', '', '', ''].map((v, i) => (
            <View key={i} style={[s.otpBox]}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.accent }}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={{ width: '100%', marginTop: 24 }}>
          <Btn label="Verify OTP ✓" onPress={() => navigation.navigate('ProfileSetup')} />
        </View>
        <Text style={{ fontSize: 13, color: colors.sub, marginTop: 12 }}>
          Didn't receive? <Text style={{ color: colors.accent }}>Resend in 00:42</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// S08 — Forgot Password
export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Email Sent!', 'Check your inbox for a password reset link.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Not Found', 'No account found with this email.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[screen, { alignItems: 'center' }]}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />
        <Text style={{ fontSize: 56, marginVertical: 20 }}>🔒</Text>
        <Text style={[h1, { textAlign: 'center' }]}>Forgot Password?</Text>
        <Text style={{ fontSize: 14, color: colors.sub, textAlign: 'center', marginBottom: 28, lineHeight: 22 }}>
          Enter your email and we'll send you a password reset link
        </Text>
        <View style={{ width: '100%' }}>
          <Input placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 16 }} />
          ) : (
            <Btn label="Send Reset Link 📧" onPress={handleReset} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// S09 — Reset Password
export function ResetPasswordScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => navigation.goBack()} />
        <Text style={h1}>New Password</Text>
        <Text style={subText}>Must be at least 6 characters</Text>
        <Input placeholder="New Password" secureTextEntry />
        <Input placeholder="Confirm New Password" secureTextEntry />
        <Btn label="Update Password ✓" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </SafeAreaView>
  );
}

// S10 — Profile Setup
export function ProfileSetupScreen({ navigation }) {
  const [selectedMaterial, setSelectedMaterial] = useState('Steel');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        <Text style={h1}>Setup Profile</Text>
        <Text style={subText}>Complete your account</Text>
        <TouchableOpacity style={s.avatar}>
          <Text style={{ fontSize: 32 }}>📷</Text>
        </TouchableOpacity>
        <Input placeholder="Company Name" />
        <Input placeholder="GST Number" />
        <Input placeholder="City" />
        <Text style={s.label}>PRIMARY MATERIAL</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {MATERIALS.map(m => (
            <Chip key={m.id} label={m.id} icon={m.icon} selected={selectedMaterial === m.id} color={m.color} onPress={() => setSelectedMaterial(m.id)} />
          ))}
        </View>
        <Btn label="Save & Continue →" onPress={() => navigation.replace('CompanyDashboard')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { fontSize: 13, color: colors.muted },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.accentS, alignItems: 'center', justifyContent: 'center' },
  otpRow: { flexDirection: 'row', gap: 10 },
  otpBox: { width: 46, height: 56, backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.border, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  otpBoxFilled: { borderColor: colors.accent, backgroundColor: colors.accentS },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
});