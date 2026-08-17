import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { OfflineProvider, OfflineBanner } from './src/context/OfflineContext';
import { NotificationProvider } from './src/context/NotificationContext';
import SplashScreen from './src/screens/onboarding/SplashScreen';
import Onboarding1Screen from './src/screens/onboarding/Onboarding1Screen';
import Onboarding2Screen from './src/screens/onboarding/Onboarding2Screen';
import UserTypeScreen from './src/screens/onboarding/UserTypeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import DriverLoginScreen from './src/screens/auth/DriverLoginScreen';
import DriverRegisterScreen from './src/screens/auth/DriverRegisterScreen';
import { DriverProfileSetup } from './src/screens/driver/index';
import { PostJobScreen, MyPostedJobsScreen } from './src/screens/company/index';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import CompanyDashboard from './src/screens/company/CompanyDashboard';
import NewShipmentScreen from './src/screens/company/NewShipmentScreen';
import ShipmentsScreen from './src/screens/company/ShipmentsScreen';
import ShipmentDetailScreen from './src/screens/company/ShipmentDetailScreen';
import AnalyticsScreen from './src/screens/company/AnalyticsScreen';
import FleetScreen from './src/screens/company/FleetScreen';
import InvoiceScreen from './src/screens/company/InvoiceScreen';
import TeamScreen from './src/screens/company/TeamScreen';
import DriverDashboard from './src/screens/driver/DriverDashboard';
import MyTripsScreen from './src/screens/driver/MyTripsScreen';
import TripDetailScreen from './src/screens/driver/TripDetailScreen';
import JobsScreen from './src/screens/driver/JobsScreen';
import EarningsScreen from './src/screens/driver/EarningsScreen';
import VehicleScreen from './src/screens/driver/VehicleScreen';
import OptimizerScreen from './src/screens/route/OptimizerScreen';
import ResultScreen from './src/screens/route/ResultScreen';
import RouteMapScreen from './src/screens/route/RouteMapScreen';
import CompareScreen from './src/screens/route/CompareScreen';
import RouteHistoryScreen from './src/screens/route/RouteHistoryScreen';
import SavedRoutesScreen from './src/screens/route/SavedRoutesScreen';
import CompanyDetailsScreen from './src/screens/profile/CompanyDetailsScreen';
import KYCDocumentsScreen from './src/screens/profile/KYCDocumentsScreen';
import PaymentMethodsScreen from './src/screens/profile/PaymentMethodsScreen';
import BookTransportScreen from './src/screens/booking/BookTransportScreen';
import SelectDriverScreen from './src/screens/booking/SelectDriverScreen';
import BookingSummaryScreen from './src/screens/booking/BookingSummaryScreen';
import PaymentScreen from './src/screens/booking/PaymentScreen';
import ConfirmedScreen from './src/screens/booking/ConfirmedScreen';
import MyBookingsScreen from './src/screens/booking/MyBookingsScreen';
import LiveTrackScreen from './src/screens/tracking/LiveTrackScreen';
import TrackShipmentScreen from './src/screens/tracking/TrackShipmentScreen';
import DeliveryStatusScreen from './src/screens/tracking/DeliveryStatusScreen';
import ETAUpdateScreen from './src/screens/tracking/ETAUpdateScreen';
import WeatherScreen from './src/screens/weather/WeatherScreen';
import RouteWeatherScreen from './src/screens/weather/RouteWeatherScreen';
import RoadAlertsScreen from './src/screens/weather/RoadAlertsScreen';
import HistoryScreen from './src/screens/history/HistoryScreen';
import ReportsScreen from './src/screens/history/ReportsScreen';
import ExportScreen from './src/screens/history/ExportScreen';
import FeedbackScreen from './src/screens/history/FeedbackScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';
import ChatScreen from './src/screens/ChatScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import DriverLocationTracker from './src/components/DriverLocationTracker';

const Stack = createNativeStackNavigator();
const opts = { headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#F0F4FF' } };

export default function App() {
  return (
    <ThemeProvider><LanguageProvider><OfflineProvider><NotificationProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <OfflineBanner />
        <DriverLocationTracker />
        <Stack.Navigator initialRouteName="Splash" screenOptions={opts}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
          <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
          <Stack.Screen name="UserType" component={UserTypeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="CompanyDashboard" component={CompanyDashboard} />
          <Stack.Screen name="NewShipment" component={NewShipmentScreen} />
          <Stack.Screen name="Shipments" component={ShipmentsScreen} />
          <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="Fleet" component={FleetScreen} />
          <Stack.Screen name="Invoice" component={InvoiceScreen} />
          <Stack.Screen name="Team" component={TeamScreen} />
          <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
          <Stack.Screen name="MyTrips" component={MyTripsScreen} />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          <Stack.Screen name="Jobs" component={JobsScreen} />
          <Stack.Screen name="Earnings" component={EarningsScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="Optimizer" component={OptimizerScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="RouteMap" component={RouteMapScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Compare" component={CompareScreen} />
          <Stack.Screen name="RouteHistory" component={RouteHistoryScreen} />
          <Stack.Screen name="SavedRoutes" component={SavedRoutesScreen} />
          <Stack.Screen name="BookTransport" component={BookTransportScreen} />
          <Stack.Screen name="SelectDriver" component={SelectDriverScreen} />
          <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Confirmed" component={ConfirmedScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
          <Stack.Screen name="LiveTrack" component={LiveTrackScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="TrackShipment" component={TrackShipmentScreen} />
          <Stack.Screen name="DeliveryStatus" component={DeliveryStatusScreen} />
          <Stack.Screen name="ETAUpdate" component={ETAUpdateScreen} />
          <Stack.Screen name="Weather" component={WeatherScreen} />
          <Stack.Screen name="RouteWeather" component={RouteWeatherScreen} />
          <Stack.Screen name="RoadAlerts" component={RoadAlertsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="Export" component={ExportScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
          <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
          <Stack.Screen name="DriverProfileSetup" component={DriverProfileSetup} />
          <Stack.Screen name="PostJob" component={PostJobScreen} />
          <Stack.Screen name="MyPostedJobs" component={MyPostedJobsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
          <Stack.Screen name="KYCDocuments" component={KYCDocumentsScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider></OfflineProvider></LanguageProvider></ThemeProvider>
  );
}