import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, DEAL_CATEGORIES, DELIVERY_METHODS } from '../constants';
import { validatePhone, formatCurrency } from '../utils';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateDealScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    deliveryMethod: '',
    inspectionPeriod: '3',
    userRole: 'buyer' as 'buyer' | 'seller',
    counterpartyPhone: '',
    counterpartyName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.amount || Number(formData.amount) < 1000) {
          newErrors.amount = 'Amount must be at least ₹1,000';
        }
        break;
      case 2:
        if (!formData.counterpartyPhone.trim()) {
          newErrors.counterpartyPhone = `${formData.userRole === 'buyer' ? 'Seller' : 'Buyer'} phone is required`;
        } else if (!validatePhone(formData.counterpartyPhone)) {
          newErrors.counterpartyPhone = 'Please enter a valid Indian mobile number';
        }
        if (!formData.counterpartyName.trim()) {
          newErrors.counterpartyName = `${formData.userRole === 'buyer' ? 'Seller' : 'Buyer'} name is required`;
        }
        if (!formData.deliveryMethod) newErrors.deliveryMethod = 'Delivery method is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Deal created successfully! The counterparty will receive an invitation.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Deal Details</Text>
      
      <View style={styles.userRoleContainer}>
        <Text style={styles.label}>I am the</Text>
        <View style={styles.userRoleButtons}>
          <TouchableOpacity
            style={[
              styles.userRoleButton,
              formData.userRole === 'buyer' && styles.userRoleButtonActive,
            ]}
            onPress={() => handleInputChange('userRole', 'buyer')}
          >
            <Text
              style={[
                styles.userRoleText,
                formData.userRole === 'buyer' && styles.userRoleTextActive,
              ]}
            >
              Buyer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userRoleButton,
              formData.userRole === 'seller' && styles.userRoleButtonActive,
            ]}
            onPress={() => handleInputChange('userRole', 'seller')}
          >
            <Text
              style={[
                styles.userRoleText,
                formData.userRole === 'seller' && styles.userRoleTextActive,
              ]}
            >
              Seller
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Input
        label="Item/Service Title"
        value={formData.title}
        onChangeText={(value) => handleInputChange('title', value)}
        error={errors.title}
        placeholder="e.g., Honda City 2019 Model"
        required
      />

      <Input
        label="Description"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        error={errors.description}
        placeholder="Provide detailed description..."
        multiline
        numberOfLines={4}
        required
      />

      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {DEAL_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryButton,
                formData.category === category.value && styles.categoryButtonActive,
              ]}
              onPress={() => handleInputChange('category', category.value)}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={
                  formData.category === category.value
                    ? COLORS.primary
                    : COLORS.gray400
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  formData.category === category.value && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
      </View>

      <Input
        label="Transaction Amount (₹)"
        value={formData.amount}
        onChangeText={(value) => handleInputChange('amount', value)}
        error={errors.amount}
        placeholder="25000"
        keyboardType="numeric"
        required
      />
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {formData.userRole === 'buyer' ? 'Seller' : 'Buyer'} Information
      </Text>

      <Input
        label={`${formData.userRole === 'buyer' ? 'Seller' : 'Buyer'} Name`}
        value={formData.counterpartyName}
        onChangeText={(value) => handleInputChange('counterpartyName', value)}
        error={errors.counterpartyName}
        placeholder="Full name"
        required
      />

      <Input
        label={`${formData.userRole === 'buyer' ? 'Seller' : 'Buyer'} Phone`}
        value={formData.counterpartyPhone}
        onChangeText={(value) => handleInputChange('counterpartyPhone', value)}
        error={errors.counterpartyPhone}
        placeholder="9876543210"
        keyboardType="phone-pad"
        maxLength={10}
        required
      />

      <View style={styles.deliveryContainer}>
        <Text style={styles.label}>Delivery Method *</Text>
        {DELIVERY_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.deliveryOption,
              formData.deliveryMethod === method.value && styles.deliveryOptionActive,
            ]}
            onPress={() => handleInputChange('deliveryMethod', method.value)}
          >
            <View
              style={[
                styles.radioButton,
                formData.deliveryMethod === method.value && styles.radioButtonActive,
              ]}
            />
            <Text style={styles.deliveryText}>{method.label}</Text>
          </TouchableOpacity>
        ))}
        {errors.deliveryMethod && (
          <Text style={styles.errorText}>{errors.deliveryMethod}</Text>
        )}
      </View>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Role:</Text>
          <Text style={styles.summaryValue}>{formData.userRole}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Item:</Text>
          <Text style={styles.summaryValue}>{formData.title}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Amount:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(Number(formData.amount))}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Category:</Text>
          <Text style={styles.summaryValue}>
            {DEAL_CATEGORIES.find(c => c.value === formData.category)?.label}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {formData.userRole === 'buyer' ? 'Seller' : 'Buyer'}:
          </Text>
          <Text style={styles.summaryValue}>{formData.counterpartyName}</Text>
        </View>
      </View>

      <View style={styles.feeContainer}>
        <Text style={styles.feeTitle}>Fee Breakdown</Text>
        <View style={styles.feeItem}>
          <Text style={styles.feeLabel}>Transaction Amount</Text>
          <Text style={styles.feeValue}>{formatCurrency(Number(formData.amount))}</Text>
        </View>
        <View style={styles.feeItem}>
          <Text style={styles.feeLabel}>Escrow Fee (2.5%)</Text>
          <Text style={styles.feeValue}>{formatCurrency(Number(formData.amount) * 0.025)}</Text>
        </View>
        <View style={[styles.feeItem, styles.feeTotal]}>
          <Text style={styles.feeTotalLabel}>Total</Text>
          <Text style={styles.feeTotalValue}>
            {formatCurrency(Number(formData.amount) * 1.025)}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Deal</Text>
          <Text style={styles.headerSubtitle}>Secure your transaction with escrow protection</Text>
        </View>

        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Button
              title="Previous"
              onPress={prevStep}
              variant="outline"
              style={styles.prevButton}
            />
          )}
          
          {currentStep < 3 ? (
            <Button
              title="Next"
              onPress={nextStep}
              style={styles.nextButton}
            />
          ) : (
            <Button
              title="Create Deal"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          )}
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
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SIZES.xl,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray500,
  },
  stepNumberActive: {
    color: COLORS.background,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.gray200,
    marginHorizontal: SIZES.sm,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepCard: {
    margin: SIZES.lg,
  },
  stepTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  userRoleContainer: {
    marginBottom: SIZES.lg,
  },
  userRoleButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  userRoleButton: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  userRoleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  userRoleText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  userRoleTextActive: {
    color: COLORS.primary,
  },
  categoryContainer: {
    marginBottom: SIZES.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  categoryButton: {
    width: '48%',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  categoryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  categoryText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: COLORS.primary,
  },
  deliveryContainer: {
    marginBottom: SIZES.lg,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
  },
  deliveryOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    marginRight: SIZES.md,
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  deliveryText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  summaryContainer: {
    marginBottom: SIZES.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  summaryLabel: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  feeContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  feeTitle: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.xs,
  },
  feeLabel: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  feeTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.sm,
    marginTop: SIZES.sm,
  },
  feeTotalLabel: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  feeTotalValue: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.lg,
    gap: SIZES.md,
  },
  prevButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  submitButton: {
    flex: 1,
  },
  errorText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
});

export default CreateDealScreen;