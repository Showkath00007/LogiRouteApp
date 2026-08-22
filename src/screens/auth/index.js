import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Btn, Input, Card, BackBtn, Chip, AppLogo } from '../../components';
import { MATERIALS } from '../../data';
import { auth } from '../../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { saveUserProfile } from '../../config/firebaseService';
import { saveProfile, clearProfile } from '../../config/UserStore';

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
      await clearProfile().catch(() => null);
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
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-151900372282fc-91489002c0c7?q=80&w=1200&auto=format&fit=crop' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.65)' }}>
          <ScrollView contentContainerStyle={[screen, { justifyContent: 'center', paddingVertical: 40 }]} keyboardShouldPersistTaps="handled">
            <Card style={{ backgroundColor: 'rgba(21, 27, 44, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1.5, ...shadow.lg, padding: 24 }}>
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <View style={{ marginBottom: 16 }}>
                  <AppLogo size={75} />
                </View>
                <Text style={[h1, { color: colors.white, textAlign: 'center', marginBottom: 6 }]}>Welcome Back 👋</Text>
                <Text style={[subText, { color: colors.sub, marginBottom: 0, textAlign: 'center' }]}>Login to your account</Text>
              </View>

              {/* Company / Driver toggle */}
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: radius.full, padding: 4, marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>🏢 Company</Text>
                </View>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
                  onPress={() => navigation.replace('DriverLogin')}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)' }}>🚛 Driver</Text>
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
                <View style={[s.line, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                <Text style={[s.or, { color: colors.muted }]}>or</Text>
                <View style={[s.line, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
              </View>
              <Btn label="Create New Account" onPress={() => navigation.navigate('Register')} variant="ghost" style={{ borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5 }} />
            </Card>
          </ScrollView>
        </View>
      </ImageBackground>
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
      await clearProfile().catch(() => null);
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
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-151900372282fc-91489002c0c7?q=80&w=1200&auto=format&fit=crop' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.65)' }}>
          <ScrollView contentContainerStyle={[screen, { justifyContent: 'center', paddingVertical: 40 }]} keyboardShouldPersistTaps="handled">
            <Card style={{ backgroundColor: 'rgba(21, 27, 44, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1.5, ...shadow.lg, padding: 24 }}>
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <View style={{ marginBottom: 16 }}>
                  <AppLogo size={75} />
                </View>
                <Text style={[h1, { color: colors.white, textAlign: 'center', marginBottom: 6 }]}>Driver Login 🚛</Text>
                <Text style={[subText, { color: colors.sub, marginBottom: 0, textAlign: 'center' }]}>Access your driver account</Text>
              </View>

              {/* Company / Driver toggle */}
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: radius.full, padding: 4, marginBottom: 24 }}>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
                  onPress={() => navigation.replace('Login')}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)' }}>🏢 Company</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, backgroundColor: colors.green, borderRadius: radius.full, paddingVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.white }}>🚛 Driver</Text>
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
                <View style={[s.line, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                <Text style={[s.or, { color: colors.muted }]}>or</Text>
                <View style={[s.line, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
              </View>
              <Btn label="Register as Driver" onPress={() => navigation.navigate('DriverRegister')} variant="ghost" style={{ borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5 }} />
            </Card>
          </ScrollView>
        </View>
      </ImageBackground>
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
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-151900372282fc-91489002c0c7?q=80&w=1200&auto=format&fit=crop' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.65)' }}>
          <ScrollView contentContainerStyle={[screen, { justifyContent: 'center', paddingVertical: 40 }]} keyboardShouldPersistTaps="handled">
            <Card style={{ backgroundColor: 'rgba(21, 27, 44, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1.5, ...shadow.lg, padding: 24 }}>
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
                  <AppLogo size={46} />
                </View>
                <View>
                  <Text style={[h1, { color: colors.white, marginBottom: 2 }]}>Driver Register 🚛</Text>
                  <Text style={[subText, { color: colors.sub, marginBottom: 0 }]}>Create your driver account</Text>
                </View>
              </View>

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
            </Card>
          </ScrollView>
        </View>
      </ImageBackground>
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
      const lowerName = name.trim().toLowerCase();
      const resolvedCompany = lowerName === 'uri' ? 'Uri Logistics' : '';
      await saveUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        type: 'company',
        verified: false,
        company: resolvedCompany,
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
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-151900372282fc-91489002c0c7?q=80&w=1200&auto=format&fit=crop' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.65)' }}>
          <ScrollView contentContainerStyle={[screen, { justifyContent: 'center', paddingVertical: 40 }]} keyboardShouldPersistTaps="handled">
            <Card style={{ backgroundColor: 'rgba(21, 27, 44, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1.5, ...shadow.lg, padding: 24 }}>
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <BackBtn onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
                  <AppLogo size={46} />
                </View>
                <View>
                  <Text style={[h1, { color: colors.white, marginBottom: 2 }]}>Create Account</Text>
                  <Text style={[subText, { color: colors.sub, marginBottom: 0 }]}>Join LogiRoute today</Text>
                </View>
              </View>

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
            </Card>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export function OTPScreen({ navigation }) {
  const [otp, setOtp] = useState('123456');

  const chars = otp.split('');
  const boxes = Array(6).fill('').map((_, i) => chars[i] || '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[screen, { alignItems: 'center' }]}>
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />
        <Text style={{ fontSize: 56, marginVertical: 20 }}>📱</Text>
        <Text style={h1}>Verify Phone</Text>
        <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 4 }}>OTP sent to your number</Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 24 }}>
          Valid for 5 minutes (Simulated Code: <Text style={{ fontWeight: '800', color: colors.accent }}>123456</Text>)
        </Text>
        <View style={s.otpRow}>
          {boxes.map((v, i) => (
            <View key={i} style={[s.otpBox, v !== '' && s.otpBoxFilled]}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.accent }}>{v}</Text>
            </View>
          ))}
        </View>

        <TextInput
          style={{
            height: 48,
            width: '80%',
            borderColor: colors.border,
            borderWidth: 1.5,
            borderRadius: 8,
            marginTop: 20,
            paddingHorizontal: 12,
            color: colors.text,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
            backgroundColor: colors.surface2
          }}
          placeholder="Type OTP here (or use default 123456)"
          placeholderTextColor={colors.muted}
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          keyboardType="numeric"
        />

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
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [avatarPreset, setAvatarPreset] = useState('🏢');
  const [gstNumber, setGstNumber] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Manufacturing');
  const [selectedMaterials, setSelectedMaterials] = useState(['Steel']);
  const [selectedVehicles, setSelectedVehicles] = useState(['Standard Truck']);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fb = await getUserProfile().catch(() => null);
        const isRealUser = auth?.currentUser && !auth.currentUser.email.startsWith('mock');
        
        if (isRealUser && fb) {
          const derivedCompany = fb.company || (fb.name?.toLowerCase() === 'uri' ? 'Uri Logistics' : (fb.name ? `${fb.name.charAt(0).toUpperCase() + fb.name.slice(1)} Logistics` : ''));
          setCompanyName(derivedCompany);
          setCity(fb.city || '');
          setGstNumber(fb.gst || '');
        } else if (!isRealUser) {
          const u = await getProfile().catch(() => null);
          if (u) {
            const derivedCompany = u.company || (u.name?.toLowerCase() === 'uri' ? 'Uri Logistics' : (u.name ? `${u.name.charAt(0).toUpperCase() + u.name.slice(1)} Logistics` : ''));
            setCompanyName(derivedCompany);
            setCity(u.city || '');
            setGstNumber(u.gst || '');
          }
        }
      } catch (e) {}
    };
    loadProfile();
  }, []);

  const nextStep = () => {
    if (step === 1) {
      if (!companyName.trim() || !city.trim()) {
        Alert.alert('Fields Required', 'Please enter company name and city location.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (gstNumber && gstNumber.length !== 15) {
        Alert.alert('Invalid GSTIN', 'GST number must be exactly 15 characters.');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    try {
      await saveUserProfile({
        companyName: companyName.trim(),
        city: city.trim(),
        avatar: avatarPreset,
        gstin: gstNumber.toUpperCase().trim(),
        category: businessCategory,
        materials: selectedMaterials,
        vehicles: selectedVehicles,
        setupCompleted: true
      });
      Alert.alert('Profile Configured! 🎉', 'Welcome to LogiRoute app.', [
        { text: 'Enter Dashboard', onPress: () => navigation.replace('CompanyDashboard') }
      ]);
    } catch (e) {
      Alert.alert('Error saving profile', e.message);
    }
  };

  const toggleMaterial = (id) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  const toggleVehicle = (id) => {
    if (selectedVehicles.includes(id)) {
      setSelectedVehicles(selectedVehicles.filter(v => v !== id));
    } else {
      setSelectedVehicles([...selectedVehicles, id]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={screen} keyboardShouldPersistTaps="handled">
        {/* Top Back Navigation to return to settings/profile */}
        <BackBtn onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 16 }} />

        {/* Progress Step Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {step > 1 && (
              <TouchableOpacity onPress={prevStep} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 16 }}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '800' }}>STEP {step} OF 3</Text>
          </View>
          {/* Progress dots bar */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ width: 16, height: 6, borderRadius: 3, backgroundColor: step >= i ? colors.accent : colors.border }} />
            ))}
          </View>
        </View>

        {step === 1 && (
          <>
            <Text style={h1}>Company Profile</Text>
            <Text style={subText}>Setup basic details to personalize your account</Text>
            
            <Text style={s.label}>SELECT CORPORATE LOGO</Text>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {['🏢', '🏭', '📦', '🚛'].map(preset => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setAvatarPreset(preset)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: avatarPreset === preset ? colors.accentLight : colors.surface2,
                    borderWidth: 2,
                    borderColor: avatarPreset === preset ? colors.accent : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              placeholder="Company Name (e.g. Acme Steel)"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <Input
              placeholder="City Location (e.g. Pune)"
              value={city}
              onChangeText={setCity}
            />
            
            <Btn label="Continue →" onPress={nextStep} style={{ marginTop: 10 }} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={h1}>Business Compliance</Text>
            <Text style={subText}>Configure tax identification for dispatch invoices</Text>

            <Input
              placeholder="GST Number (Optional, 15-char ID)"
              value={gstNumber}
              onChangeText={setGstNumber}
              maxLength={15}
              autoCapitalize="characters"
            />

            <Text style={s.label}>BUSINESS CATEGORY</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['Manufacturing', 'Trading', 'Logistics', 'Retail'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setBusinessCategory(cat)}
                  style={{
                    backgroundColor: businessCategory === cat ? colors.accentLight : colors.surface2,
                    borderWidth: 1.5,
                    borderColor: businessCategory === cat ? colors.accent : colors.border,
                    borderRadius: radius.md,
                    paddingVertical: 10,
                    paddingHorizontal: 16
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: businessCategory === cat ? '750' : '450', color: businessCategory === cat ? colors.accent : colors.text }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Btn label="Continue →" onPress={nextStep} />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={h1}>Onboarding Preferences</Text>
            <Text style={subText}>Choose your primary transit parameters to finalize account configuration</Text>

            <Text style={s.label}>PREFERRED FREIGHT MATERIALS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MATERIALS.map(m => {
                const isSelected = selectedMaterials.includes(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => toggleMaterial(m.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: isSelected ? m.color + '22' : colors.surface2,
                      borderWidth: 1.5,
                      borderColor: isSelected ? m.color : colors.border,
                      borderRadius: radius.full,
                      paddingVertical: 8,
                      paddingHorizontal: 14
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{m.icon}</Text>
                    <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '400', color: isSelected ? m.color : colors.text }}>
                      {m.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>PREFERRED TRANSIT VEHICLES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['Standard Truck', 'Reefer Truck', 'Container Trailer', 'Mini Tempo'].map(v => {
                const isSelected = selectedVehicles.includes(v);
                return (
                  <TouchableOpacity
                    key={v}
                    onPress={() => toggleVehicle(v)}
                    style={{
                      backgroundColor: isSelected ? colors.accentLight : colors.surface2,
                      borderWidth: 1.5,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderRadius: radius.full,
                      paddingVertical: 8,
                      paddingHorizontal: 14
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '400', color: isSelected ? colors.accent : colors.text }}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Btn label="Save & Setup Account 🎉" onPress={handleFinish} />
          </>
        )}
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