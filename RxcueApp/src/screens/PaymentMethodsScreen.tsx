import React, { useState } from 'react';
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

const PaymentMethodsScreen = ({ navigation }: any) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 1234',
      details: '**** **** **** 1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'upi',
      name: 'UPI ID',
      details: 'john.doe@upi',
      isDefault: false,
    },
    // Example mobile money method
    // {
    //   id: '3',
    //   type: 'mobile_money',
    //   name: 'MTN Mobile Money',
    //   details: '+233501234567',
    //   isDefault: false,
    // },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState('card');
  const [newMethod, setNewMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    name: '',
    provider: '',
    phone: '',
  });

  const handleAddMethod = () => {
    if (selectedType === 'card') {
      if (!newMethod.cardNumber || !newMethod.expiryDate || !newMethod.cvv) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    } else if (selectedType === 'upi') {
      if (!newMethod.upiId) {
        Alert.alert('Error', 'Please enter UPI ID');
        return;
      }
    } else if (selectedType === 'mobile_money') {
      if (!newMethod.provider || !newMethod.phone) {
        Alert.alert('Error', 'Please enter provider and phone number');
        return;
      }
    }

    const method = {
      id: Date.now().toString(),
      type: selectedType,
      name:
        selectedType === 'card'
          ? `${selectedType.toUpperCase()} ending in ${newMethod.cardNumber.slice(-4)}`
          : selectedType === 'upi'
          ? 'UPI ID'
          : selectedType === 'mobile_money'
          ? `${newMethod.provider} Mobile Money`
          : 'Wallet',
      details:
        selectedType === 'card'
          ? `**** **** **** ${newMethod.cardNumber.slice(-4)}`
          : selectedType === 'upi'
          ? newMethod.upiId
          : selectedType === 'mobile_money'
          ? newMethod.phone
          : '',
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewMethod({ cardNumber: '', expiryDate: '', cvv: '', upiId: '', name: '', provider: '', phone: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const handleRemoveMethod = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card';
      case 'upi':
        return 'phone-portrait';
      case 'wallet':
        return 'wallet';
      case 'mobile_money':
        return 'cash-outline';
      default:
        return 'card';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodInfo}>
              <View style={styles.methodHeader}>
                <Ionicons name={getPaymentIcon(method.type) as any} size={24} color="#007AFF" />
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodNumber}>{method.details}</Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <View style={styles.methodActions}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text style={styles.actionText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMethod(method.id)}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {paymentMethods.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="card" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No payment methods added</Text>
            <Text style={styles.emptySubtext}>Add a payment method to make purchases faster</Text>
          </View>
        )}
      </ScrollView>

      {showAddForm && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Payment Type Selection */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'card' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('card')}
              >
                <Text style={selectedType === 'card' ? styles.typeButtonTextSelected : styles.typeButtonText}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'upi' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('upi')}
              >
                <Text style={selectedType === 'upi' ? styles.typeButtonTextSelected : styles.typeButtonText}>UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'mobile_money' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('mobile_money')}
              >
                <Text style={selectedType === 'mobile_money' ? styles.typeButtonTextSelected : styles.typeButtonText}>Mobile Money</Text>
              </TouchableOpacity>
            </View>

            {selectedType === 'card' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  value={newMethod.cardNumber}
                  onChangeText={(text) => setNewMethod({ ...newMethod, cardNumber: text })}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="MM/YY"
                    value={newMethod.expiryDate}
                    onChangeText={(text) => setNewMethod({ ...newMethod, expiryDate: text })}
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="CVV"
                    value={newMethod.cvv}
                    onChangeText={(text) => setNewMethod({ ...newMethod, cvv: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </>
            ) : selectedType === 'upi' ? (
              <TextInput
                style={styles.input}
                placeholder="UPI ID (e.g., john.doe@upi)"
                value={newMethod.upiId}
                onChangeText={(text) => setNewMethod({ ...newMethod, upiId: text })}
              />
            ) : selectedType === 'mobile_money' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Provider (e.g. MTN, Airtel)"
                  value={newMethod.provider}
                  onChangeText={text => setNewMethod({ ...newMethod, provider: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={newMethod.phone}
                  onChangeText={text => setNewMethod({ ...newMethod, phone: text })}
                />
              </>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
              <Text style={styles.addButtonText}>Add Payment Method</Text>
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
  methodCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginRight: 12,
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
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
  paymentTypeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentTypeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  selectedPaymentType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentTypeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  selectedPaymentTypeText: {
    color: '#fff',
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
});

export default PaymentMethodsScreen; 