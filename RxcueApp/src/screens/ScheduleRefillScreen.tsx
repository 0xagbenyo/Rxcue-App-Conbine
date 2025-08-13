import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ScheduleRefillScreen = ({ navigation }: any) => {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [refillDate, setRefillDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState('3');
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, City, State 12345');
  const [autoRefill, setAutoRefill] = useState(false);

  const medications = [
    {
      id: '1',
      name: 'Lisinopril 10mg',
      dosage: '1 tablet daily',
      remaining: '15 tablets',
      nextRefill: '2024-01-15',
    },
    {
      id: '2',
      name: 'Metformin 500mg',
      dosage: '2 tablets daily',
      remaining: '8 tablets',
      nextRefill: '2024-01-10',
    },
    {
      id: '3',
      name: 'Amlodipine 5mg',
      dosage: '1 tablet daily',
      remaining: '22 tablets',
      nextRefill: '2024-01-20',
    },
    {
      id: '4',
      name: 'Atorvastatin 20mg',
      dosage: '1 tablet daily',
      remaining: '12 tablets',
      nextRefill: '2024-01-12',
    },
  ];

  const toggleMedication = (medicationId: string) => {
    if (selectedMedications.includes(medicationId)) {
      setSelectedMedications(selectedMedications.filter(id => id !== medicationId));
    } else {
      setSelectedMedications([...selectedMedications, medicationId]);
    }
  };

  const handleScheduleRefill = () => {
    if (selectedMedications.length === 0) {
      Alert.alert('Error', 'Please select at least one medication to refill.');
      return;
    }

    if (!refillDate) {
      Alert.alert('Error', 'Please select a refill date.');
      return;
    }

    Alert.alert(
      'Refill Scheduled',
      `Your refill has been scheduled for ${refillDate}. You will receive a reminder ${reminderDays} days before the refill date.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderMedicationItem = (medication: any) => {
    const isSelected = selectedMedications.includes(medication.id);
    
    return (
      <TouchableOpacity
        key={medication.id}
        style={[styles.medicationItem, isSelected && styles.selectedMedication]}
        onPress={() => toggleMedication(medication.id)}
      >
        <View style={styles.medicationHeader}>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationDosage}>{medication.dosage}</Text>
          </View>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
        
        <View style={styles.medicationDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="medical" size={16} color="#666" />
            <Text style={styles.detailText}>Remaining: {medication.remaining}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>Next Refill: {medication.nextRefill}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Refill</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.instructionsText}>
            Select medications you want to refill and schedule the delivery date. We'll send you reminders before your refill is due.
          </Text>
        </View>

        {/* Medications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Medications</Text>
          <Text style={styles.sectionSubtitle}>Choose which medications to refill</Text>
          
          {medications.map(renderMedicationItem)}
        </View>

        {/* Refill Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refill Date</Text>
          <Text style={styles.sectionSubtitle}>When would you like to receive your refill?</Text>
          
          <TouchableOpacity style={styles.dateInput}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateInputText}>
              {refillDate || 'Select refill date'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Enable Reminders</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          {reminderEnabled && (
            <View style={styles.reminderOptions}>
              <Text style={styles.reminderLabel}>Remind me before refill date:</Text>
              <View style={styles.reminderButtons}>
                {['1', '3', '5', '7'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.reminderButton,
                      reminderDays === days && styles.reminderButtonActive,
                    ]}
                    onPress={() => setReminderDays(days)}
                  >
                    <Text style={[
                      styles.reminderButtonText,
                      reminderDays === days && styles.reminderButtonTextActive,
                    ]}>
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Auto Refill */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto Refill</Text>
          <Text style={styles.sectionSubtitle}>Automatically schedule refills when running low</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Enable Auto Refill</Text>
            </View>
            <Switch
              value={autoRefill}
              onValueChange={setAutoRefill}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.sectionSubtitle}>Where should we deliver your refill?</Text>
          
          <View style={styles.addressCard}>
            <View style={styles.addressInfo}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.addressText}>{deliveryAddress}</Text>
            </View>
            <TouchableOpacity style={styles.changeAddressButton}>
              <Text style={styles.changeAddressText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        {selectedMedications.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Refill Summary</Text>
            <Text style={styles.summaryText}>
              {selectedMedications.length} medication(s) selected
            </Text>
            <Text style={styles.summaryText}>
              Refill date: {refillDate || 'Not set'}
            </Text>
            {reminderEnabled && (
              <Text style={styles.summaryText}>
                Reminder: {reminderDays} days before refill
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Schedule Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.scheduleButton,
            selectedMedications.length === 0 && styles.scheduleButtonDisabled,
          ]}
          onPress={handleScheduleRefill}
          disabled={selectedMedications.length === 0}
        >
          <Text style={styles.scheduleButtonText}>Schedule Refill</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  medicationItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedMedication: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  medicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  reminderOptions: {
    marginTop: 16,
  },
  reminderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  reminderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  reminderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reminderButtonText: {
    fontSize: 14,
    color: '#666',
  },
  reminderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  changeAddressButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  changeAddressText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scheduleButtonDisabled: {
    backgroundColor: '#ccc',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ScheduleRefillScreen; 