import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '../types';

const MedicineDetailScreen = ({ route, navigation }: any) => {
  const { medicine }: { medicine: Medicine } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (medicine.prescriptionRequired) {
      Alert.alert(
        'Prescription Required',
        'This medicine requires a valid prescription. Please upload your prescription first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Upload Prescription',
            onPress: () => navigation.navigate('Prescription'),
          },
        ]
      );
    } else {
      Alert.alert('Success', `${quantity} ${medicine.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (medicine.prescriptionRequired) {
      Alert.alert(
        'Prescription Required',
        'This medicine requires a valid prescription. Please upload your prescription first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Upload Prescription',
            onPress: () => navigation.navigate('Prescription'),
          },
        ]
      );
    } else {
      Alert.alert('Buy Now', 'Proceeding to checkout...', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Checkout', { items: [{ medicine, quantity }] }),
        },
      ]);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 99) { // Set a reasonable maximum limit
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getGenericPrice = () => {
    return (medicine.price * 0.7).toFixed(2); // 30% cheaper generic
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Medicine Image */}
        {medicine.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: medicine.image }} style={styles.medicineImage} />
            {medicine.prescriptionRequired && (
              <View style={styles.prescriptionBadge}>
                <Ionicons name="medical" size={16} color="#fff" />
                <Text style={styles.prescriptionText}>Prescription Required</Text>
              </View>
            )}
          </View>
        )}

        {/* Medicine Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.category}>{medicine.category}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{medicine.price ? `₵${medicine.price.toFixed(2)}` : 'Price: N/A'}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{medicine.description}</Text>
        </View>

        {/* Dosage Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosage Information</Text>
          {medicine.custom_dosage_frequencyadult && (
            <Text style={styles.dosageText}>Frequency (Adult): {medicine.custom_dosage_frequencyadult}</Text>
          )}
          {medicine.custom_dosage_frequencychild && (
            <Text style={styles.dosageText}>Frequency (Child): {medicine.custom_dosage_frequencychild}</Text>
          )}
          {medicine.custom_dosage_amountadult && (
            <Text style={styles.dosageText}>Amount (Adult): {medicine.custom_dosage_amountadult}</Text>
          )}
          {medicine.custom_dosage_amountchild && (
            <Text style={styles.dosageText}>Amount (Child): {medicine.custom_dosage_amountchild}</Text>
          )}
          {medicine.custom_dosage_durationadult && (
            <Text style={styles.dosageText}>Duration (Adult): {medicine.custom_dosage_durationadult} day(s)</Text>
          )}
          {medicine.custom_dosage_durationchild && (
            <Text style={styles.dosageText}>Duration (Child): {medicine.custom_dosage_durationchild} day(s)</Text>
          )}
          {medicine.custom_dosage_notes && (
            <Text style={styles.dosageText}>Notes: {medicine.custom_dosage_notes}</Text>
          )}
          {medicine.custom_interval && (
            <Text style={styles.dosageText}>Interval: {medicine.custom_interval}</Text>
          )}
        </View>

        {/* Action Buttons and other info can remain as is, or be simplified if not needed for employees */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  shareButton: {
    padding: 5,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  medicineImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  prescriptionBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  prescriptionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  medicineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  genericName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 15,
  },
  genericPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dosageText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  manufacturer: {
    fontSize: 16,
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  totalContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    gap: 15,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  prescriptionButton: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  additionalInfo: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  chatButton: {
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MedicineDetailScreen; 