import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { paymentAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

interface PaymentScreenProps {
  navigation: any;
  route: {
    params: {
      amount: number;
      orderId: string;
      onPaymentSuccess: (orderId: string) => void;
    };
  };
}

const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
  const { amount, orderId, onPaymentSuccess } = route.params;
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'phone' | 'otp' | 'processing'>('phone');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Get user's phone number if available
    const userData = (global as any).userData;
    if (userData?.phone) {
      setPhoneNumber(userData.phone);
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid MTN phone number');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Initiating MTN payment:', { amount, phoneNumber, orderId });
      
      const response = await paymentAPI.initiateMTNPayment(amount, phoneNumber, orderId);
      
      if (response.success) {
        setTransactionId(response.data.transactionId);
        setPaymentStep('otp');
        Alert.alert(
          'Payment Initiated',
          'Please check your phone for the payment prompt. Enter the OTP when prompted.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment Error', response.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP from your phone');
      return;
    }

    setIsLoading(true);
    setPaymentStep('processing');
    
    try {
      console.log('Verifying MTN payment:', { transactionId, otp });
      
      const response = await paymentAPI.verifyMTNPayment(transactionId, otp);
      
      if (response.success) {
        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully. Your order has been placed.',
          [
            {
              text: 'View Orders',
              onPress: () => {
                onPaymentSuccess(response.data.orderId);
                navigation.navigate('Orders');
              },
            },
            {
              text: 'Continue Shopping',
              onPress: () => {
                onPaymentSuccess(response.data.orderId);
                navigation.navigate('Search');
              },
            },
          ]
        );
      } else {
        setPaymentStep('otp');
        Alert.alert('Payment Failed', response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStep('otp');
      Alert.alert('Error', 'Failed to verify payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!transactionId) return;
    
    setIsLoading(true);
    try {
      const response = await paymentAPI.checkMTNPaymentStatus(transactionId);
      
      if (response.success && response.data.status === 'SUCCESSFUL') {
        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully.',
          [
            {
              text: 'View Orders',
              onPress: () => {
                onPaymentSuccess(orderId);
                navigation.navigate('Orders');
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Status', response.data.message || 'Payment is still being processed');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      Alert.alert('Error', 'Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as Ghanaian phone number
    if (cleaned.startsWith('233')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '233' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return '233' + cleaned;
    }
    
    return cleaned;
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'phone', title: 'Phone', icon: 'phone-portrait', active: paymentStep === 'phone' },
      { key: 'otp', title: 'OTP', icon: 'key', active: paymentStep === 'otp' || paymentStep === 'processing' },
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View style={[styles.stepCircle, step.active && styles.stepCircleActive]}>
              <Ionicons 
                name={step.icon as any} 
                size={16} 
                color={step.active ? '#fff' : '#ccc'} 
              />
            </View>
            <Text style={[styles.stepText, step.active && styles.stepTextActive]}>
              {step.title}
            </Text>
            {index < steps.length - 1 && (
              <View style={[styles.stepLine, step.active && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      
      {/* Modern Header */}
      <View style={styles.header}>
                 <TouchableOpacity 
           style={styles.backButton}
           onPress={() => navigation.goBack()}
         >
           <Ionicons name="chevron-back" size={24} color="#000" />
         </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <Text style={styles.headerSubtitle}>MTN Mobile Money</Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Payment Amount Card */}
          <View style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <View style={styles.amountIcon}>
                <Ionicons name="wallet" size={28} color="#fff" />
              </View>
              <Text style={styles.amountLabel}>Total Amount</Text>
            </View>
            <Text style={styles.amountValue}>₵{amount.toFixed(2)}</Text>
            <Text style={styles.amountCurrency}>Ghanaian Cedi</Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Payment Steps */}
          {paymentStep === 'phone' && (
            <View style={styles.stepCard}>
              <View style={styles.stepCardHeader}>
                <View style={styles.stepCardIcon}>
                  <Ionicons name="phone-portrait" size={24} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.stepCardTitle}>Enter Phone Number</Text>
                  <Text style={styles.stepCardSubtitle}>Step 1 of 2</Text>
                </View>
              </View>
              
              <Text style={styles.stepCardDescription}>
                Enter your MTN mobile money phone number to receive the payment prompt
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MTN Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#6366f1" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                    placeholder="e.g., 0241234567"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleInitiatePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Initiate Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {paymentStep === 'otp' && (
            <View style={styles.stepCard}>
              <View style={styles.stepCardHeader}>
                <View style={styles.stepCardIcon}>
                  <Ionicons name="key" size={24} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.stepCardTitle}>Enter OTP</Text>
                  <Text style={styles.stepCardSubtitle}>Step 2 of 2</Text>
                </View>
              </View>
              
              <Text style={styles.stepCardDescription}>
                Enter the 6-digit OTP sent to your phone to complete the payment
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OTP Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Verify Payment</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCheckPaymentStatus}
              >
                <Ionicons name="refresh" size={16} color="#6366f1" />
                <Text style={styles.secondaryButtonText}>Check Payment Status</Text>
              </TouchableOpacity>
            </View>
          )}

          {paymentStep === 'processing' && (
            <View style={styles.stepCard}>
              <View style={styles.stepCardHeader}>
                <View style={styles.stepCardIcon}>
                  <Ionicons name="time" size={24} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.stepCardTitle}>Processing Payment</Text>
                  <Text style={styles.stepCardSubtitle}>Please wait...</Text>
                </View>
              </View>
              
              <Text style={styles.stepCardDescription}>
                Please wait while we verify your payment with MTN Mobile Money
              </Text>

              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
                <Text style={styles.loaderText}>Verifying payment...</Text>
              </View>
            </View>
          )}

          {/* Security Info */}
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.securityTitle}>Secure Payment</Text>
            </View>
            
            <View style={styles.securityContent}>
              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.securityText}>Payment processed via MTN Mobile Money</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.securityText}>You will receive a payment prompt on your phone</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.securityText}>Enter the OTP when prompted to complete payment</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 3,
    letterSpacing: 1,
  },
  amountCurrency: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  stepCircleActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  stepText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginLeft: 6,
  },
  stepTextActive: {
    color: '#6366f1',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#6366f1',
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  stepCardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  stepCardDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loader: {
    marginBottom: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  securityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },
  securityContent: {
    gap: 10,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
});

export default PaymentScreen; 