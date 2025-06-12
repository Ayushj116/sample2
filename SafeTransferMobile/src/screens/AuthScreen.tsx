import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, BUSINESS_TYPES } from '@/constants';
import { validatePhone } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'personal' | 'business'>('personal');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessType: '',
    gstin: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (userType === 'business' && !formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        await login(formData.phone, formData.password);
      } else {
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
          userType,
          ...(userType === 'business' && {
            businessName: formData.businessName,
            businessType: formData.businessType,
            gstin: formData.gstin,
          }),
        };
        await register(registerData);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelector = () => (
    <View style={styles.userTypeContainer}>
      <Text style={styles.label}>Account Type</Text>
      <View style={styles.userTypeButtons}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'personal' && styles.userTypeButtonActive,
          ]}
          onPress={() => setUserType('personal')}
        >
          <Ionicons
            name="person"
            size={24}
            color={userType === 'personal' ? COLORS.primary : COLORS.gray400}
          />
          <Text
            style={[
              styles.userTypeText,
              userType === 'personal' && styles.userTypeTextActive,
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'business' && styles.userTypeButtonActive,
          ]}
          onPress={() => setUserType('business')}
        >
          <Ionicons
            name="business"
            size={24}
            color={userType === 'business' ? COLORS.primary : COLORS.gray400}
          />
          <Text
            style={[
              styles.userTypeText,
              userType === 'business' && styles.userTypeTextActive,
            ]}
          >
            Business
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Safe Transfer</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </Text>
        </View>

        <Card style={styles.formCard}>
          {!isLogin && renderUserTypeSelector()}

          {!isLogin && (
            <View style={styles.nameContainer}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                error={errors.firstName}
                required
                containerStyle={styles.nameInput}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                error={errors.lastName}
                required
                containerStyle={styles.nameInput}
              />
            </View>
          )}

          {!isLogin && userType === 'business' && (
            <>
              <Input
                label="Business Name"
                value={formData.businessName}
                onChangeText={(value) => handleInputChange('businessName', value)}
                error={errors.businessName}
                required
              />
              <Input
                label="GSTIN (Optional)"
                value={formData.gstin}
                onChangeText={(value) => handleInputChange('gstin', value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </>
          )}

          <Input
            label="Mobile Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="9876543210"
            leftIcon={<Ionicons name="call" size={20} color={COLORS.gray400} />}
            required
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.gray400}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            required
          />

          {!isLogin && (
            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray400}
                />
              }
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              required
            />
          )}

          {!isLogin && (
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
            >
              <Ionicons
                name={formData.agreeToTerms ? 'checkbox' : 'square-outline'}
                size={20}
                color={formData.agreeToTerms ? COLORS.primary : COLORS.gray400}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          )}

          {errors.agreeToTerms && (
            <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
          )}

          <Button
            title={isLogin ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="large"
            style={styles.submitButton}
          />

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchModeText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.linkText}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.securityText}>
            Your data is protected with bank-grade encryption and stored securely in India.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    shadowColor: COLORS.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: SIZES.lg,
  },
  userTypeContainer: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  userTypeButton: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  userTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  userTypeText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  userTypeTextActive: {
    color: COLORS.primary,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  nameInput: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  termsText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
    flex: 1,
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  errorText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginBottom: SIZES.sm,
  },
  submitButton: {
    marginTop: SIZES.md,
    marginBottom: SIZES.lg,
  },
  switchModeButton: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginTop: SIZES.lg,
  },
  securityText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    marginLeft: SIZES.sm,
    flex: 1,
  },
});

export default AuthScreen;