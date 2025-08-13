import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { medicalHistoryAPI } from '../services/api';
import { MedicalHistory } from '../types';

const MedicalHistoryScreen = ({ navigation }: any) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch medical history from ERPNext on component mount
  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await medicalHistoryAPI.getMedicalHistory();
      
      // Transform ERPNext data to match our local format
      const transformedHistory: MedicalHistory[] = response.data.map((item: any, index: number) => ({
        id: index.toString(),
        medical_condition: item.medical_condition || '',
        diagnosed_date: item.diagnosed_date || '',
        status: item.status || 'Active',
        notes: item.notes || '',
      }));

      setMedicalHistory(transformedHistory);
      setError('');
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState<Omit<MedicalHistory, 'id'>>({
    medical_condition: '',
    diagnosed_date: '',
    status: 'Active',
    notes: '',
  });

  const handleAddCondition = async () => {
    if (!newCondition.medical_condition || !newCondition.diagnosed_date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await medicalHistoryAPI.addMedicalCondition(
        newCondition.medical_condition,
        newCondition.diagnosed_date,
        newCondition.status,
        newCondition.notes
      );

      // Refresh the medical history from ERPNext
      await fetchMedicalHistory();
      
      setNewCondition({ medical_condition: '', diagnosed_date: '', status: 'Active', notes: '' });
      setShowAddForm(false);
      Alert.alert('Success', 'Medical condition added successfully!');
    } catch (error) {
      console.error('Error adding medical condition:', error);
      Alert.alert('Error', 'Failed to add medical condition. Please try again.');
    }
  };

  const handleRemoveCondition = async (id: string) => {
    Alert.alert(
      'Remove Condition',
      'Are you sure you want to remove this medical condition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const index = parseInt(id);
              await medicalHistoryAPI.removeMedicalCondition(index);
              
              // Refresh the medical history from ERPNext
              await fetchMedicalHistory();
              
              Alert.alert('Success', 'Medical condition removed successfully!');
            } catch (error) {
              console.error('Error removing medical condition:', error);
              Alert.alert('Error', 'Failed to remove medical condition. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#FF9500';
      case 'Resolved':
        return '#34C759';
      case 'Chronic':
        return '#007AFF';
      default:
        return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading medical history...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMedicalHistory}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && medicalHistory.map((condition) => (
          <View key={condition.id} style={styles.conditionCard}>
            <View style={styles.conditionHeader}>
              <View style={styles.conditionInfo}>
                <Text style={styles.conditionName}>{condition.medical_condition}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(condition.status) }]}>
                  <Text style={styles.statusText}>{condition.status}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveCondition(condition.id)}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <Text style={styles.diagnosedDate}>Diagnosed: {condition.diagnosed_date}</Text>

            {condition.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notes:</Text>
                <Text style={styles.notes}>{condition.notes}</Text>
              </View>
            )}
          </View>
        ))}

        {!loading && !error && medicalHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No medical conditions recorded</Text>
            <Text style={styles.emptySubtext}>Add your medical conditions to help pharmacists provide better care</Text>
          </View>
        )}
      </ScrollView>

      {showAddForm && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medical Condition</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Medical Condition"
              value={newCondition.medical_condition}
              onChangeText={(text) => setNewCondition({ ...newCondition, medical_condition: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Diagnosed Date (YYYY-MM-DD)"
              value={newCondition.diagnosed_date}
              onChangeText={(text) => setNewCondition({ ...newCondition, diagnosed_date: text })}
            />

            <View style={styles.statusContainer}>
              <Text style={styles.label}>Status:</Text>
              <View style={styles.statusOptions}>
                {['Active', 'Resolved', 'Chronic'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      newCondition.status === status && styles.selectedStatus,
                    ]}
                    onPress={() => setNewCondition({ ...newCondition, status })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      newCondition.status === status && styles.selectedStatusText,
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes (Optional)"
              value={newCondition.notes}
              onChangeText={(text) => setNewCondition({ ...newCondition, notes: text })}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddCondition}>
              <Text style={styles.addButtonText}>Add Condition</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
  conditionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conditionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  diagnosedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  medicationsSection: {
    marginBottom: 12,
  },
  notesSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medication: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statusContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  selectedStatus: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStatusText: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MedicalHistoryScreen; 