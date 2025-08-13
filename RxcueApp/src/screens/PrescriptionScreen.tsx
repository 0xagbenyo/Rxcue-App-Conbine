import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Medicine } from '../types';
import { apiCall } from '../services/api';
import * as FileSystem from 'expo-file-system';

interface Prescription {
  id: string;
  imageUri: string;
  submittedAt: Date;
  status: string;
  medicines: Medicine[];
  pharmacistNote?: string;
}

const PrescriptionScreen = ({ navigation }: any) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/prescriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(global as any).authToken || ''}`,
        },
      });
      
      if (response.success) {
        console.log('Prescriptions loaded:', response.data);
        // Log image URLs for debugging
        if (response.data && response.data.length > 0) {
          response.data.forEach((prescription, index) => {
            console.log(`Prescription ${index} imageUri:`, prescription.imageUri);
          });
        }
        setPrescriptions(response.data || []);
      } else {
        console.error('Failed to load prescriptions:', response.message);
        Alert.alert('Error', 'Failed to load prescriptions');
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrescription = async (prescriptionId: string) => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`/prescriptions/${prescriptionId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${(global as any).authToken || ''}`,
                },
              });
              
              if (response.success) {
                // Remove the prescription from the local state
                setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
                Alert.alert('Success', 'Prescription deleted successfully');
              } else {
                console.error('Failed to delete prescription:', response.message);
                Alert.alert('Error', 'Failed to delete prescription');
              }
            } catch (error) {
              console.error('Error deleting prescription:', error);
              Alert.alert('Error', 'Failed to delete prescription');
            }
          },
        },
      ]
    );
  };

  const uploadPrescriptionToServer = async (imageUri: string) => {
    try {
      setIsUploading(true);
      
      // Convert image to base64
      console.log('Converting image to base64...');
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const imageBase64 = `data:image/jpeg;base64,${base64}`;
      console.log('Image converted to base64, length:', imageBase64.length);

      const prescriptionData = {
        status: 'Pending Review',
        approved_medicines: [],
        pharmacist_note: 'Prescription uploaded from mobile app',
        image_base64: imageBase64
      };

      console.log('Uploading prescription with base64 image...');
      
      const response = await apiCall('/prescriptions/upload', {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(global as any).authToken || ''}`,
        },
      });
      
      if (response.success) {
        console.log('Prescription uploaded successfully');
        Alert.alert(
          'Success', 
          'Prescription uploaded successfully! Our pharmacists will review it within 24-48 hours.',
          [{ text: 'OK' }]
        );
        loadPrescriptions(); // Refresh the list
      } else {
        console.error('Upload failed:', response.message);
        Alert.alert('Error', response.message || 'Failed to upload prescription');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadPrescription = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.granted === false && mediaLibraryPermission.granted === false) {
        Alert.alert(
          'Permission Required', 
          'Camera and photo library permissions are required to upload prescriptions.',
          [{ text: 'OK' }]
        );
        return;
      }

      setShowActionSheet(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload prescription. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPrescriptionToServer(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPrescriptionToServer(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending review':
      case 'pending':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending review':
      case 'pending':
        return 'Pending Review';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending review':
      case 'pending':
        return 'time-outline';
      default:
        return 'document-text-outline';
    }
  };

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <View style={styles.prescriptionCard}>
      {/* Header with Date and Status */}
      <View style={styles.prescriptionHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={18} color="#00CEC9" />
          <Text style={styles.prescriptionDate}>
            {new Date(item.submittedAt).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={12} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Prescription Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.prescriptionImage}
          defaultSource={{ uri: 'https://via.placeholder.com/300x400/FF9500/FFFFFF?text=Prescription+Image' }}
          onError={(error) => {
            console.log('Image loading error:', error.nativeEvent);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', item.imageUri);
          }}
        />
        <View style={styles.imageOverlay}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
        </View>
      </View>

      {/* Pharmacist Note */}
      {item.pharmacistNote && (
        <View style={styles.noteContainer}>
          <View style={styles.noteHeader}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#00CEC9" />
            <Text style={styles.noteLabel}>Pharmacist Note</Text>
          </View>
          <Text style={styles.noteText}>{item.pharmacistNote}</Text>
        </View>
      )}

      {/* Approved Medicines */}
      {item.medicines.length > 0 && (
        <View style={styles.medicinesContainer}>
          <View style={styles.medicinesHeader}>
            <Ionicons name="medical-outline" size={18} color="#00CEC9" />
            <Text style={styles.medicinesTitle}>Approved Medicines</Text>
            <Text style={styles.medicinesCount}>({item.medicines.length})</Text>
          </View>
          {item.medicines.map((medicine, index) => (
            <View key={medicine.id} style={styles.medicineItem}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineGeneric}>{medicine.genericName}</Text>
              </View>
              <View style={styles.medicinePriceContainer}>
                <Text style={styles.medicinePrice}>₵{medicine.price.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pending Status Message */}
      {(item.status === 'pending' || item.status === 'Pending Review') && (
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIconContainer}>
            <Ionicons name="time-outline" size={20} color="#FF9800" />
          </View>
          <View style={styles.pendingContent}>
            <Text style={styles.pendingTitle}>Under Review</Text>
            <Text style={styles.pendingText}>
              Your prescription is being reviewed by our pharmacists. This usually takes 24-48 hours.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deletePrescription(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Approved Status Message */}
      {item.status === 'approved' && (
        <View style={styles.approvedContainer}>
          <View style={styles.approvedIconContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <View style={styles.approvedContent}>
            <Text style={styles.approvedTitle}>Approved</Text>
            <Text style={styles.approvedText}>
              Your prescription has been approved. You can now purchase the medicines.
            </Text>
          </View>
        </View>
      )}

      {/* Rejected Status Message */}
      {item.status === 'rejected' && (
        <View style={styles.rejectedContainer}>
          <View style={styles.rejectedIconContainer}>
            <Ionicons name="close-circle" size={20} color="#F44336" />
          </View>
          <View style={styles.rejectedContent}>
            <Text style={styles.rejectedTitle}>Rejected</Text>
            <Text style={styles.rejectedText}>
              Your prescription was not approved. Please check the pharmacist note for details.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

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
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <Text style={styles.headerSubtitle}>Manage your prescription uploads</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleUploadPrescription}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="add-circle" size={24} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00CEC9" />
          <Text style={styles.loadingText}>Loading your prescriptions...</Text>
        </View>
      ) : prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="document-text-outline" size={80} color="#00CEC9" />
          </View>
          <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
          <Text style={styles.emptyText}>
            Upload your prescription to get started. Our pharmacists will review it and approve your medicines.
          </Text>
          <TouchableOpacity 
            style={[styles.uploadNewButton, isUploading && styles.uploadNewButtonDisabled]} 
            onPress={handleUploadPrescription}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.uploadNewText}>Upload Prescription</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescription}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Upload Action Sheet */}
      {showActionSheet && (
        <View style={styles.actionSheetOverlay}>
          <TouchableOpacity 
            style={styles.actionSheetBackground}
            onPress={() => setShowActionSheet(false)}
          />
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHeader}>
              <Text style={styles.actionSheetTitle}>Upload Prescription</Text>
              <TouchableOpacity onPress={() => setShowActionSheet(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.actionSheetItem}
              onPress={() => {
                setShowActionSheet(false);
                takePhoto();
              }}
            >
              <Ionicons name="camera" size={24} color="#00CEC9" />
              <Text style={styles.actionSheetItemText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionSheetItem}
              onPress={() => {
                setShowActionSheet(false);
                pickImage();
              }}
            >
              <Ionicons name="images" size={24} color="#00CEC9" />
              <Text style={styles.actionSheetItemText}>Choose from Gallery</Text>
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
  headerButton: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 206, 201, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  uploadNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00CEC9',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#00CEC9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadNewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  uploadNewButtonDisabled: {
    opacity: 0.6,
  },
  listContainer: {
    padding: 20,
  },
  separator: {
    height: 15,
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIcon: {
    marginRight: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  prescriptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  noteContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00CEC9',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00CEC9',
    marginLeft: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicinesContainer: {
    marginTop: 8,
  },
  medicinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicinesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  medicinesCount: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 6,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  medicineGeneric: {
    fontSize: 12,
    color: '#666',
  },
  medicinePriceContainer: {
    alignItems: 'flex-end',
  },
  medicinePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00CEC9',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  pendingIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  pendingText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 4,
  },
  approvedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  approvedIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  approvedContent: {
    flex: 1,
  },
  approvedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  approvedText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
  rejectedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  rejectedIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  rejectedContent: {
    flex: 1,
  },
  rejectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  rejectedText: {
    fontSize: 13,
    color: '#D32F2F',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  actionSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionSheetBackground: {
    flex: 1,
  },
  actionSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionSheetItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default PrescriptionScreen; 