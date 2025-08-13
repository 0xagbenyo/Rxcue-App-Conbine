import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OrderItem } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService, { ReminderNotification } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

interface DosageReminderScreenProps {
  navigation: any;
  route: {
    params: {
      items: OrderItem[];
      orderId: string;
    };
  };
}

interface ReminderSchedule {
  id: string;
  itemId: string;
  itemName: string;
  orderId: string;
  frequency: string;
  interval: string;
  duration: number;
  startDate: string;
  endDate: string;
  nextReminder: string;
  isActive: boolean;
  lastTaken: string | null;
  reminderCount: number;
  maxReminders: number;
}

const DosageReminderScreen = ({ navigation, route }: DosageReminderScreenProps) => {
  const { items, orderId } = route.params;
  const [reminders, setReminders] = useState<{ [key: string]: boolean }>({});
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [activeReminders, setActiveReminders] = useState<{ [key: string]: ReminderSchedule }>({});
  const appState = useRef<string>(AppState.currentState);
  const reminderTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Debug: Log the items to see what dosage information is available
  console.log('DosageReminderScreen - Items with dosage info:', items.map(item => ({
    id: item.id,
    name: item.name,
    dosageInfo: {
      frequencyAdult: item.custom_dosage_frequencyadult,
      frequencyChild: item.custom_dosage_frequencychild,
      amountAdult: item.custom_dosage_amountadult,
      amountChild: item.custom_dosage_amountchild,
      durationAdult: item.custom_dosage_durationadult,
      durationChild: item.custom_dosage_durationchild,
      notes: item.custom_dosage_notes,
      interval: item.custom_interval
    }
  })));

  // Load saved reminders on component mount
  useEffect(() => {
    console.log('=== DOSAGE REMINDER SCREEN MOUNTED ===');
    loadSavedReminders();
    loadReminderSchedules();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Set up notification listeners
    let notificationReceivedSubscription: Notifications.Subscription | undefined;
    let notificationResponseSubscription: Notifications.Subscription | undefined;
    
    const setupNotifications = async () => {
      try {
        console.log('Setting up notifications...');
        
        // Initialize notification service
        await notificationService.initialize();
        console.log('Notification service initialized successfully');
        
        // Listen for notifications received while app is in foreground
        notificationReceivedSubscription = await notificationService.addNotificationReceivedListener(
          (notification) => {
            console.log('Notification received in foreground:', notification);
            // Handle foreground notification if needed
          }
        );
        console.log('Foreground notification listener set up');
        
        // Listen for notification responses (when user taps notification)
        notificationResponseSubscription = await notificationService.addNotificationResponseReceivedListener(
          (response) => {
            console.log('=== NOTIFICATION RESPONSE RECEIVED ===');
            console.log('Full response:', JSON.stringify(response, null, 2));
            console.log('Notification content:', response.notification.request.content);
            console.log('Notification data:', response.notification.request.content.data);
            
            const data = response.notification.request.content.data;
            
            if (data && typeof data.reminderId === 'string') {
              let scheduleId = data.reminderId;
              
              // Handle different notification ID formats
              if (data.reminderType === 'persistent') {
                // For persistent reminders, the ID might be "scheduleId_persistent"
                // Extract the original schedule ID
                scheduleId = data.reminderId.replace('_persistent', '');
              } else if (data.reminderType === 'snooze') {
                // For snooze reminders, the ID might be "scheduleId_snooze_timestamp"
                // Extract the original schedule ID
                scheduleId = data.reminderId.split('_snooze_')[0];
              }
              
              console.log('Looking for schedule with ID:', scheduleId);
              console.log('Available schedules:', reminderSchedules.map(s => ({ id: s.id, name: s.itemName })));
              
              // Find the schedule by ID
              const schedule = reminderSchedules.find(s => s.id === scheduleId);
              if (schedule) {
                console.log('Found schedule:', schedule.itemName);
                // Show the reminder dialog immediately
                showReminderNotification(schedule);
              } else {
                console.log('Schedule not found for ID:', scheduleId);
                // Try to find by medicineId as fallback
                const scheduleByMedicine = reminderSchedules.find(s => s.itemId === data.medicineId);
                if (scheduleByMedicine) {
                  console.log('Found schedule by medicineId:', scheduleByMedicine);
                  showReminderNotification(scheduleByMedicine);
                } else {
                  console.log('No schedule found by medicineId either');
                }
              }
            } else {
              console.log('No valid reminderId found in notification data');
            }
          }
        );
        console.log('Notification response listener set up successfully');
        
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };
    
    setupNotifications();
    
    return () => {
      console.log('Cleaning up notification listeners...');
      subscription?.remove();
      notificationReceivedSubscription?.remove();
      notificationResponseSubscription?.remove();
      // Clear all timers on unmount
      Object.values(reminderTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Handle app state changes (foreground/background)
  const handleAppStateChange = (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground, check for overdue reminders
      checkOverdueReminders();
    }
    appState.current = nextAppState;
  };

  // Load saved reminders from AsyncStorage
  const loadSavedReminders = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem(`reminders_${orderId}`);
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (error) {
      console.log('Error loading saved reminders:', error);
    }
  };

  // Load saved reminder schedules from AsyncStorage
  const loadReminderSchedules = async () => {
    try {
      console.log('Loading reminder schedules...');
      const savedSchedules = await AsyncStorage.getItem(`reminder_schedules_${orderId}`);
      if (savedSchedules) {
        const schedules = JSON.parse(savedSchedules);
        console.log('Loaded schedules:', schedules);
        setReminderSchedules(schedules);
        
        // Set up active reminders
        const active: { [key: string]: ReminderSchedule } = {};
        schedules.forEach((schedule: ReminderSchedule) => {
          if (schedule.isActive) {
            active[schedule.itemId] = schedule;
            scheduleReminder(schedule);
          }
        });
        setActiveReminders(active);
        console.log('Active reminders set up:', active);
      } else {
        console.log('No saved schedules found');
      }
    } catch (error) {
      console.log('Error loading reminder schedules:', error);
    }
  };

  // Save reminders to AsyncStorage
  const saveReminders = async (newReminders: { [key: string]: boolean }) => {
    try {
      await AsyncStorage.setItem(`reminders_${orderId}`, JSON.stringify(newReminders));
    } catch (error) {
      console.log('Error saving reminders:', error);
    }
  };

  // Save reminder schedules to AsyncStorage
  const saveReminderSchedules = async (schedules: ReminderSchedule[]) => {
    try {
      await AsyncStorage.setItem(`reminder_schedules_${orderId}`, JSON.stringify(schedules));
    } catch (error) {
      console.log('Error saving reminder schedules:', error);
    }
  };

  // Calculate reminder interval in milliseconds
  const calculateIntervalMs = (frequency: string, customInterval: string): number => {
    if (customInterval) {
      // Parse custom interval (e.g., "8 hours", "8", "12 hours", "12")
      const intervalMatch = customInterval.match(/(\d+)(?:\s*(hour|hours|hr|hrs))?/i);
      if (intervalMatch) {
        const hours = parseInt(intervalMatch[1]);
        console.log(`Custom interval parsed: ${hours} hours from "${customInterval}"`);
        return hours * 60 * 60 * 1000; // Convert to milliseconds
      }
    }
    
    // Fallback to frequency-based calculation
    if (frequency.includes('twice')) return 12 * 60 * 60 * 1000; // 12 hours
    if (frequency.includes('three times')) return 8 * 60 * 60 * 1000; // 8 hours
    if (frequency.includes('four times')) return 6 * 60 * 60 * 1000; // 6 hours
    if (frequency.includes('once')) return 24 * 60 * 60 * 1000; // 24 hours
    
    return 12 * 60 * 60 * 1000; // Default to 12 hours
  };

  // Calculate duration in milliseconds
  const calculateDurationMs = (duration: number): number => {
    return duration * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  };

  // Create reminder schedule
  const createReminderSchedule = (item: OrderItem): ReminderSchedule | null => {
    const frequency = item.custom_dosage_frequencyadult || item.custom_dosage_frequencychild || 'twice daily';
    const interval = item.custom_interval || '';
    const duration = Number(item.custom_dosage_durationadult || item.custom_dosage_durationchild || 7);
    
    if (!frequency || !duration || isNaN(duration)) return null;
    
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + calculateDurationMs(duration)).toISOString();
    const intervalMs = calculateIntervalMs(frequency, interval);
    console.log(`Creating reminder schedule for ${item.name}: frequency="${frequency}", interval="${interval}", calculated intervalMs=${intervalMs}ms (${intervalMs / (60 * 60 * 1000)} hours)`);
    const nextReminder = new Date(now.getTime() + intervalMs).toISOString();
    
    // Calculate max reminders based on duration and frequency
    const maxReminders = Math.ceil((duration * 24 * 60 * 60 * 1000) / intervalMs);
    
    return {
      id: `${item.id}_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      orderId,
      frequency,
      interval,
      duration,
      startDate,
      endDate,
      nextReminder,
      isActive: true,
      lastTaken: null,
      reminderCount: 0,
      maxReminders
    };
  };

  // Schedule a reminder using background notifications
  const scheduleReminder = async (schedule: ReminderSchedule) => {
    try {
      // Clear existing notification if any
      await notificationService.cancelReminder(schedule.id);

      if (!schedule.isActive) {
        return;
      }

      const now = new Date();
      const nextReminderTime = new Date(schedule.nextReminder);
      const timeUntilReminder = nextReminderTime.getTime() - now.getTime();

      if (timeUntilReminder <= 0) {
        // Reminder is overdue, show immediately and schedule persistent reminder
        showReminderNotification(schedule);
        schedulePersistentReminder(schedule);
        return;
      }

      // Find the item to get dosage information
      const item = items.find(item => item.id === schedule.itemId);
      if (!item) return;

      // Create notification trigger based on frequency
      let trigger;
      if (schedule.frequency === 'daily') {
        const reminderDate = new Date(schedule.nextReminder);
        trigger = notificationService.createDailyTrigger(
          reminderDate.getHours(),
          reminderDate.getMinutes()
        );
      } else if (schedule.interval && schedule.interval.trim() !== '') {
        // Use custom interval if available
        const intervalMs = calculateIntervalMs(schedule.frequency, schedule.interval);
        trigger = notificationService.createCustomIntervalTrigger(intervalMs);
      } else {
        // For other frequencies, schedule a one-time notification
        trigger = notificationService.createDateTrigger(nextReminderTime);
      }

      // Create and schedule the notification
      const reminderNotification = notificationService.createReminderNotification(
        item.name,
        item.custom_dosage_amountadult || '1 tablet',
        schedule.nextReminder,
        item.id,
        schedule.id,
        trigger
      );

      await notificationService.scheduleReminder(reminderNotification);
      console.log(`Scheduled background reminder for ${schedule.itemName} at ${schedule.nextReminder}`);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      Alert.alert('Error', 'Failed to schedule medication reminder');
    }
  };

  // Schedule persistent reminder that continues every 5 minutes until taken
  const schedulePersistentReminder = async (schedule: ReminderSchedule) => {
    try {
      const item = items.find(item => item.id === schedule.itemId);
      if (!item) return;

      // Create persistent reminder that repeats every 5 minutes
      const persistentNotification = notificationService.createPersistentReminder(
        item.name,
        item.custom_dosage_amountadult || '1 tablet',
        new Date().toISOString(),
        item.id,
        `${schedule.id}_persistent`
      );

      await notificationService.scheduleReminder(persistentNotification);
      console.log(`Scheduled persistent reminder for ${schedule.itemName} - will remind every 5 minutes until taken`);
    } catch (error) {
      console.error('Failed to schedule persistent reminder:', error);
    }
  };

  // Test reminder immediately (for testing purposes)
  const testReminder = async (item: OrderItem) => {
    try {
      Alert.alert(
        'Test Reminder',
        `Testing enhanced background reminder for ${item.name}. This will show a notification in 10 seconds and then continue every 5 minutes until marked as taken.`,
        [
          {
            text: 'OK',
            onPress: async () => {
              try {
                // Create a test notification that will appear in 10 seconds
                const testDate = new Date(Date.now() + 10000); // 10 seconds from now
                
                const reminderNotification = notificationService.createReminderNotification(
                  item.name,
                  item.custom_dosage_amountadult || '1 tablet',
                  testDate.toISOString(),
                  item.id,
                  `test_${item.id}_${Date.now()}`,
                  notificationService.createDateTrigger(testDate)
                );

                await notificationService.scheduleReminder(reminderNotification);
                
                Alert.alert(
                  'Test Reminder Scheduled',
                  `Enhanced background reminder for ${item.name} will appear in 10 seconds. After that, it will continue every 5 minutes until you mark it as taken!`,
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Failed to schedule test reminder:', error);
                Alert.alert('Error', 'Failed to schedule test reminder');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in test reminder:', error);
      Alert.alert('Error', 'Failed to create test reminder');
    }
  };

  // Show current reminder status
  const showReminderStatus = () => {
    const activeCount = Object.keys(activeReminders).length;
    const totalCount = reminderSchedules.length;
    
    Alert.alert(
      'Reminder Status',
      `Active Reminders: ${activeCount}\nTotal Schedules: ${totalCount}\n\nActive reminders will continue every 5 minutes until marked as taken.`,
      [{ text: 'OK' }]
    );
  };

  // Test notification response handler manually
  const testNotificationResponse = () => {
    console.log('Testing notification response handler manually...');
    console.log('Available schedules:', reminderSchedules);
    console.log('Notification service initialized:', notificationService);
    
    if (reminderSchedules.length > 0) {
      const testSchedule = reminderSchedules[0];
      console.log('Testing with schedule:', testSchedule);
      
      // Test the actual notification response handler logic
      const mockNotificationData = {
        reminderId: testSchedule.id,
        medicineId: testSchedule.itemId,
        reminderType: 'initial'
      };
      
      console.log('Mock notification data:', mockNotificationData);
      
      // Simulate what happens when a notification is tapped
      let scheduleId = mockNotificationData.reminderId;
      console.log('Looking for schedule with ID:', scheduleId);
      console.log('Available schedules:', reminderSchedules.map(s => ({ id: s.id, name: s.itemName })));
      
      const schedule = reminderSchedules.find(s => s.id === scheduleId);
      if (schedule) {
        console.log('Found schedule:', schedule.itemName);
        showReminderNotification(schedule);
      } else {
        console.log('Schedule not found for ID:', scheduleId);
        Alert.alert('Test Failed', 'Schedule not found - this indicates the issue');
      }
    } else {
      Alert.alert('No Schedules', 'No reminder schedules available for testing');
    }
  };

  // Show reminder notification
  const showReminderNotification = (schedule: ReminderSchedule) => {
    Alert.alert(
      'Medication Reminder',
      `Time to take ${schedule.itemName}!`,
      [
        {
          text: 'Taken',
          onPress: () => markMedicationTaken(schedule)
        },
        {
          text: 'Snooze (5 min)',
          onPress: () => scheduleReminderAgain(schedule, 5 * 60 * 1000)
        },
        {
          text: 'Snooze (15 min)',
          onPress: () => scheduleReminderAgain(schedule, 15 * 60 * 1000)
        },
        {
          text: 'Turn Off',
          style: 'destructive',
          onPress: () => turnOffReminder(schedule)
        }
      ],
      { cancelable: false }
    );
  };

  // Mark medication as taken
  const markMedicationTaken = async (schedule: ReminderSchedule) => {
    try {
      // Cancel any persistent reminders for this medication
      await notificationService.cancelReminder(`${schedule.id}_persistent`);
      
      const now = new Date();
      const updatedSchedule = {
        ...schedule,
        lastTaken: now.toISOString(),
        reminderCount: schedule.reminderCount + 1
      };
      
      // Check if we've reached the end of the treatment period
      if (updatedSchedule.reminderCount >= updatedSchedule.maxReminders) {
        updatedSchedule.isActive = false;
        Alert.alert(
          'Treatment Complete',
          `You have completed your ${schedule.duration} day treatment for ${schedule.itemName}.`,
          [{ text: 'OK' }]
        );
      } else {
        // Schedule next reminder based on interval
        const intervalMs = calculateIntervalMs(schedule.frequency, schedule.interval);
        updatedSchedule.nextReminder = new Date(now.getTime() + intervalMs).toISOString();
        
        // Schedule the next reminder
        scheduleReminder(updatedSchedule);
      }
      
      // Update schedules
      const updatedSchedules = reminderSchedules.map(s => 
        s.id === schedule.id ? updatedSchedule : s
      );
      setReminderSchedules(updatedSchedules);
      saveReminderSchedules(updatedSchedules);
      
      // Update active reminders
      if (updatedSchedule.isActive) {
        setActiveReminders(prev => ({
          ...prev,
          [schedule.itemId]: updatedSchedule
        }));
      } else {
        setActiveReminders(prev => {
          const newActive = { ...prev };
          delete newActive[schedule.itemId];
          return newActive;
        });
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      Alert.alert('Error', 'Failed to mark medication as taken');
    }
  };

  // Schedule reminder again (for "remind until taken" logic)
  const scheduleReminderAgain = async (schedule: ReminderSchedule, delay: number) => {
    try {
      // Cancel any existing persistent reminders for this medication
      await notificationService.cancelReminder(`${schedule.id}_persistent`);
      
      const now = new Date();
      const nextReminder = new Date(now.getTime() + delay);
      
      const updatedSchedule = {
        ...schedule,
        nextReminder: nextReminder.toISOString()
      };
      
      // Find the item to get dosage information
      const item = items.find(item => item.id === schedule.itemId);
      if (!item) return;
      
      // Create and schedule the snooze notification
      const reminderNotification = notificationService.createSnoozeReminder(
        item.name,
        item.custom_dosage_amountadult || '1 tablet',
        nextReminder.toISOString(),
        item.id,
        schedule.id,
        delay / (60 * 1000) // Convert to minutes
      );
      
      await notificationService.scheduleReminder(reminderNotification);
      
      // Update schedules
      const updatedSchedules = reminderSchedules.map(s => 
        s.id === schedule.id ? updatedSchedule : s
      );
      setReminderSchedules(updatedSchedules);
      saveReminderSchedules(updatedSchedules);
      
      console.log(`Snoozed reminder for ${schedule.itemName} for ${delay / (60 * 1000)} minutes`);
    } catch (error) {
      console.error('Failed to reschedule reminder:', error);
      Alert.alert('Error', 'Failed to reschedule reminder');
    }
  };

  // Turn off a reminder
  const turnOffReminder = async (schedule: ReminderSchedule) => {
    Alert.alert(
      'Turn Off Reminder',
      `Are you sure you want to turn off reminders for ${schedule.itemName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Turn Off',
          style: 'destructive',
          onPress: async () => {
            const updatedSchedule = {
              ...schedule,
              isActive: false,
              nextReminder: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Set next reminder to 5 minutes from now
              reminderCount: 0, // Reset reminder count
            };

            // Cancel existing notification and any persistent reminders
            await notificationService.cancelReminder(schedule.id);
            await notificationService.cancelReminder(`${schedule.id}_persistent`);

            // Update schedules
            const updatedSchedules = reminderSchedules.map(s => 
              s.id === schedule.id ? updatedSchedule : s
            );
            setReminderSchedules(updatedSchedules);
            saveReminderSchedules(updatedSchedules);

            // Update active reminders
            setActiveReminders(prev => {
              const newActive = { ...prev };
              delete newActive[schedule.itemId];
              return newActive;
            });

            Alert.alert(
              'Reminder Turned Off',
              `Reminders for ${schedule.itemName} have been turned off.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  // Check for overdue reminders
  const checkOverdueReminders = () => {
    const now = new Date();
    reminderSchedules.forEach(schedule => {
      if (schedule.isActive && new Date(schedule.nextReminder) <= now) {
        showReminderNotification(schedule);
      }
    });
  };

  const toggleReminder = (itemId: string) => {
    const newReminders = {
      ...reminders,
      [itemId]: !reminders[itemId]
    };
    setReminders(newReminders);
    saveReminders(newReminders);
    
    if (newReminders[itemId]) {
      // Create and activate reminder schedule
      const item = items.find(i => i.id === itemId);
      if (item) {
        const schedule = createReminderSchedule(item);
        if (schedule) {
          const updatedSchedules = [...reminderSchedules, schedule];
          setReminderSchedules(updatedSchedules);
          saveReminderSchedules(updatedSchedules);
          
          setActiveReminders(prev => ({
            ...prev,
            [itemId]: schedule
          }));
          
          // Schedule the first reminder
          scheduleReminder(schedule);
          
          Alert.alert(
            'Reminder Set',
            `Reminder set for ${item.name}. You'll receive notifications based on your dosage schedule.`,
            [{ text: 'OK' }]
          );
        }
      }
    } else {
      // Deactivate reminder
      const updatedSchedules = reminderSchedules.map(s => 
        s.itemId === itemId ? { ...s, isActive: false } : s
      );
      setReminderSchedules(updatedSchedules);
      saveReminderSchedules(updatedSchedules);
      
      // Cancel background notification and remove from active
      if (activeReminders[itemId]) {
        const schedule = activeReminders[itemId];
        // Cancel the background notification
        notificationService.cancelReminder(schedule.id).catch(error => {
          console.error('Failed to cancel reminder:', error);
        });
      }
      
      setActiveReminders(prev => {
        const newActive = { ...prev };
        delete newActive[itemId];
        return newActive;
      });
      
      Alert.alert(
        'Reminder Removed',
        `Reminder removed for ${items.find(i => i.id === itemId)?.name}.`,
        [{ text: 'OK' }]
      );
    }
  };

  const hasDosageInfo = (item: OrderItem) => {
    return item.custom_dosage_frequencyadult || 
           item.custom_dosage_frequencychild || 
           item.custom_dosage_amountadult || 
           item.custom_dosage_amountchild || 
           item.custom_dosage_durationadult || 
           item.custom_dosage_durationchild || 
           item.custom_dosage_notes ||
           item.custom_interval;
  };

  const renderDosageInfo = (item: OrderItem) => {
    if (!hasDosageInfo(item)) {
      return (
        <View style={styles.noDosageContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#92400e" />
          <Text style={styles.noDosageText}>No dosage information available for this item.</Text>
        </View>
      );
    }

    return (
      <View style={styles.dosageContainer}>
        <View style={styles.dosageHeader}>
          <Ionicons name="medical-outline" size={18} color="#3b82f6" />
          <Text style={styles.dosageHeaderText}>Dosage Instructions</Text>
        </View>
        
        {item.custom_dosage_frequencyadult && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="time-outline" size={16} color="#3b82f6" />
            </View>
            <Text style={styles.dosageLabel}>Frequency (Adult):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_frequencyadult}</Text>
          </View>
        )}
        
        {item.custom_dosage_frequencychild && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="time-outline" size={16} color="#3b82f6" />
            </View>
            <Text style={styles.dosageLabel}>Frequency (Child):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_frequencychild}</Text>
          </View>
        )}
        
        {item.custom_dosage_amountadult && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="medical-outline" size={16} color="#10b981" />
            </View>
            <Text style={styles.dosageLabel}>Amount (Adult):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_amountadult}</Text>
          </View>
        )}
        
        {item.custom_dosage_amountchild && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="medical-outline" size={16} color="#10b981" />
            </View>
            <Text style={styles.dosageLabel}>Amount (Child):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_amountchild}</Text>
          </View>
        )}
        
        {item.custom_dosage_durationadult && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.dosageLabel}>Duration (Adult):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_durationadult} day(s)</Text>
          </View>
        )}
        
        {item.custom_dosage_durationchild && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.dosageLabel}>Duration (Child):</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_durationchild} day(s)</Text>
          </View>
        )}
        
        {item.custom_dosage_notes && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="document-text-outline" size={16} color="#8b5cf6" />
            </View>
            <Text style={styles.dosageLabel}>Notes:</Text>
            <Text style={styles.dosageValue}>{item.custom_dosage_notes}</Text>
          </View>
        )}
        
        {item.custom_interval && (
          <View style={styles.dosageRow}>
            <View style={styles.dosageIconContainer}>
              <Ionicons name="time-outline" size={16} color="#ef4444" />
            </View>
            <Text style={styles.dosageLabel}>Custom Interval:</Text>
            <Text style={styles.dosageValue}>{item.custom_interval}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderReminderStatus = (item: OrderItem) => {
    const schedule = activeReminders[item.id];
    if (!schedule) return null;

    const now = new Date();
    const nextReminder = new Date(schedule.nextReminder);
    const isOverdue = nextReminder <= now;
    const progressPercentage = (schedule.reminderCount / schedule.maxReminders) * 100;
    
    return (
      <View style={styles.reminderStatusContainer}>
        <View style={styles.reminderStatusHeader}>
          <View style={styles.reminderStatusRow}>
            <Ionicons 
              name={isOverdue ? "alert-circle" : "time"} 
              size={18} 
              color={isOverdue ? "#ef4444" : "#3b82f6"} 
            />
            <Text style={[styles.reminderStatusText, { color: isOverdue ? "#ef4444" : "#3b82f6" }]}>
              {isOverdue ? "Overdue" : "Next reminder"}
            </Text>
            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueBadgeText}>URGENT</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.reminderTimeSection}>
          <Text style={styles.reminderTimeText}>
            {isOverdue ? "Now" : nextReminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isOverdue && (
            <Text style={styles.reminderDateText}>
              {nextReminder.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.reminderProgressHeader}>
            <Text style={styles.reminderProgressLabel}>Progress</Text>
            <Text style={styles.progressCount}>{schedule.reminderCount} of {schedule.maxReminders} doses</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>
        
        {schedule.lastTaken && (
          <View style={styles.lastTakenSection}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.lastTakenText}>
              Last taken: {new Date(schedule.lastTaken).toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="medical-outline" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.headerTitle}>Dosage & Reminders</Text>
          <Text style={styles.headerSubtitle}>Order #{orderId}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Help', 'View dosage information and set medication reminders for your order. Reminders will notify you based on your dosage schedule and continue until you mark medication as taken.')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Progress Summary */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
          <Text style={styles.progressTitle}>Order Progress</Text>
        </View>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{items.length}</Text>
            <Text style={styles.progressLabel}>Medications</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{Object.keys(activeReminders).length}</Text>
            <Text style={styles.progressLabel}>Active Reminders</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>
              {reminderSchedules.filter(s => s.lastTaken).length}
            </Text>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication Dosage Information</Text>
          <Text style={styles.sectionSubtitle}>
            Review dosage instructions and set reminders for your medications. Reminders will continue until you mark medication as taken.
          </Text>
        </View>

        {items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <View style={styles.itemNameRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {activeReminders[item.id] && (
                    <View style={styles.activeBadge}>
                      <Ionicons name="notifications" size={12} color="#fff" />
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                {activeReminders[item.id] && (
                  <View style={styles.nextReminderPreview}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.nextReminderText}>
                      Next: {new Date(activeReminders[item.id].nextReminder).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.reminderToggle}>
                <Text style={styles.reminderLabel}>Set Reminder</Text>
                <Switch
                  value={reminders[item.id] || false}
                  onValueChange={() => toggleReminder(item.id)}
                  trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                  thumbColor={reminders[item.id] ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>

            {renderDosageInfo(item)}

            {reminders[item.id] && renderReminderStatus(item)}


          </View>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No items found in this order</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e9ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerIconContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    padding: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
  },
  progressLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    fontWeight: '400',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  activeBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },
  itemQuantity: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  nextReminderPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  nextReminderText: {
    fontSize: 10,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  reminderToggle: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reminderLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dosageContainer: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dosageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dosageHeaderText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dosageIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dosageLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  dosageValue: {
    fontSize: 10,
    color: '#1f2937',
    flex: 2,
    fontWeight: '500',
  },
  noDosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  noDosageText: {
    fontSize: 10,
    color: '#92400e',
    marginLeft: 6,
    fontWeight: '500',
  },
  reminderStatusContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  reminderStatusHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reminderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderStatusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 6,
  },
  overdueBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  overdueBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  reminderTimeSection: {
    marginBottom: 8,
  },
  reminderTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 16,
    marginBottom: 3,
  },
  reminderDateText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 16,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  reminderProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderProgressLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressCount: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  progressPercentage: {
    fontSize: 8,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '600',
  },
  lastTakenSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  lastTakenText: {
    fontSize: 9,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },

});

export default DosageReminderScreen;