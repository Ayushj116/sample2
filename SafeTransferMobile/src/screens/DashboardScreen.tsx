import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants';
import { formatCurrency } from '../utils';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState({
    activeDeals: 0,
    completedDeals: 0,
    totalValue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demo
      const mockDeals = [
        {
          id: '1',
          dealId: 'ST001',
          title: 'Honda City 2019 Model',
          amount: 250000,
          status: 'funds_deposited',
          role: 'buyer',
          nextAction: 'Waiting for delivery',
          progress: 75,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          dealId: 'ST002',
          title: '2BHK Apartment in Koramangala',
          amount: 5000000,
          status: 'kyc_pending',
          role: 'seller',
          nextAction: 'Complete KYC verification',
          progress: 25,
          createdAt: new Date().toISOString(),
        },
      ];
      
      setDeals(mockDeals);
      setStats({
        activeDeals: 2,
        completedDeals: 5,
        totalValue: 7500000,
      });
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.sectionTitle}>Your Activity</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeDeals}</Text>
          <Text style={styles.statLabel}>Active Deals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completedDeals}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalValue)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    </Card>
  );

  const renderDeals = () => (
    <Card style={styles.dealsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Deals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Create' as never)}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {deals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={COLORS.gray300} />
          <Text style={styles.emptyStateText}>No deals yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first secure transaction</Text>
          <Button
            title="Create Deal"
            onPress={() => navigation.navigate('Create' as never)}
            style={styles.emptyStateButton}
          />
        </View>
      ) : (
        deals.map((deal: any) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealItem}
            onPress={() => navigation.navigate('DealDetails' as never, { dealId: deal.id })}
          >
            <View style={styles.dealHeader}>
              <Text style={styles.dealTitle} numberOfLines={1}>
                {deal.title}
              </Text>
              <StatusBadge status={deal.status} size="small" />
            </View>
            <View style={styles.dealDetails}>
              <Text style={styles.dealAmount}>{formatCurrency(deal.amount)}</Text>
              <Text style={styles.dealRole}>
                You are the {deal.role}
              </Text>
            </View>
            <Text style={styles.dealAction}>{deal.nextAction}</Text>
          </TouchableOpacity>
        ))
      )}
    </Card>
  );

  if (loading && deals.length === 0) {
    return <LoadingSpinner text="Loading your deals..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deal Dashboard</Text>
        <Text style={styles.headerSubtitle}>Monitor and manage your transactions</Text>
      </View>
      
      {renderStats()}
      {renderDeals()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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
  statsCard: {
    margin: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dealsCard: {
    margin: SIZES.lg,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  emptyStateText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  emptyStateSubtext: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textTertiary,
    marginBottom: SIZES.lg,
  },
  emptyStateButton: {
    paddingHorizontal: SIZES.xl,
  },
  dealItem: {
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  dealTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SIZES.sm,
  },
  dealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  dealAmount: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  dealRole: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  dealAction: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
});

export default DashboardScreen;