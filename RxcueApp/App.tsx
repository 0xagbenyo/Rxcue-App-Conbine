import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { storage } from './src/services/api';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import ChatScreen from './src/screens/ChatScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MedicineDetailScreen from './src/screens/MedicineDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import FamilyMembersScreen from './src/screens/FamilyMembersScreen';
import MedicalHistoryScreen from './src/screens/MedicalHistoryScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import DeliveryAddressesScreen from './src/screens/DeliveryAddressesScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import ScheduleRefillScreen from './src/screens/ScheduleRefillScreen';
import TVScreen from './src/screens/TVScreen';
import AIScreen from './src/screens/AIScreen';
import PrescriptionScreen from './src/screens/PrescriptionScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import DosageReminderScreen from './src/screens/DosageReminderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// TVScreen and AIScreen are imported from their respective files

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'TV') {
            iconName = focused ? 'tv' : 'tv-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="TV" component={TVScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Simple TestScreen for post-login navigation
const TestScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Test Screen</Text>
    <Text style={styles.subtitle}>You have successfully logged in!</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('Main')}
    >
      <Text style={styles.buttonText}>Go to Main App</Text>
    </TouchableOpacity>
  </View>
);

export default function App() {
  // Check for valid session on app start and clear notifications if no valid session
  useEffect(() => {
    const checkSessionAndClearNotifications = async () => {
      try {
        const token = storage.getToken();
        const userData = storage.getUserData();
        
        // If no valid session, clear any existing notifications
        if (!token || !userData) {
          const notificationService = require('./src/services/notificationService').default;
          await notificationService.cancelAllReminders();
          console.log('Cleared notifications on app start - no valid session');
        }
      } catch (error) {
        console.error('Error checking session and clearing notifications:', error);
      }
    };

    checkSessionAndClearNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Test" 
            component={TestScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MedicineDetail" 
            component={MedicineDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Checkout" 
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="OrderTracking" 
            component={OrderTrackingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PersonalInfo" 
            component={PersonalInfoScreen}
            options={{ title: 'Personal Information' }}
          />
          <Stack.Screen 
            name="FamilyMembers" 
            component={FamilyMembersScreen}
            options={{ title: 'Family Members' }}
          />
          <Stack.Screen 
            name="MedicalHistory" 
            component={MedicalHistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
            options={{ title: 'Payment Methods' }}
          />
          <Stack.Screen 
            name="DeliveryAddresses" 
            component={DeliveryAddressesScreen}
            options={{ title: 'Delivery Addresses' }}
          />
          <Stack.Screen 
            name="HelpSupport" 
            component={HelpSupportScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ScheduleRefill" 
            component={ScheduleRefillScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Prescription" 
            component={PrescriptionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Orders" 
            component={OrdersScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="OrderDetails" 
            component={OrderDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DosageReminder" 
            component={DosageReminderScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
