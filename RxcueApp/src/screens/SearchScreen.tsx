import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '../types';
import { cartAPI, apiCall } from '../services/api';

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadMedicines();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiCall('/medicines/categories/list');
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadMedicines = async (category?: string) => {
    try {
      setIsLoading(true);
      console.log('=== LOADING MEDICINES ===');
      console.log('Category requested:', category);
      
      let endpoint = '/medicines/search';
      if (category) {
        endpoint += `?category=${encodeURIComponent(category)}`;
      }
      console.log('API endpoint:', endpoint);
      
      const response = await apiCall(endpoint);
      console.log('Medicine response:', response);
      
      // Map ERPNext fields to frontend Medicine fields
      const items = (
        response.data?.data?.medicines ||
        response.data?.medicines ||
        response.medicines ||
        response.message ||
        []
      ).map((item: any) => {
        console.log('Raw item from response:', item);
        
        const mappedItem = {
          id: item.id || item.name,
          name: item.name,
          description: item.description,
          category: item.category, // Use backend's category field directly
          unit: item.unit || '',
          prescriptionRequired: item.prescriptionRequired, // Use backend's prescriptionRequired field directly
          price: item.price || 0,
          inStock: item.inStock !== false,
          image: item.image || null,
          custom_dosage_frequencyadult: item.custom_dosage_frequencyadult,
          custom_dosage_frequencychild: item.custom_dosage_frequencychild,
          custom_dosage_amountadult: item.custom_dosage_amountadult,
          custom_dosage_amountchild: item.custom_dosage_amountchild,
          custom_dosage_durationadult: item.custom_dosage_durationadult,
          custom_dosage_durationchild: item.custom_dosage_durationchild,
          custom_dosage_notes: item.custom_dosage_notes,
          custom_interval: item.custom_interval,
        };
        console.log('Mapped item:', mappedItem);
        return mappedItem;
      });
      
      console.log('=== SETTING NEW MEDICINES ===');
      console.log('Items loaded for category:', category, items);
      console.log('Items count:', items.length);
      
      // Set medicines and filtered medicines
      setMedicines(items);
      setFilteredMedicines(items);
      console.log('Medicines state updated with', items.length, 'items');
      
      // Extract unique categories from ERPNext items (item_group)
      const uniqueCategories = Array.from(new Set(
        items
          .map((item: any) => item.category)
          .filter((category: any) => category && typeof category === 'string')
      )) as string[];
      setCategories(uniqueCategories);
      console.log('Categories updated:', uniqueCategories);
      
    } catch (error) {
      console.error('Medicine loading error:', error);
      Alert.alert('Error', 'Failed to load medicines from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedicines = (query: string) => {
    try {
      if (!query.trim()) {
        setFilteredMedicines(medicines);
        return;
      }
      
      const filtered = medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        medicine.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } catch (error) {
      console.error('Error filtering medicines:', error);
      setFilteredMedicines(medicines);
    }
  };

  const onChangeText = (text: string) => {
    setSearchQuery(text);
    filterMedicines(text);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    loadMedicines(category === selectedCategory ? undefined : category);
  };

  const handleAddToCart = async (medicine: Medicine) => {
    if (medicine.prescriptionRequired) {
      Alert.alert(
        'Prescription Required',
        `${medicine.name} requires a prescription. What would you like to do?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Upload Prescription',
            onPress: () => handleUploadPrescription(medicine),
          },
          {
            text: 'Request from Doctor',
            onPress: () => handleRequestPrescription(medicine),
          },
          {
            text: 'Contact Pharmacist',
            onPress: () => handleContactPharmacist(medicine),
          },
        ]
      );
      return;
    }

    try {
      const response = await cartAPI.addToCart(medicine.id, 1);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart!');
      } else {
        Alert.alert('Error', 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleUploadPrescription = (medicine: Medicine) => {
    Alert.alert('Upload Prescription', `Upload prescription for ${medicine.name}`);
  };

  const handleRequestPrescription = (medicine: Medicine) => {
    Alert.alert('Request Prescription', `Request prescription for ${medicine.name}`);
  };

  const handleContactPharmacist = (medicine: Medicine) => {
    Alert.alert('Contact Pharmacist', `Contact pharmacist about ${medicine.name}`);
  };

  const handleGeneralUploadPrescription = () => {
    Alert.alert('Upload Prescription', 'Upload your prescription');
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity 
      style={styles.medicineCard}
      onPress={() => navigation.navigate('MedicineDetail', { medicine: item })}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.medicineImage}
        defaultSource={{ uri: 'https://via.placeholder.com/150' }}
      />
      
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.medicineCategory}>{item.category}</Text>
        <Text style={styles.medicinePrice}>₵{item.price.toFixed(2)}</Text>
        
        {item.prescriptionRequired && (
          <View style={styles.prescriptionBadge}>
            <Ionicons name="medical" size={12} color="#fff" />
            <Text style={styles.prescriptionText}>Prescription Required</Text>
          </View>
        )}
      </View>

      <View style={styles.medicineActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Search Medicines</Text>
          <Text style={styles.headerSubtitle}>Find your health products</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => loadMedicines()}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleGeneralUploadPrescription}
          >
            <Ionicons name="medical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        {/* Notice Box */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.noticeText}>
            Prescription required for most medicines. Skin care products are available without prescription.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={onChangeText}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onChangeText('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Medicines List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="medical" size={60} color="#ccc" />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      ) : filteredMedicines.length > 0 ? (
        <FlatList
          data={filteredMedicines}
          renderItem={renderMedicineItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.medicinesList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No medicines found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or browse by category
          </Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    marginHorizontal: 0,
    marginTop: 0,
    padding: 6,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#007AFF',
  },
  noticeText: {
    flex: 1,
    fontSize: 10,
    color: '#007AFF',
    marginLeft: 4,
    lineHeight: 14,
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  categoryButton: {
    width: 60,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  medicinesList: {
    padding: 12,
  },
  separator: {
    height: 6,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  medicineImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
  },
  medicineInfo: {
    flex: 1,
    marginRight: 8,
  },
  medicineName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  medicineCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  prescriptionText: {
    fontSize: 7,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 2,
  },
  medicineActions: {
    alignItems: 'center',
  },
  addToCartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  searchSection: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default SearchScreen; 