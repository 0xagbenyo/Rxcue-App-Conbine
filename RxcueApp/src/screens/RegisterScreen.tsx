import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, storage } from '../services/api';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        console.log('Auto-focusing OTP input');
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
      }, 100);
    }
  }, [showOtpInput]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const isValidPhone = (phone: string) => {
    return phone.length >= 10;
  };

  const handleSendOtp = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    console.log('Sending signup OTP for:', {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim()
    });
    
    setIsLoading(true);
    try {
      const response = await authAPI.sendSignupOtp(
        formData.name.trim(),
        formData.phone.trim(),
        formData.email.trim()
      );
      
      console.log('Send signup OTP response:', response);
      setShowOtpInput(true);
      
      // Show development OTP if available
      const message = response.developmentOTP 
        ? `OTP sent! For testing, use: ${response.developmentOTP}\n\nOr use any 6-digit number if your phone is registered in ERPNext.`
        : 'OTP sent to your phone number';
      
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error('Send signup OTP error:', error);
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
      const response = await authAPI.verifySignupOtp(
        formData.name.trim(),
        formData.phone.trim(),
        formData.email.trim(),
        otp
      );
      
      if (response && response.success && response.data && response.data.token) {
        console.log('OTP verification successful, storing data...');
        storage.setToken(response.data.token);
        storage.setUserData(response.data.user || {});
        
        console.log('Stored token and user data, navigating to Main...');
        navigation.replace('Main');
        console.log('Navigation completed');
      } else {
        console.log('OTP verification failed - invalid response structure:', response);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    handleSendOtp();
  };

  const handleOtpChange = (text: string) => {
    console.log('OTP input changed:', text);
    setOtp(text);
  };

  const renderOtpInputs = () => {
    const otpDigits = otp.split('');
    
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
          We've sent a 6-digit code to {formData.phone}
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
          <View style={styles.otpInputsRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.otpInput,
                  otpDigits[index] && styles.otpInputFilled,
                  {
                    transform: [
                      {
                        scale: otpAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                      {
                        translateY: otpAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.otpText}>
                  {otpDigits[index] || ''}
                </Text>
              </Animated.View>
            ))}
          </View>
        </TouchableOpacity>

        <TextInput
          ref={otpInputRef}
          style={styles.hiddenOtpInput}
          value={otp}
          onChangeText={handleOtpChange}
          maxLength={6}
          keyboardType="numeric"
          caretHidden={true}
          selectTextOnFocus={false}
          onFocus={() => console.log('OTP input focused')}
          onBlur={() => console.log('OTP input blurred')}
          editable={true}
          autoFocus={showOtpInput}
        />

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
          style={[styles.continueButton, otp.length === 6 && styles.continueButtonEnabled]}
          onPress={handleVerifyOtp}
          disabled={otp.length !== 6 || isLoading}
        >
          <Text style={[styles.continueButtonText, otp.length === 6 && styles.continueButtonEnabledText]}>
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
          style={styles.keyboardAvoidingView}
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
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Please fill in your details to sign up</Text>
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
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="person" size={20} color="#343a40" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Full name"
                placeholderTextColor="#6c757d"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail" size={20} color="#343a40" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Email address"
                placeholderTextColor="#6c757d"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="call" size={18} color="#343a40" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Phone number"
                placeholderTextColor="#6c757d"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton, 
                formData.name.trim() && formData.email.trim() && formData.phone.trim() && styles.buttonEnabled
              ]}
              onPress={handleSendOtp}
              disabled={!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || isLoading}
            >
              <Text style={[
                styles.signUpButtonText, 
                formData.name.trim() && formData.email.trim() && formData.phone.trim() && styles.buttonEnabledText
              ]}>
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
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Alert.alert('Social Signup', 'Google signup coming soon!')}
              >
                <Ionicons name="logo-google" size={24} color="#343a40" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Alert.alert('Social Signup', 'GitHub signup coming soon!')}
              >
                <Ionicons name="logo-github" size={24} color="#343a40" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Alert.alert('Social Signup', 'Twitter signup coming soon!')}
              >
                <Ionicons name="logo-twitter" size={24} color="#343a40" />
              </TouchableOpacity>
            </View>
          </Animated.View>

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
              Already have an account?{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Login')}
              >
                Sign in
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  signUpButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.25,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  buttonEnabledText: {
    color: '#ffffff',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  linkText: {
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
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonEnabled: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.25,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  continueButtonEnabledText: {
    color: '#ffffff',
  },
});

export default RegisterScreen; 
