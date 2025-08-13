import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../types';

const OrderTrackingScreen = ({ route, navigation }: any) => {
  const { order }: { order: Order } = route.params;
  const [currentStep, setCurrentStep] = useState(2); // Simulate current step

  const trackingSteps = [
    {
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      icon: 'checkmark-circle',
      color: '#34C759',
    },
    {
      id: 2,
      title: 'Confirmed',
      description: 'Order confirmed and being processed',
      icon: 'checkmark-circle',
      color: '#34C759',
    },
    {
      id: 3,
      title: 'Processing',
      description: 'Medicines are being prepared',
      icon: 'construct',
      color: '#FF9500',
    },
    {
      id: 4,
      title: 'Shipped',
      description: 'Order is on its way to you',
      icon: 'car',
      color: '#007AFF',
    },
    {
      id: 5,
      title: 'Delivered',
      description: 'Order has been delivered',
      icon: 'checkmark-done-circle',
      color: '#34C759',
    },
  ];

  const getCurrentStepIndex = () => {
    switch (order.status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const renderTrackingStep = (step: any, index: number) => {
    const isCompleted = index < getCurrentStepIndex();
    const isCurrent = index === getCurrentStepIndex();
    const isUpcoming = index > getCurrentStepIndex();

    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          <View
            style={[
              styles.stepIcon,
              isCompleted && { backgroundColor: step.color },
              isCurrent && { backgroundColor: step.color },
              isUpcoming && { backgroundColor: '#e0e0e0' },
            ]}
          >
            <Ionicons
              name={step.icon as any}
              size={20}
              color={isUpcoming ? '#999' : '#fff'}
            />
          </View>
          {index < trackingSteps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                isCompleted && { backgroundColor: step.color },
                isUpcoming && { backgroundColor: '#e0e0e0' },
              ]}
            />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text
            style={[
              styles.stepTitle,
              isCompleted && { color: step.color },
              isCurrent && { color: step.color },
              isUpcoming && { color: '#999' },
            ]}
          >
            {step.title}
          </Text>
          <Text
            style={[
              styles.stepDescription,
              isUpcoming && { color: '#ccc' },
            ]}
          >
            {step.description}
          </Text>
        </View>
      </View>
    );
  };

  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const estimated = new Date(order.estimatedDelivery);
    const diffTime = estimated.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours <= 0) {
      return 'Today';
    } else if (diffHours <= 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays} days`;
    }
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
          <Text style={styles.title}>Track Order</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoContainer}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                Ordered on {order.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.detailText}>
                Estimated delivery: {getEstimatedDeliveryTime()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Steps */}
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingTitle}>Order Progress</Text>
          {trackingSteps.map((step, index) => renderTrackingStep(step, index))}
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.medicine.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.medicine.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Reorder', 'Reorder functionality coming soon!')}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Reorder</Text>
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
  orderInfoContainer: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  trackingContainer: {
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
  trackingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 30,
    marginTop: 5,
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  itemsContainer: {
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
  itemsTitle: {
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    paddingBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OrderTrackingScreen; 