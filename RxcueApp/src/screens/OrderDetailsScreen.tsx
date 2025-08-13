import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../services/api';

interface OrderDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
  custom_dosage_frequencyadult?: string;
  custom_dosage_frequencychild?: string;
  custom_dosage_amountadult?: string;
  custom_dosage_amountchild?: string;
  custom_dosage_durationadult?: string;
  custom_dosage_durationchild?: string;
  custom_dosage_notes?: string;
}

interface OrderDetails {
  id: string;
  orderDate: string;
  dueDate?: string;
  total: number;
  paidAmount: number;
  status: string;
  customer: string;
  items: OrderItem[];
}

const OrderDetailsScreen = ({ navigation, route }: OrderDetailsScreenProps) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getOrderDetails(orderId);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        Alert.alert('Error', 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'draft':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      case 'overdue':
        return '#F44336';
      case 'unpaid':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>Order #{order.id}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={loadOrderDetails}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Details Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>#{order.id}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Date</Text>
              <Text style={styles.summaryValue}>{formatDate(order.orderDate)}</Text>
            </View>
            {order.dueDate && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Due Date</Text>
                <Text style={styles.summaryValue}>{formatDate(order.dueDate)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemRate}>₵{item.rate.toFixed(2)} each</Text>
                  <Text style={styles.itemAmount}>₵{item.amount.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₵{order.total.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Paid Amount</Text>
              <Text style={styles.totalValue}>₵{order.paidAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>₵{order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Dosage and Reminders Button */}
        {order.status === 'Paid' && order.items.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dosageButton}
              onPress={() => navigation.navigate('DosageReminder', {
                items: order.items,
                orderId: order.id
              })}
            >
              <Ionicons name="medical-outline" size={24} color="#fff" />
              <Text style={styles.dosageButtonText}>View Dosage & Set Reminders</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemRate: {
    fontSize: 8,
    color: '#666',
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 1,
  },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 6,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  dosageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dosageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default OrderDetailsScreen; 