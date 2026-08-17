import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Onboarding
import SplashScreen from '../screens/onboarding/SplashScreen';
import Onboarding1Screen from '../screens/onboarding/Onboarding1Screen';
import Onboarding2Screen from '../screens/onboarding/Onboarding2Screen';
import UserTypeScreen from '../screens/onboarding/UserTypeScreen';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Company
import CompanyDashboard from '../screens/company/CompanyDashboard';
import NewShipmentScreen from '../screens/company/NewShipmentScreen';
import ShipmentsScreen from '../screens/company/ShipmentsScreen';
import ShipmentDetailScreen from '../screens/company/ShipmentDetailScreen';
import AnalyticsScreen from '../screens/company/AnalyticsScreen';
import FleetScreen from '../screens/company/FleetScreen';
import InvoiceScreen from '../screens/company/InvoiceScreen';
import TeamScreen from '../screens/company/TeamScreen';

// Driver
import DriverDashboard from '../screens/driver/DriverDashboard';
import MyTripsScreen from '../screens/driver/MyTripsScreen';
import TripDetailScreen from '../screens/driver/TripDetailScreen';
import JobsScreen from '../screens/driver/JobsScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import VehicleScreen from '../screens/driver/VehicleScreen';

// Route
import OptimizerScreen from '../screens/route/OptimizerScreen';
import ResultScreen from '../screens/route/ResultScreen';
import RouteMapScreen from '../screens/route/RouteMapScreen';
import CompareScreen from '../screens/route/CompareScreen';
import RouteHistoryScreen from '../screens/route/RouteHistoryScreen';
import SavedRoutesScreen from '../screens/route/SavedRoutesScreen';

// Booking
import BookTransportScreen from '../screens/booking/BookTransportScreen';
import SelectDriverScreen from '../screens/booking/SelectDriverScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import ConfirmedScreen from '../screens/booking/ConfirmedScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';

// Tracking
import LiveTrackScreen from '../screens/tracking/LiveTrackScreen';
import TrackShipmentScreen from '../screens/tracking/TrackShipmentScreen';
import DeliveryStatusScreen from '../screens/tracking/DeliveryStatusScreen';
import ETAUpdateScreen from '../screens/tracking/ETAUpdateScreen';

// Weather
import WeatherScreen from '../screens/weather/WeatherScreen';
import RouteWeatherScreen from '../screens/weather/RouteWeatherScreen';
import RoadAlertsScreen from '../screens/weather/RoadAlertsScreen';

// History
import HistoryScreen from '../screens/history/HistoryScreen';
import ReportsScreen from '../screens/history/ReportsScreen';
import ExportScreen from '../screens/history/ExportScreen';
import FeedbackScreen from '../screens/history/FeedbackScreen';

// Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#0A0C12' } }}
      >
        {/* Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

        {/* Company */}
        <Stack.Screen name="CompanyDashboard" component={CompanyDashboard} />
        <Stack.Screen name="NewShipment" component={NewShipmentScreen} />
        <Stack.Screen name="Shipments" component={ShipmentsScreen} />
        <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Fleet" component={FleetScreen} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="Team" component={TeamScreen} />

        {/* Driver */}
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
        <Stack.Screen name="MyTrips" component={MyTripsScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Jobs" component={JobsScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="Vehicle" component={VehicleScreen} />

        {/* Route */}
        <Stack.Screen name="Optimizer" component={OptimizerScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="RouteMap" component={RouteMapScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Compare" component={CompareScreen} />
        <Stack.Screen name="RouteHistory" component={RouteHistoryScreen} />
        <Stack.Screen name="SavedRoutes" component={SavedRoutesScreen} />

        {/* Booking */}
        <Stack.Screen name="BookTransport" component={BookTransportScreen} />
        <Stack.Screen name="SelectDriver" component={SelectDriverScreen} />
        <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Confirmed" component={ConfirmedScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />

        {/* Tracking */}
        <Stack.Screen name="LiveTrack" component={LiveTrackScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="TrackShipment" component={TrackShipmentScreen} />
        <Stack.Screen name="DeliveryStatus" component={DeliveryStatusScreen} />
        <Stack.Screen name="ETAUpdate" component={ETAUpdateScreen} />

        {/* Weather */}
        <Stack.Screen name="Weather" component={WeatherScreen} />
        <Stack.Screen name="RouteWeather" component={RouteWeatherScreen} />
        <Stack.Screen name="RoadAlerts" component={RoadAlertsScreen} />

        {/* History */}
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Export" component={ExportScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />

        {/* Profile */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
