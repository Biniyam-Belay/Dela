"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Share, // Import Share API
} from "react-native"
import * as FileSystem from "expo-file-system" // Import expo-file-system
import { fetchStats, fetchRecentOrders } from "../services/supabaseClient"
import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import theme, { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

type RootStackParamList = {
  Settings: undefined
  Notifications: undefined
}

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>

const MOCK_STATS = { products: 1254, orders: 42, users: 3879 }
const MOCK_ORDERS = [
  { id: "38294", createdAt: new Date().toISOString(), status: "pending", total: 129.99 },
  { id: "38295", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: "shipped", total: 89.5 },
  { id: "38296", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "delivered", total: 49.99 },
  { id: "38297", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: "cancelled", total: 75.25 },
]

export default function DashboardScreen() {
  const [stats, setStats] = useState<{ products: number; orders: number; users: number }>({
    products: 0,
    orders: 0,
    users: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(20))[0]
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const navigation = useNavigation<DashboardNavigationProp>()
  const [isExporting, setIsExporting] = useState(false) // Add state for export loading indicator

  useEffect(() => {
    const load = async () => {
      console.log("DashboardScreen: useEffect started.")

      if (__DEV__) {
        console.log("DashboardScreen: Development mode detected. Using mock data.")
        setStats(MOCK_STATS)
        setRecentOrders(MOCK_ORDERS)
        setLoading(false)
        try {
          console.log("DashboardScreen (Dev): Starting animations...")
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]).start(() => console.log("DashboardScreen (Dev): Animations completed."))
        } catch (animError) {
          console.error("DashboardScreen (Dev): Error starting animations:", animError)
        }
      } else {
        console.log("DashboardScreen: Production mode detected. Fetching data...")
        setLoading(true)
        try {
          console.log("DashboardScreen: Fetching stats...")
          const statsData = await fetchStats()
          console.log("DashboardScreen: Stats fetched:", statsData)
          if (statsData) {
            setStats({
              products: statsData.products || 0,
              orders: statsData.orders || 0,
              users: statsData.users || 0,
            })
          } else {
            console.warn("DashboardScreen: fetchStats returned undefined/null, falling back to MOCK_STATS")
            setStats(MOCK_STATS)
          }

          console.log("DashboardScreen: Fetching recent orders...")
          const orders = await fetchRecentOrders()
          console.log("DashboardScreen: Recent orders fetched:", orders)
          if (orders && orders.length > 0) {
            setRecentOrders(orders)
          } else {
            console.warn("DashboardScreen: fetchRecentOrders returned empty/null, falling back to MOCK_ORDERS")
            setRecentOrders(MOCK_ORDERS)
          }

          console.log("DashboardScreen: Data fetching successful.")
        } catch (e) {
          console.error("DashboardScreen: Error fetching data in production, falling back to mock data:", e)
          setStats(MOCK_STATS)
          setRecentOrders(MOCK_ORDERS)
        } finally {
          console.log("DashboardScreen: Setting loading false.")
          setLoading(false)
          try {
            console.log("DashboardScreen (Prod): Starting animations...")
            Animated.parallel([
              Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
              Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]).start(() => console.log("DashboardScreen (Prod): Animations completed."))
          } catch (animError) {
            console.error("DashboardScreen (Prod): Error starting animations:", animError)
          }
        }
      }
    }
    load()
  }, [])

  const generateOrdersCSV = (orders: any[]): string => {
    if (!orders || orders.length === 0) {
      return ""
    }
    const headers = ["Order ID", "Created At", "Status", "Total"]
    const rows = orders.map((order) =>
      [
        order.id,
        order.createdAt ? new Date(order.createdAt).toISOString() : "N/A",
        order.status || "N/A",
        order.total?.toFixed(2) ?? "N/A",
      ].join(","),
    )
    return [headers.join(","), ...rows].join("\n")
  }

  const handleExportOrders = async () => {
    if (isExporting) return
    setIsExporting(true)
    console.log("Exporting recent orders...")

    try {
      const csvString = generateOrdersCSV(recentOrders)
      if (!csvString) {
        alert("No order data to export.")
        setIsExporting(false)
        return
      }

      const fileName = `recent_orders_${new Date().toISOString().split("T")[0]}.csv`
      const fileUri = FileSystem.cacheDirectory + fileName

      console.log(`Writing CSV to: ${fileUri}`)
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      console.log("CSV file written successfully.")

      await Share.share({
        url: fileUri,
        title: fileName,
        message: `Here are the recent orders exported on ${new Date().toLocaleDateString()}.`,
      })
      console.log("Share sheet opened.")
    } catch (error) {
      console.error("Error exporting orders:", error)
      alert(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
      console.log("Export process finished.")
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGradient}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    )
  }

  const renderStatCard = (title: string, value: number, icon: string, backgroundColor: string) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.statIconContainer}>
        <Image source={{ uri: icon }} style={styles.statIcon} />
      </View>
      <Text style={styles.statNumber}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  )

  const getStatusStyle = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return {
          color: colors.warning,
          backgroundColor: `${colors.warning}1A`,
        }
      case "shipped":
        return {
          color: colors.info,
          backgroundColor: `${colors.info}1A`,
        }
      case "delivered":
        return {
          color: colors.success,
          backgroundColor: `${colors.success}1A`,
        }
      case "cancelled":
        return {
          color: colors.error,
          backgroundColor: `${colors.error}1A`,
        }
      default:
        return {
          color: colors.textSecondary,
          backgroundColor: `${colors.textSecondary}1A`,
        }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid date"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)

    if (diffHrs < 1) {
      return "Just now"
    } else if (diffHrs < 24) {
      return `${Math.floor(diffHrs)} hour${Math.floor(diffHrs) === 1 ? "" : "s"} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible)
  const closeDropdown = () => setDropdownVisible(false)

  const navigateToSettings = () => {
    closeDropdown()
    navigation.navigate("Settings")
  }

  const navigateToNotifications = () => {
    navigation.navigate("Notifications")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>SuriAddis Admin</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="search" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
            <MaterialIcons name="notifications-none" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity style={styles.avatarContainer} onPress={toggleDropdown}>
              <Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.avatar} />
            </TouchableOpacity>
            <Modal
              visible={dropdownVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={closeDropdown}
            >
              <TouchableWithoutFeedback onPress={closeDropdown}>
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={navigateToSettings}>
                  <MaterialIcons name="settings" size={20} color={colors.textSecondary} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        <View style={styles.statsContainer}>
          {renderStatCard(
            "Products",
            stats.products,
            "https://img.icons8.com/fluency/96/000000/product.png",
            colors.primary,
          )}
          {renderStatCard(
            "Orders",
            stats.orders,
            "https://img.icons8.com/fluency/96/000000/purchase-order.png",
            colors.warning,
          )}
          {renderStatCard("Users", stats.users, "https://img.icons8.com/fluency/96/000000/group.png", colors.info)}
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <MaterialIcons
                name="add-business"
                size={32}
                color={colors.primary}
                style={styles.quickActionIconStyle}
              />
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Image
                source={{ uri: "https://img.icons8.com/fluency/96/000000/purchase-order.png" }}
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>New Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Image
                source={{ uri: "https://img.icons8.com/fluency/96/000000/statistics.png" }}
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <View style={styles.sectionHeaderActions}>
              <TouchableOpacity onPress={handleExportOrders} disabled={isExporting} style={styles.exportButton}>
                {isExporting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MaterialIcons name="download" size={20} color={colors.primary} />
                )}
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                source={{ uri: "https://img.icons8.com/fluency/96/000000/empty-box.png" }}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          ) : (
            recentOrders.map((item) => {
              const statusStyle = getStatusStyle(item.status)

              return (
                <TouchableOpacity key={item.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    <Text style={styles.orderTotal}>${item.total?.toFixed(2) ?? "N/A"}</Text>
                  </View>

                  <View style={styles.orderCardGradient} />
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizeMd,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + spacing.sm : spacing.md,
    paddingBottom: spacing.md,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  iconButton: {
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    position: "relative",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    marginLeft: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 65 : 75,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  dropdownIcon: {
    marginRight: spacing.md,
  },
  dropdownText: {
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statCard: {
    width: (width - (spacing.lg * 2 + spacing.sm * 2)) / 3,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  statNumber: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizeXs,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  quickActionsContainer: {
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: (width - (spacing.lg * 2 + spacing.sm * 2)) / 3,
    height: 90,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    marginBottom: spacing.sm,
  },
  quickActionIconStyle: {
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  recentOrdersContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + "15",
    borderRadius: spacing.sm,
  },
  exportButtonText: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  orderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  orderCardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    borderBottomLeftRadius: spacing.md,
    borderBottomRightRadius: spacing.md,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: "capitalize",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
})
