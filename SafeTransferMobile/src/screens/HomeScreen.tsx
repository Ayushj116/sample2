import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, FONTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { dealService } from "@/services/dealService";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
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
      const response = await dealService.getDeals({ limit: 5 });
      if (response.success) {
        setRecentDeals(response.data.deals);

        // Calculate stats
        const deals = response.data.deals;
        const activeDeals = deals.filter(
          (d) => !["completed", "cancelled", "refunded"].includes(d.status),
        ).length;
        const completedDeals = deals.filter(
          (d) => d.status === "completed",
        ).length;
        const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

        setStats({ activeDeals, completedDeals, totalValue });
      }
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()},</Text>
          <Text style={styles.userName}>{user?.firstName}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications" as never)}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.textPrimary}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Create" as never)}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.primary + "20" },
            ]}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>New Deal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Dashboard" as never)}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.secondary + "20" },
            ]}
          >
            <Ionicons name="grid" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.quickActionText}>My Deals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("KYC" as never)}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.accent + "20" },
            ]}
          >
            <Ionicons name="shield-checkmark" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.quickActionText}>KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate("Help" as never)}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.info + "20" },
            ]}
          >
            <Ionicons name="help-circle" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.quickActionText}>Help</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

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
          <Text style={styles.statValue}>
            {formatCurrency(stats.totalValue)}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    </Card>
  );

  const renderRecentDeals = () => (
    <Card style={styles.recentDealsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Deals</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard" as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentDeals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={COLORS.gray300} />
          <Text style={styles.emptyStateText}>No deals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first secure transaction
          </Text>
          <Button
            title="Create Deal"
            onPress={() => navigation.navigate("Create" as never)}
            style={styles.emptyStateButton}
          />
        </View>
      ) : (
        recentDeals.slice(0, 3).map((deal: any) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealItem}
            onPress={() =>
              navigation.navigate("DealDetails" as never, { dealId: deal.id })
            }
          >
            <View style={styles.dealHeader}>
              <Text style={styles.dealTitle} numberOfLines={1}>
                {deal.title}
              </Text>
              <StatusBadge status={deal.status} size="small" />
            </View>
            <View style={styles.dealDetails}>
              <Text style={styles.dealAmount}>
                {formatCurrency(deal.amount)}
              </Text>
              <Text style={styles.dealRole}>You are the {deal.role}</Text>
            </View>
            <Text style={styles.dealAction}>{deal.nextAction}</Text>
          </TouchableOpacity>
        ))
      )}
    </Card>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
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
      {renderHeader()}
      {renderQuickActions()}
      {renderStats()}
      {renderRecentDeals()}
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
  },
  notificationButton: {
    position: "relative",
    padding: SIZES.sm,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  quickActionsCard: {
    margin: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: (width - SIZES.lg * 4) / 2,
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  quickActionText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  statsCard: {
    margin: SIZES.lg,
    marginTop: 0,
    marginBottom: SIZES.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
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
    textAlign: "center",
  },
  recentDealsCard: {
    margin: SIZES.lg,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  viewAllText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

export default HomeScreen;
