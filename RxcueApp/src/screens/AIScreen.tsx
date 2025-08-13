import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AIScreen = ({ navigation }: any) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your Rxcue AI assistant. How can I help you navigate the app today?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const quickActions = [
    {
      id: '1',
      title: 'Order Medicine',
      description: 'Search and order medicines',
      icon: 'medical',
      action: () => navigation.navigate('Search'),
      color: '#FF6B6B',
    },
    {
      id: '2',
      title: 'Talk to Pharmacist',
      description: 'Chat with a licensed pharmacist',
      icon: 'chatbubbles',
      action: () => navigation.navigate('Chat'),
      color: '#00CEC9',
    },
    {
      id: '3',
      title: 'Track Orders',
      description: 'Check your order status',
      icon: 'cube',
      action: () => navigation.navigate('Main', { screen: 'Orders' }),
      color: '#FF9500',
    },
    {
      id: '4',
      title: 'Schedule Refill',
      description: 'Set up medication reminders',
      icon: 'time',
      action: () => navigation.navigate('ScheduleRefill'),
      color: '#4CAF50',
    },
  ];

  const commonQuestions = [
    {
      id: '1',
      question: 'How do I order medicine?',
      answer: 'Go to the Search tab, upload your prescription or search for medicines, add to cart, and checkout.',
    },
    {
      id: '2',
      question: 'How can I track my order?',
      answer: 'Go to the Orders tab to see all your orders and their current status.',
    },
    {
      id: '3',
      question: 'How do I chat with a pharmacist?',
      answer: 'Use the Chat tab or the "Talk to Pharmacist" quick action to get professional advice.',
    },
    {
      id: '4',
      question: 'How do I schedule a refill?',
      answer: 'Use the "Schedule Refill" feature to set up automatic medication reminders.',
    },
  ];

  const handleQuickAction = (action: any) => {
    action.action();
    addBotMessage(`Taking you to ${action.title}...`);
  };

  const handleQuestion = (question: any) => {
    addBotMessage(question.answer);
  };

  const addBotMessage = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      addBotMessage(botResponse);
    }, 1000);

    setInputText('');
  };

  const getBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('order') || input.includes('medicine') || input.includes('buy')) {
      return 'To order medicine, go to the Search tab, upload your prescription or search for medicines, add to cart, and checkout.';
    } else if (input.includes('track') || input.includes('order status')) {
      return 'You can track your orders in the Orders tab. It shows all your orders and their current status.';
    } else if (input.includes('pharmacist') || input.includes('chat') || input.includes('talk')) {
      return 'You can chat with a licensed pharmacist using the Chat tab or the "Talk to Pharmacist" quick action.';
    } else if (input.includes('refill') || input.includes('reminder')) {
      return 'Use the "Schedule Refill" feature to set up automatic medication reminders and refills.';
    } else if (input.includes('help') || input.includes('support')) {
      return 'I\'m here to help! You can ask me about ordering, tracking orders, chatting with pharmacists, or scheduling refills.';
    } else {
      return 'I\'m not sure about that. Try asking about ordering medicine, tracking orders, chatting with pharmacists, or scheduling refills.';
    }
  };

  const renderMessage = (message: any) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isBot ? styles.botMessage : styles.userMessage,
    ]}>
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble,
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText,
        ]}>
          {message.text}
        </Text>
      </View>
    </View>
  );

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={() => handleQuickAction(action)}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={24} color="#fff" />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  const renderQuestion = (question: any) => (
    <TouchableOpacity
      key={question.id}
      style={styles.questionCard}
      onPress={() => handleQuestion(question)}
    >
      <Text style={styles.questionText}>{question.question}</Text>
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Your navigation helper</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Common Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Questions</Text>
          {commonQuestions.map(renderQuestion)}
        </View>

        {/* Chat Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat History</Text>
          <View style={styles.messagesContainer}>
            {messages.map(renderMessage)}
          </View>
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about the app..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
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
  content: {
    flex: 1,
  },
  section: {
    margin: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  questionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  messagesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    maxHeight: 250,
  },
  messageContainer: {
    marginBottom: 10,
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  botBubble: {
    backgroundColor: '#f0f0f0',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 13,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIScreen;