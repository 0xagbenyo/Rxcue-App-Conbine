import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PersonalInfoScreen = ({ navigation }: any) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Personal information updated successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Edit Button at Top */}
          <View style={styles.editButtonContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Ionicons name="person" size={16} color="#007AFF" />
              </View>
              <Text style={styles.label}>Full Name</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
              editable={isEditing}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Ionicons name="mail" size={16} color="#007AFF" />
              </View>
              <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={user.email}
              onChangeText={(text) => setUser({ ...user, email: text })}
              editable={isEditing}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Ionicons name="call" size={16} color="#007AFF" />
              </View>
              <Text style={styles.label}>Phone Number</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={user.phone}
              onChangeText={(text) => setUser({ ...user, phone: text })}
              editable={isEditing}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Ionicons name="location" size={16} color="#007AFF" />
              </View>
              <Text style={styles.label}>Address</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, !isEditing && styles.disabledInput]}
              value={user.address}
              onChangeText={(text) => setUser({ ...user, address: text })}
              editable={isEditing}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default PersonalInfoScreen; 