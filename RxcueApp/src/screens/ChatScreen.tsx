import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ChatMessage, Pharmacist } from '../types';

const ChatScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPharmacist, setCurrentPharmacist] = useState<Pharmacist | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChatHistory();
    connectToPharmacist();
  }, []);

  const loadChatHistory = () => {
    // Simulate loading chat history
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: 'pharmacist1',
        senderType: 'pharmacist',
        message: 'Hello! I\'m Dr. Sarah, your licensed pharmacist. How can I help you today?',
        timestamp: new Date(Date.now() - 300000),
        attachments: [],
      },
      {
        id: '2',
        senderId: 'user1',
        senderType: 'user',
        message: 'Hi! I have a question about my medication. I\'m taking Paracetamol for a headache.',
        timestamp: new Date(Date.now() - 240000),
        attachments: [],
      },
      {
        id: '3',
        senderId: 'pharmacist1',
        senderType: 'pharmacist',
        message: 'That\'s a common medication for pain relief. How long have you been experiencing the headache?',
        timestamp: new Date(Date.now() - 180000),
        attachments: [],
      },
    ];
    setMessages(mockMessages);
  };

  const connectToPharmacist = () => {
    // Simulate connecting to a pharmacist
    const mockPharmacist: Pharmacist = {
      id: 'pharmacist1',
      name: 'Dr. Sarah Johnson',
      license: 'PH12345',
      specialization: 'General Pharmacy',
      isOnline: true,
      rating: 4.8,
      totalChats: 1250,
    };
    setCurrentPharmacist(mockPharmacist);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user1',
      senderType: 'user',
      message: inputText.trim(),
      timestamp: new Date(),
      attachments: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate pharmacist response
    setTimeout(() => {
      const pharmacistResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'pharmacist1',
        senderType: 'pharmacist',
        message: 'Thank you for your message. I\'m reviewing your information and will respond shortly.',
        timestamp: new Date(),
        attachments: [],
      };
      setMessages(prev => [...prev, pharmacistResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'user1',
          senderType: 'user',
          message: 'Prescription/Image uploaded',
          timestamp: new Date(),
          attachments: [result.assets[0].uri],
        };

        setMessages(prev => [...prev, newMessage]);
        Alert.alert('Success', 'Image uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.senderType === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.pharmacistMessage]}>
        {!isUser && (
          <View style={styles.pharmacistAvatar}>
            <Ionicons name="medical" size={20} color="#fff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.pharmacistBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.pharmacistMessageText]}>
            {item.message}
          </Text>
          {item.attachments && item.attachments.length > 0 && (
            <Image source={{ uri: item.attachments[0] }} style={styles.attachmentImage} />
          )}
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.pharmacistMessageTime]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.pharmacistInfo}>
          <View style={styles.pharmacistAvatar}>
            <Ionicons name="medical" size={20} color="#fff" />
          </View>
          <View style={styles.pharmacistDetails}>
            <Text style={styles.pharmacistName}>
              {currentPharmacist?.name || 'Connecting...'}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: currentPharmacist?.isOnline ? '#34C759' : '#FF3B30' }]} />
              <Text style={styles.statusText}>
                {currentPharmacist?.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.pharmacistAvatar}>
              <Ionicons name="medical" size={20} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Pharmacist is typing...</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={handleUploadImage}>
          <Ionicons name="camera" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pharmacistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pharmacistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pharmacistDetails: {
    flex: 1,
  },
  pharmacistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  pharmacistMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  pharmacistBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  pharmacistMessageText: {
    color: '#333',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  pharmacistMessageTime: {
    color: '#999',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    padding: 10,
    marginRight: 10,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ChatScreen; 