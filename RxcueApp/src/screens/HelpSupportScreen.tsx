import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }: any) => {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaint, setComplaint] = useState({
    subject: '',
    description: '',
    category: 'General',
  });

  const supportOptions = [
    {
      id: '1',
      title: 'WhatsApp Support',
      subtitle: 'Chat with our support team',
      icon: 'logo-whatsapp',
      color: '#25D366',
      onPress: () => openWhatsApp(),
    },
    {
      id: '2',
      title: 'Lodge a Complaint',
      subtitle: 'Report an issue or concern',
      icon: 'document-text',
      color: '#FF9500',
      onPress: () => setShowComplaintForm(true),
    },
    {
      id: '3',
      title: 'FAQ',
      subtitle: 'Frequently asked questions',
      icon: 'help-circle',
      color: '#007AFF',
      onPress: () => showFAQ(),
    },
    {
      id: '4',
      title: 'Call Support',
      subtitle: 'Speak with our team',
      icon: 'call',
      color: '#34C759',
      onPress: () => callSupport(),
    },
  ];

  const openWhatsApp = () => {
    const phoneNumber = '+1234567890'; // Replace with actual support number
    const message = 'Hello! I need help with Rxcue app.';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'WhatsApp Not Available',
            'WhatsApp is not installed on your device. Please install WhatsApp or use another support option.',
            [
              { text: 'OK' },
              { text: 'Call Support', onPress: callSupport },
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to open WhatsApp. Please try another support option.');
      });
  };

  const callSupport = () => {
    const phoneNumber = '+1234567890'; // Replace with actual support number
    Alert.alert(
      'Call Support',
      `Call our support team at ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phoneNumber}`) 
        },
      ]
    );
  };

  const showFAQ = () => {
    Alert.alert(
      'FAQ',
      'Common Questions:\n\n' +
      '• How do I order medicines?\n' +
      '• How long does delivery take?\n' +
      '• Can I upload prescriptions?\n' +
      '• How do I track my order?\n' +
      '• What payment method is accepted?\n' +
      '  We accept MTN Mobile Money payments only.\n\n' +
      'For more detailed answers, please contact our support team.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmitComplaint = () => {
    if (!complaint.subject || !complaint.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Simulate complaint submission
    Alert.alert(
      'Complaint Submitted',
      'Thank you for your feedback. We will review your complaint and get back to you within 24-48 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setComplaint({ subject: '', description: '', category: 'General' });
            setShowComplaintForm(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Ionicons name="help-circle" size={48} color="#007AFF" />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            Choose an option below to get the support you need
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={16} color="#666" />
            <Text style={styles.contactText}>support@rxcue.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.contactText}>+1 (234) 567-8900</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.contactText}>24/7 Support Available</Text>
          </View>
        </View>
      </ScrollView>

      {showComplaintForm && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lodge a Complaint</Text>
              <TouchableOpacity onPress={() => setShowComplaintForm(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category:</Text>
              <View style={styles.categoryOptions}>
                {['General', 'Order Issue', 'Payment Problem', 'Delivery Problem', 'App Bug'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      complaint.category === category && styles.selectedCategory,
                    ]}
                    onPress={() => setComplaint({ ...complaint, category })}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      complaint.category === category && styles.selectedCategoryText,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={complaint.subject}
              onChangeText={(text) => setComplaint({ ...complaint, subject: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              value={complaint.description}
              onChangeText={(text) => setComplaint({ ...complaint, description: text })}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitComplaint}>
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
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
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
    maxHeight: '80%',
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
  categoryContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpSupportScreen; 