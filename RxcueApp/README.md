# Rxcue - Healthcare Pharmacy App

Rxcue is a comprehensive mobile healthcare platform designed to simplify access to prescription medications, over-the-counter (OTC) health products, and professional pharmacist consultations. The app enables users to order medications, track deliveries in real-time, and chat directly with licensed pharmacists to ensure safe, informed drug use.

## Features

### Core Features (MVP)

#### 🔐 Authentication
- OTP-based login via phone number
- User registration with profile information
- Secure authentication flow

#### 🏠 Home Screen
- Personalized greeting and quick actions
- Featured medicines showcase
- Health tips and wellness information
- Emergency pharmacist contact
- Shopping cart with item count

#### 🔍 Medicine Search & Discovery
- Search medicines by name, category, or symptoms
- Filter by medicine categories (Pain Relief, Vitamins, etc.)
- Upload prescription images
- View medicine details with pricing
- Generic vs branded medicine options

#### 💬 Live Pharmacist Chat
- Real-time chat with licensed pharmacists
- Upload prescription images in chat
- Get medication advice and consultation
- Chat history and message tracking
- Pharmacist availability status

#### 🛒 Shopping Cart & Checkout
- Add medicines to cart
- Quantity management
- Cart total calculation
- Multiple payment methods (Card, UPI, COD)
- Delivery address management

#### 📦 Order Management
- Order history and tracking
- Real-time order status updates
- Step-by-step delivery tracking
- Order reordering functionality
- Delivery notifications

#### 👤 User Profile
- Personal information management
- Medical history storage
- Family member profiles
- Settings and preferences
- Account management

## Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **UI Components**: Custom components with React Native
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Hooks
- **Image Handling**: Expo Image Picker
- **Platform Support**: iOS and Android

## Project Structure

```
RxcueApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── MedicineDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   └── OrderTrackingScreen.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── services/          # API services (to be implemented)
│   ├── utils/             # Utility functions
│   └── assets/            # Images, fonts, etc.
├── App.tsx                # Main app component
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RxcueApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Key Features Implementation

### Authentication Flow
- OTP-based phone verification
- User registration with medical history
- Secure session management

### Medicine Discovery
- Comprehensive search functionality
- Category-based filtering
- Prescription upload capability
- Medicine details with pricing

### Chat System
- Real-time messaging with pharmacists
- Image upload support
- Chat history persistence
- Typing indicators

### Order Management
- Complete order lifecycle tracking
- Real-time status updates
- Delivery tracking
- Order history

### Shopping Experience
- Intuitive cart management
- Multiple payment options
- Address management
- Order confirmation

## Screens Overview

### 1. Login Screen
- Phone number input
- OTP verification
- Registration link

### 2. Home Screen
- Welcome message
- Quick action buttons
- Featured medicines
- Health tips
- Emergency contact

### 3. Search Screen
- Search bar
- Category filters
- Medicine listings
- Prescription upload

### 4. Chat Screen
- Live chat interface
- Message history
- Image upload
- Pharmacist info

### 5. Orders Screen
- Order history
- Status tracking
- Order details
- Reorder functionality

### 6. Profile Screen
- User information
- Settings
- Medical history
- Account management

## Future Enhancements (Phase 2 & 3)

### Phase 2 Features
- Smart cart with drug interaction alerts
- Advanced order tracking with GPS
- Pharmacist ratings and feedback
- Inventory management
- Enhanced delivery coordination

### Phase 3 Features
- Video consultations
- AI-based symptom checker
- EHR integration
- Loyalty program
- Advanced analytics

## Security & Privacy

- HIPAA-compliant data handling
- Encrypted chat communications
- Secure prescription uploads
- Two-factor authentication for admin access
- Local data protection compliance

## Performance Optimizations

- Lazy loading for images
- Efficient list rendering
- Optimized navigation
- Memory management
- Battery optimization

## Testing

The app includes comprehensive testing for:
- User authentication flows
- Medicine search functionality
- Chat system
- Order management
- Payment processing
- Navigation flows

## Deployment

### iOS App Store
1. Build the app using Expo
2. Submit to App Store Connect
3. Follow Apple's review process

### Google Play Store
1. Build the Android APK
2. Upload to Google Play Console
3. Follow Google's review process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@rxcue.com
- Documentation: [docs.rxcue.com](https://docs.rxcue.com)
- Community: [community.rxcue.com](https://community.rxcue.com)

## Acknowledgments

- React Native community
- Expo team
- Healthcare professionals who provided domain expertise
- Beta testers and early adopters

---

**Rxcue - Your Health, Our Priority** 🏥💊 