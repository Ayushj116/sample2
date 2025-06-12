#!/bin/bash

# Safe Transfer Mobile - APK Build Script
# This script builds the Android APK for the Safe Transfer mobile app

set -e

echo "🚀 Starting Safe Transfer Mobile APK Build Process..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v expo &> /dev/null; then
        echo "📦 Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    if ! command -v eas &> /dev/null; then
        echo "📦 Installing EAS CLI..."
        npm install -g eas-cli
    fi
    
    echo "✅ All requirements satisfied!"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing project dependencies..."
    npm install
    echo "✅ Dependencies installed!"
}

# Configure EAS Build
configure_eas() {
    echo "⚙️ Configuring EAS Build..."
    
    if [ ! -f "eas.json" ]; then
        echo "📝 Creating EAS configuration..."
        eas build:configure
    fi
    
    echo "✅ EAS configured!"
}

# Build APK
build_apk() {
    echo "🔨 Building Android APK..."
    echo "This may take 10-15 minutes depending on your internet connection..."
    
    # Build for preview (APK format)
    eas build --platform android --profile preview --non-interactive
    
    echo "✅ APK build completed!"
}

# Download APK
download_apk() {
    echo "📥 Your APK has been built successfully!"
    echo "You can download it from the Expo dashboard or use the link provided above."
    echo ""
    echo "To download directly:"
    echo "1. Visit https://expo.dev/accounts/[your-username]/projects/safe-transfer-mobile/builds"
    echo "2. Click on the latest build"
    echo "3. Download the APK file"
    echo ""
    echo "To install on Android device:"
    echo "1. Enable 'Unknown Sources' in Android settings"
    echo "2. Transfer APK to device"
    echo "3. Tap APK file to install"
}

# Main execution
main() {
    echo "🏗️ Safe Transfer Mobile - APK Build Script"
    echo "=========================================="
    echo ""
    
    check_requirements
    echo ""
    
    install_dependencies
    echo ""
    
    configure_eas
    echo ""
    
    # Check if user is logged in to Expo
    if ! eas whoami &> /dev/null; then
        echo "🔐 Please login to your Expo account:"
        eas login
    fi
    
    build_apk
    echo ""
    
    download_apk
    echo ""
    
    echo "🎉 Build process completed successfully!"
    echo "Your Safe Transfer mobile app APK is ready for distribution."
}

# Run the main function
main "$@"