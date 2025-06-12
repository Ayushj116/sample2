import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'shield-checkmark',
      title: 'KYC Verification',
      subtitle: 'Complete your identity verification',
      onPress: () => navigation.navigate('KYC' as never),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => navigation.navigate('Notifications' as never),
    },
    {
      icon: 'settings',
      title: 'Settings',
      subtitle: 'App settings and preferences',
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => navigation.navigate('Help' as never),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
            <Text style={styles.userType}>
              {user?.userType === 'business' ? 'Business Account' : 'Personal Account'}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        ))}
      </Card>

      <View style={styles.footer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.lg,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  userPhone: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  userType: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  menuCard: {
    margin: SIZES.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  menuSubtitle: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SIZES.lg,
  },
});

export default ProfileScreen;