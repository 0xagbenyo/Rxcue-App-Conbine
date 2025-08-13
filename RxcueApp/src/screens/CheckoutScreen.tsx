import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';

const CheckoutScreen = ({ route, navigation }: any) => {
  const { items }: { items: CartItem[] } = route.params;
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, City, State 12345');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.medicine.price * item.quantity);
    }, 0);
  };

  const getDeliveryFee = () => {
    const subtotal = getSubtotal();
    return subtotal > 50 ? 0 : 5.99;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  const handlePlaceOrder = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Order Placed Successfully!',
        'Your order has been placed and will be delivered soon.',
        [
          {
            text: 'Track Order',
            onPress: () => {
              // Navigate to order tracking with mock order
              const mockOrder = {
                id: Date.now().toString(),
                items: items,
                totalAmount: getTotal(),
                status: 'processing',
                deliveryAddress: deliveryAddress,
                estimatedDelivery: new Date(Date.now() + 86400000),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              navigation.replace('OrderTracking', { order: mockOrder });
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit/Debit Card',
      icon: 'card',
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'upi',
      title: 'UPI',
      icon: 'phone-portrait',
      description: 'Google Pay, PhonePe, Paytm',
    },
    {
      id: 'mobile_money',
      title: 'Mobile Money',
      icon: 'cash-outline',
      description: 'MTN, Airtel, Vodafone Cash',
    },
    {
      id: 'cod',
      title: 'Cash on Delivery',
      icon: 'cash',
      description: 'Pay when you receive your order',
    },
  ];

  const renderOrderItem = (item: CartItem) => (
    <View key={item.medicine.id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.medicine.name}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.medicine.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        paymentMethod === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodLeft}>
        <View style={styles.paymentIcon}>
          <Ionicons name={method.icon as any} size={20} color="#007AFF" />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>{method.title}</Text>
          <Text style={styles.paymentDescription}>{method.description}</Text>
        </View>
      </View>
      <Ionicons
        name={paymentMethod === method.id ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={paymentMethod === method.id ? '#007AFF' : '#ccc'}
      />
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(renderOrderItem)}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter delivery address"
              multiline
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
            <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isProcessing}
          >
            <Text style={styles.placeOrderText}>
              {isProcessing ? 'Processing Order...' : `Place Order - $${getTotal().toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPaymentMethod: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen; 