# Safe Transfer Mobile App

A React Native mobile application for the Safe Transfer Escrow Platform, built with Expo.

## Features

- **Cross-Platform**: Runs on both Android and iOS
- **Secure Authentication**: JWT-based authentication with biometric support
- **Real-time Notifications**: Push notifications and WebSocket integration
- **Document Upload**: Camera integration for KYC document capture
- **Offline Support**: Local data caching and sync
- **Modern UI**: Material Design components with smooth animations

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Hooks + Context API
- **UI Components**: React Native Paper + Custom Components
- **Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Storage**: AsyncStorage + Expo SecureStore
- **Camera**: Expo Camera + Image Picker
- **Charts**: React Native Chart Kit
- **Maps**: React Native Maps

## Prerequisites

- Node.js 18+ 
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone and setup**
   ```bash
   cd SafeTransferMobile
   npm install
   ```

2. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   npm run ios
   ```

## Building APK

### Method 1: Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build APK**
   ```bash
   # For development/testing
   eas build --platform android --profile preview
   
   # For production
   eas build --platform android --profile production
   ```

### Method 2: Local Build

1. **Install Android SDK and tools**
2. **Generate keystore**
   ```bash
   keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Build locally**
   ```bash
   expo build:android --type apk
   ```

## Project Structure

```
SafeTransferMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, etc.)
│   │   └── specific/       # Feature-specific components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services and utilities
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # App constants and configuration
├── assets/                 # Images, fonts, and other assets
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies and scripts
```

## Key Features Implementation

### Authentication
- JWT token storage in SecureStore
- Biometric authentication support
- Auto-login with stored credentials
- Secure logout with token cleanup

### Deal Management
- Create and manage escrow deals
- Real-time status updates
- Document upload with camera integration
- Progress tracking with visual indicators

### KYC Verification
- Step-by-step KYC process
- Document capture and upload
- Real-time verification status
- Government document validation

### Notifications
- Push notifications for deal updates
- In-app notification center
- Real-time WebSocket updates
- Notification preferences

### Security Features
- Biometric authentication
- Secure token storage
- Certificate pinning
- Data encryption
- Fraud detection

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://api.safetransfer.in/api
EXPO_PUBLIC_WS_URL=wss://api.safetransfer.in
EXPO_PUBLIC_ENVIRONMENT=production
```

### Firebase Configuration
1. Create a Firebase project
2. Add Android/iOS apps to the project
3. Download configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
4. Place files in the appropriate directories

### Push Notifications Setup
1. Configure Firebase Cloud Messaging
2. Update `app.json` with FCM configuration
3. Test notifications on physical devices

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Install Detox
npm install -g detox-cli

# Run E2E tests
detox test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Deal creation and management
- [ ] KYC document upload
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Biometric authentication
- [ ] Payment integration

## Deployment

### Google Play Store

1. **Prepare for release**
   - Update version in `app.json`
   - Generate signed APK/AAB
   - Test on multiple devices

2. **Upload to Play Console**
   - Create app listing
   - Upload APK/AAB file
   - Configure store listing
   - Submit for review

3. **Release management**
   - Staged rollout
   - Monitor crash reports
   - Update as needed

### App Store (iOS)

1. **Prepare for release**
   - Update version in `app.json`
   - Generate IPA file
   - Test on multiple devices

2. **Upload to App Store Connect**
   - Create app record
   - Upload IPA file
   - Configure app information
   - Submit for review

## Performance Optimization

### Bundle Size Optimization
- Use Expo's tree-shaking
- Optimize images and assets
- Remove unused dependencies
- Enable Hermes engine

### Runtime Performance
- Implement lazy loading
- Use FlatList for large lists
- Optimize re-renders with React.memo
- Use native driver for animations

### Network Optimization
- Implement request caching
- Use compression for API calls
- Optimize image loading
- Handle offline scenarios

## Security Considerations

### Data Protection
- Encrypt sensitive data
- Use SecureStore for tokens
- Implement certificate pinning
- Validate all user inputs

### Authentication Security
- Implement biometric authentication
- Use secure token storage
- Handle token refresh properly
- Implement session timeout

### API Security
- Use HTTPS only
- Implement request signing
- Rate limiting on client side
- Validate server certificates

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build failures**
   - Check Android SDK installation
   - Verify ANDROID_HOME environment variable
   - Clean and rebuild project

3. **iOS build failures**
   - Check Xcode installation
   - Verify iOS simulator setup
   - Clean derived data

4. **Expo CLI issues**
   ```bash
   npm install -g @expo/cli@latest
   expo doctor
   ```

### Debug Mode
- Enable remote debugging
- Use Flipper for advanced debugging
- Monitor network requests
- Check device logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support:
- Email: support@safetransfer.in
- Documentation: https://docs.safetransfer.in
- GitHub Issues: Create an issue for bugs or feature requests