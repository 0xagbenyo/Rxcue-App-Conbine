import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../services/api';
import notificationService from '../services/notificationService';

const ProfileScreen = ({ navigation }: any) => {
  const [userData, setUserData] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Get stored user data
    const data = storage.getUserData();
    setUserData(data);

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel all scheduled notifications/reminders
              await notificationService.cancelAllReminders();
              console.log('All reminders cancelled on logout');
            } catch (error) {
              console.error('Error cancelling reminders on logout:', error);
            }
            
            // Clear user data and tokens (now includes notification cleanup)
            await storage.clearAll();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
                 <TouchableOpacity 
           style={styles.backButton}
           onPress={() => navigation.goBack()}
         >
           <Ionicons name="chevron-back" size={24} color="#000" />
         </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userData ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={36} color="#007AFF" />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email || 'No email provided'}</Text>
                <Text style={styles.userPhone}>{userData.phone}</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('PersonalInfo')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="create" size={20} color="#007AFF" />
                </View>
                <Text style={styles.quickActionText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('MedicalHistory')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="medical" size={20} color="#007AFF" />
                </View>
                <Text style={styles.quickActionText}>Medical History</Text>
              </TouchableOpacity>
            </View>

            {/* Account Details - Commented out as it might not be essential */}
            {/* 
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Details</Text>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="id-card" size={18} color="#007AFF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>User ID</Text>
                  <Text style={styles.detailValue}>{userData.id}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="shield-checkmark" size={18} color="#007AFF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>{userData.role}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="business" size={18} color="#007AFF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>ERPNext Customer ID</Text>
                  <Text style={styles.detailValue}>
                    {userData.erpnextCustomerId || 'Not available'}
                  </Text>
                </View>
              </View>
            </View>
            */}

            {/* Menu Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings & Support</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => Alert.alert('Settings', 'Settings screen coming soon!')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="settings" size={20} color="#007AFF" />
                  </View>
                  <Text style={styles.menuText}>Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => Alert.alert('Help & Support', 'Help & Support screen coming soon!')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="help-circle" size={20} color="#007AFF" />
                  </View>
                  <Text style={styles.menuText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="person" size={48} color="#ccc" />
            </View>
            <Text style={styles.errorText}>No user data available</Text>
            <Text style={styles.errorSubtext}>Please sign in again</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#00CEC9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#333',
    marginTop: 2,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 140, // Increased bottom padding to move logout button further up
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e3f2fd',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 40, // Increased bottom margin for better spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 8,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 15,
    color: '#666',
  },
});

export default ProfileScreen; 