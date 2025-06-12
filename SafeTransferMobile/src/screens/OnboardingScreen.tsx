import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Secure Escrow Protection',
    description: 'Your money is held safely until both parties complete the transaction successfully.',
    icon: 'shield-checkmark',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'KYC Verified Users',
    description: 'All users are verified with government documents for maximum security and trust.',
    icon: 'person-circle',
    color: COLORS.secondary,
  },
  {
    id: '3',
    title: 'Real-time Tracking',
    description: 'Track your transaction progress in real-time with instant notifications.',
    icon: 'notifications',
    color: COLORS.accent,
  },
  {
    id: '4',
    title: 'Dispute Resolution',
    description: 'Expert mediation and dispute resolution to ensure fair outcomes for all parties.',
    icon: 'people',
    color: COLORS.info,
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuth();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderOnboardingItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={80} color={COLORS.background} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentIndex ? COLORS.primary : COLORS.gray300,
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {renderPagination()}
        
        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
            size="large"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.md,
  },
  skipButton: {
    padding: SIZES.sm,
  },
  skipText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    shadowColor: COLORS.gray900,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  description: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    marginTop: SIZES.lg,
  },
});

export default OnboardingScreen;