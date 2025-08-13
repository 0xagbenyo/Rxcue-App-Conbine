import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { storage } from '../services/api';

const LoginScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [continueButtonEnabled, setContinueButtonEnabled] = useState(false);
  const otpInputRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const otpAnim = useRef(new Animated.Value(0)).current;

  // Debug OTP state changes
  useEffect(() => {
    console.log('OTP state changed:', otp, 'Length:', otp.length);
  }, [otp]);

  // Focus OTP input when screen appears
  useEffect(() => {
    if (showOtpInput && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    }
  }, [showOtpInput]);

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate OTP section when it appears
  useEffect(() => {
    if (showOtpInput) {
      Animated.timing(otpAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Focus the OTP input after animation starts
      setTimeout(() => {
        otpInputRef.current?.focus();
        console.log('Auto-focusing OTP input');
      }, 300);
    }
  }, [showOtpInput]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    console.log('Sending OTP for phone number:', phoneNumber);
    console.log('Phone number length:', phoneNumber.length);
    
    setIsLoading(true);
    try {
      const response = await authAPI.sendLoginOtp(phoneNumber);
      console.log('Send OTP response:', response);
      setShowOtpInput(true);
      
      // Show development OTP if available
      const message = response.developmentOTP 
        ? `OTP sent! For testing, use: ${response.developmentOTP}\n\nOr use any 6-digit number if your phone is registered in ERPNext.`
        : 'OTP sent to your phone number';
      
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Verifying OTP for phone:', phoneNumber);
      console.log('OTP entered:', otp);
      
      const response = await authAPI.verifyLoginOtp(phoneNumber, otp);
      console.log('OTP verification response:', response);
      
      // Validate response structure
      if (!response || !response.success || !response.data || !response.data.token) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server - missing token');
      }
      
      console.log('Response validation passed, storing data...');
      storage.setToken(response.data.token);
      storage.setUserData(response.data.user || {});
      
      console.log('Stored token and user data, navigating to Main...');
      navigation.replace('Main');
      console.log('Navigation completed');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setContinueButtonEnabled(false);
    handleSendOtp();
  };

  const handleOtpChange = (text: string) => {
    setOtp(text);
    setContinueButtonEnabled(text.length === 6);
  };

  const renderOtpInputs = () => {
    return (
      <View style={styles.otpContainer}>
        {/* RxCUE Logo */}
        <View style={styles.otpLogoContainer}>
          <Image 
            source={require('../assets/images/Horizontal Version_RxCUE PNG (5).png')}
            style={styles.otpLogoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.otpLabel}>Enter verification code</Text>
        <Text style={styles.otpSubtext}>
          We've sent a 6-digit code to {phoneNumber}
        </Text>
        
        <TouchableOpacity 
          style={styles.otpTouchableArea}
          onPress={() => {
            console.log('OTP area tapped, focusing input');
            if (otpInputRef.current) {
              otpInputRef.current.focus();
              console.log('Focus called on OTP input');
            } else {
              console.log('OTP input ref is null');
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.otpInputContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <View
                key={index}
                style={[
                  styles.otpInput,
                  otp[index] && styles.otpInputFilled,
                ]}
              >
                <Text style={styles.otpText}>
                  {otp[index] || ''}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Hidden OTP Input for keyboard */}
        <TextInput
          ref={otpInputRef}
          style={styles.hiddenOtpInput}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="numeric"
          maxLength={6}
          caretHidden={true}
          selectTextOnFocus={false}
          onFocus={() => console.log('OTP input focused')}
          onBlur={() => console.log('OTP input blurred')}
          editable={true}
          autoFocus={showOtpInput}
        />

        {/* Debug button to test keyboard */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            console.log('Debug button pressed');
            if (otpInputRef.current) {
              otpInputRef.current.focus();
              console.log('Focus called from debug button');
            } else {
              console.log('OTP input ref is null from debug button');
            }
          }}
        >
                      <Text style={styles.debugButtonText}>Debug: Focus OTP Input</Text>
          </TouchableOpacity>
          
          {/* Debug navigation button */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              console.log('Testing navigation to Main...');
              navigation.replace('Main');
            }}
          >
            <Text style={styles.debugButtonText}>Debug: Test Navigation</Text>
          </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendOtp}
          disabled={isLoading}
        >
          <Text style={styles.resendText}>
            Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, continueButtonEnabled && styles.continueButtonEnabled]}
          onPress={handleVerifyOtp}
          disabled={!continueButtonEnabled || isLoading}
        >
          <Text style={[styles.continueButtonText, continueButtonEnabled && styles.continueButtonEnabledText]}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (showOtpInput) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowOtpInput(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#343a40" />
            </TouchableOpacity>
            
            {renderOtpInputs()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* RxCUE Logo */}
            <View style={styles.userIconContainer}>
                              <Image 
                  source={require('../assets/images/Horizontal Version_RxCUE PNG (5).png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
            </View>
            
            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="call" size={18} color="#343a40" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Phone number"
                placeholderTextColor="#6c757d"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15}
                autoFocus={false}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.signInButton, phoneNumber.length >= 10 && styles.buttonEnabled]}
              onPress={handleSendOtp}
              disabled={phoneNumber.length < 10 || isLoading}
            >
              <Text style={[styles.signInButtonText, phoneNumber.length >= 10 && styles.buttonEnabledText]}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>CONNECT WITH US ON</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Media Icons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#1877f2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-twitter" size={20} color="#1da1f2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-instagram" size={20} color="#e4405f" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-linkedin" size={20} color="#0077b5" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Sign Up
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 30,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 0,
  },
  userIconContainer: {
    width: 200,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#343a40',
    textAlignVertical: 'top',
  },
  signInButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.25,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  buttonEnabledText: {
    color: '#fff',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c757d',
    marginHorizontal: 14,
    letterSpacing: 0.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  footerLink: {
    color: '#007bff',
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  otpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  otpLogoContainer: {
    width: 180,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  otpLogoImage: {
    width: '100%',
    height: '100%',
  },
  otpLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 6,
    textAlign: 'center',
  },
  otpSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 28,
    textAlign: 'center',
  },
  otpTouchableArea: {
    marginBottom: 28,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  otpInput: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  otpText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  hiddenOtpInput: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendContainer: {
    marginBottom: 28,
  },
  resendText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  resendLink: {
    color: '#007bff',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  continueButtonEnabled: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.25,
  },
  continueButtonEnabledText: {
    color: '#fff',
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default LoginScreen; 