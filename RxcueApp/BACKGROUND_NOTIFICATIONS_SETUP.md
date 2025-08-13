# Background Notifications Setup for RxCue App

## Overview
The RxCue app now supports background notifications for medication reminders. This means users will receive notifications even when the app is closed or in the background.

## What's Been Implemented

### 1. Notification Service (`src/services/notificationService.ts`)
- Handles all notification permissions and scheduling
- Supports daily recurring reminders
- Supports custom interval reminders
- Supports one-time reminders
- Manages notification channels for Android

### 2. Updated DosageReminderScreen
- Replaced timer-based reminders with background notifications
- Reminders work even when app is closed
- Test reminder function to verify background notifications

### 3. App Configuration (`app.json`)
- Added push notification permissions
- Configured notification channels
- Set up proper bundle identifiers

## How It Works

1. **Permission Request**: App requests notification permissions on first launch
2. **Background Scheduling**: Reminders are scheduled using Expo Notifications API
3. **System Notifications**: Notifications appear even when app is closed
4. **User Interaction**: Tapping notification opens app and shows reminder dialog

## Testing Background Notifications

1. **Set a Reminder**: Toggle on any medication reminder
2. **Test Function**: Use the "Test Reminder" button
3. **Close App**: Completely close the app (swipe away from recent apps)
4. **Wait**: Wait for the scheduled time (10 seconds for test)
5. **Notification**: You should see a system notification

## Required Setup

### 1. Replace Placeholder Files
- `assets/notification-icon.png` - Replace with actual 24x24px PNG icon
- `assets/notification-sound.wav` - Replace with actual WAV sound file (optional)

### 2. Update Bundle Identifiers
In `app.json`, update these values for your actual app:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.rxcue"
},
"android": {
  "package": "com.yourcompany.rxcue"
}
```

### 3. Expo Project ID (Optional)
For push notifications, you'll need to set up an Expo project and update the project ID in the notification service.

## Troubleshooting

### Notifications Not Appearing
1. Check notification permissions in device settings
2. Ensure app is not in battery optimization mode
3. Verify notification channels are created (Android)

### App Crashes on Notification
1. Check console for error messages
2. Verify all dependencies are installed
3. Ensure proper error handling in notification callbacks

## Dependencies
- `expo-notifications` - Core notification functionality
- `expo-device` - Device information for permissions

## Future Enhancements
- Push notifications for remote reminders
- Rich notifications with action buttons
- Notification history and analytics
- Custom notification sounds per medication
