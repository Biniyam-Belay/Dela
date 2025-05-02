"use client"

import { useEffect, useState, useRef } from "react"
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
  Share,
} from "react-native"
import * as FileSystem from "expo-file-system"
import { fetchStats, fetchRecentOrders } from "../services/supabaseClient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { LineChart } from "react-native-chart-kit"
import { colors, spacing, typography } from "../theme"

const { width } = Dimensions.get("window")

type RootStackParamList = {
  Settings: undefined
  Notifications: undefined
  ProductDetails: { id: string }
  OrderDetails: { id: string }
  UserManagement: undefined
  Analytics: undefined
}

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>

const MOCK_STATS = { products: 1254, orders: 42, users: 3879, revenue: 12489.99 }
const MOCK_ORDERS = [
  { id: "38294", createdAt: new Date().toISOString(), status: "pending", total: 129.99, customer: "John Doe" },
  {
    id: "38295",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "shipped",
    total: 89.5,
    customer: "Sarah Smith",
  },
  {
    id: "38296",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "delivered",
    total: 49.99,
    customer: "Michael Johnson",
  },
  {
    id: "38297",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "cancelled",
    total: 75.25,
    customer: "Emily Davis",
  },
]

const MOCK_SALES_DATA = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [450, 590, 380, 790, 890, 760, 680],
    },
  ],
}

const MOCK_INVENTORY_ALERTS = [
  { id: "1", name: "Organic Coffee Beans", stock: 5, threshold: 10 },
  { id: "2", name: "Handmade Ceramic Mug", stock: 3, threshold: 15 },
  { id: "3", name: "Bamboo Cutting Board", stock: 8, threshold: 20 },
]

const MOCK_RECENT_ACTIVITY = [
  { id: "1", type: "order", message: "New order #38294 received", time: "5 min ago" },
  { id: "2", type: "user", message: "New user registered: Alex Johnson", time: "25 min ago" },
  { id: "3", type: "product", message: "Product 'Organic Tea Set' updated", time: "1 hour ago" },
  { id: "4", type: "review", message: "New 5-star review on 'Bamboo Utensils'", time: "3 hours ago" },
]

declare const __DEV__: boolean

export default function DashboardScreen() {
  const [stats, setStats] = useState<{ products: number; orders: number; users: number; revenue: number }>({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [inventoryAlerts, setInventoryAlerts] = useState(MOCK_INVENTORY_ALERTS)
  const [recentActivity, setRecentActivity] = useState(MOCK_RECENT_ACTIVITY)
  const [salesData, setSalesData] = useState(MOCK_SALES_DATA)

  const navigation = useNavigation<DashboardNavigationProp>()

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const headerOpacity = useRef(new Animated.Value(0)).current

  // Animated values for each stat card
  const statAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  useEffect(() => {
    const load = async () => {
      console.log("DashboardScreen: useEffect started.")

      if (__DEV__) {
        console.log("DashboardScreen: Development mode detected. Using mock data.")
        setStats({ ...MOCK_STATS })
        setRecentOrders(MOCK_ORDERS)
        setLoading(false)

        // Start animations
        startAnimations()
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
              revenue: statsData.revenue || 0,
            })
          } else {
            console.warn("DashboardScreen: fetchStats returned undefined/null, falling back to MOCK_STATS")
            setStats({ ...MOCK_STATS })
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
          setStats({ ...MOCK_STATS })
          setRecentOrders(MOCK_ORDERS)
        } finally {
          console.log("DashboardScreen: Setting loading false.")
          setLoading(false)

          // Start animations
          startAnimations()
        }
      }
    }
    load()
  }, [])

  const startAnimations = () => {
    try {
      console.log("Starting animations...")

      // Header animation
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start()

      // Main content animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()

      // Staggered animations for stat cards
      Animated.stagger(
        150,
        statAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ),
      ).start()
    } catch (animError) {
      console.error("Error starting animations:", animError)
    }
  }

  const generateOrdersCSV = (orders: any[]): string => {
    if (!orders || orders.length === 0) {
      return ""
    }
    const headers = ["Order ID", "Created At", "Status", "Total", "Customer"]
    const rows = orders.map((order) =>
      [
        order.id,
        order.createdAt ? new Date(order.createdAt).toISOString() : "N/A",
        order.status || "N/A",
        order.total?.toFixed(2) ?? "N/A",
        order.customer || "N/A",
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

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible)
  const closeDropdown = () => setDropdownVisible(false)

  const navigateToSettings = () => {
    closeDropdown()
    navigation.navigate("Settings")
  }

  const navigateToNotifications = () => {
    navigation.navigate("Notifications")
  }

  const navigateToUserManagement = () => {
    closeDropdown()
    // Assuming you have a UserManagement screen in your navigation
    navigation.navigate("UserManagement")
  }

  const navigateToAnalytics = () => {
    // Navigate to the Analytics screen
    navigation.navigate("Analytics");
  }

  const navigateToOrderDetails = (orderId: string) => {
    // Navigate to order details screen
    navigation.navigate("OrderDetails", { id: orderId })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    )
  }

  const renderStatCard = (title: string, value: number | string, icon: any, index: number) => {
    // Format value if it's a number
    const formattedValue =
      typeof value === "number"
        ? title.toLowerCase() === "revenue"
          ? `$${value.toLocaleString()}`
          : value.toLocaleString()
        : value

    // Choose icon background color based on stat type
    let iconBg = colors.primary
    if (title.toLowerCase() === "products") iconBg = colors.info // Use info color for Products
    if (title.toLowerCase() === "orders") iconBg = colors.info
    if (title.toLowerCase() === "users") iconBg = colors.success
    if (title.toLowerCase() === "revenue") iconBg = colors.warning

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: statAnims[index],
            transform: [
              {
                translateY: statAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              {
                scale: statAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.statContent}>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statNumber}>{formattedValue}</Text>
          </View>
          <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>{icon}</View>
        </View>
        <View style={styles.statCardGradient} />
      </Animated.View>
    )
  }

  const getStatusStyle = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return {
          color: colors.warning,
          backgroundColor: colors.warningBg,
          icon: <Feather name="clock" size={14} color={colors.warning} />,
        }
      case "shipped":
        return {
          color: colors.info,
          backgroundColor: colors.infoBg,
          icon: <Feather name="truck" size={14} color={colors.info} />,
        }
      case "delivered":
        return {
          color: colors.success,
          backgroundColor: colors.successBg,
          icon: <Feather name="check-circle" size={14} color={colors.success} />,
        }
      case "cancelled":
        return {
          color: colors.error,
          backgroundColor: colors.error + "20",
          icon: <Feather name="x-circle" size={14} color={colors.error} />,
        }
      default:
        return {
          color: colors.textSecondary,
          backgroundColor: colors.cardBackground,
          icon: <Feather name="help-circle" size={14} color={colors.textSecondary} />,
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

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Feather name="shopping-bag" size={16} color={colors.primary} style={styles.activityIcon} />
      case "user":
        return <Feather name="user" size={16} color={colors.primary} style={styles.activityIcon} />
      case "product":
        return <Feather name="box" size={16} color={colors.primary} style={styles.activityIcon} />
      case "review":
        return <Feather name="star" size={16} color={colors.primary} style={styles.activityIcon} />
      default:
        return <Feather name="activity" size={16} color={colors.textSecondary} style={styles.activityIcon} />
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab()
      case "orders":
        return renderOrdersTab()
      case "inventory":
        return renderInventoryTab()
      case "activity":
        return renderActivityTab()
      default:
        return renderOverviewTab()
    }
  }

  const renderOverviewTab = () => {
    return (
      <>
        <View style={styles.statsContainer}>
          {renderStatCard(
            "Products",
            stats.products,
            <Feather name="box" size={24} color={colors.primary} />,
            0,
          )}
          {renderStatCard(
            "Orders",
            stats.orders,
            <Feather name="shopping-bag" size={24} color={colors.primary} />,
            1,
          )}
          {renderStatCard("Users", stats.users, <Feather name="users" size={24} color={colors.primary} />, 2)}
          {renderStatCard(
            "Revenue",
            stats.revenue,
            <Feather name="dollar-sign" size={24} color={colors.primary} />,
            3,
          )}
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Sales</Text>
            <TouchableOpacity onPress={navigateToAnalytics}>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <LineChart
            data={salesData}
            width={width - spacing.lg * 2 - spacing.xs * 2}
            height={180}
            chartConfig={{
              backgroundColor: colors.cardBackground,
              backgroundGradientFrom: colors.cardBackground,
              backgroundGradientTo: colors.cardBackground,
              fillShadowGradientFrom: colors.primary,
              fillShadowGradientFromOpacity: 0.3,
              fillShadowGradientTo: colors.cardBackground,
              fillShadowGradientToOpacity: 0.05,
              decimalPlaces: 0,
              color: (opacity = 1) => `${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
              labelColor: (opacity = 1) => `${colors.textSecondary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
              propsForLabels: {
                fontSize: typography.fontSizeXs,
                fontWeight: typography.fontWeightMedium,
                fontFamily: typography.fontFamilyMedium,
              },
              style: {
                paddingRight: 0,
                paddingLeft: 0,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: colors.primary,
                fill: colors.cardBackground,
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: colors.border + '60',
                strokeWidth: 0.5,
              },
              withInnerLines: false,
              withOuterLines: true,
              withShadow: false,
            }}
            bezier
            style={styles.chart}
            fromZero
            chartPaddingRight={spacing.md}
            chartPaddingLeft={spacing.md}
          />
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Feather name="plus-square" size={24} color={colors.primary} style={styles.quickActionIconStyle} />
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Feather name="shopping-bag" size={24} color={colors.primary} style={styles.quickActionIconStyle} />
              <Text style={styles.quickActionText}>New Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={navigateToAnalytics}>
              <Feather name="bar-chart-2" size={24} color={colors.primary} style={styles.quickActionIconStyle} />
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
                  <Feather name="download" size={16} color={colors.primary} />
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
              <Feather name="inbox" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          ) : (
            recentOrders.map((item) => {
              const statusStyle = getStatusStyle(item.status)

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.orderCard}
                  onPress={() => navigateToOrderDetails(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      {statusStyle.icon}
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={styles.orderCustomer}>
                    <Feather name="user" size={14} color={colors.textSecondary} />
                    <Text style={styles.customerName}>{item.customer || "Unknown"}</Text>
                  </View>

                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    <Text style={styles.orderTotal}>${item.total?.toFixed(2) ?? "N/A"}</Text>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </>
    )
  }

  const renderOrdersTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <Text style={styles.filterButtonTextActive}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Shipped</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Delivered</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Orders</Text>
          <View style={styles.sectionHeaderActions}>
            <TouchableOpacity onPress={handleExportOrders} disabled={isExporting} style={styles.exportButton}>
              {isExporting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather name="download" size={16} color={colors.primary} />
              )}
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {recentOrders.map((item) => {
          const statusStyle = getStatusStyle(item.status)

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.orderCard}
              onPress={() => navigateToOrderDetails(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  {statusStyle.icon}
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.orderCustomer}>
                <Feather name="user" size={14} color={colors.textSecondary} />
                <Text style={styles.customerName}>{item.customer || "Unknown"}</Text>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.orderTotal}>${item.total?.toFixed(2) ?? "N/A"}</Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.orderActionButton}>
                  <Feather name="eye" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderActionButton}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderActionButton}>
                  <Feather name="trash-2" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  const renderInventoryTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Feather name="refresh-cw" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {inventoryAlerts.map((item) => (
          <View key={item.id} style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <Feather name="alert-triangle" size={20} color={colors.error} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{item.name}</Text>
              <Text style={styles.alertDescription}>
                Only <Text style={styles.alertHighlight}>{item.stock} items</Text> left in stock
              </Text>
            </View>
            <TouchableOpacity style={styles.alertAction}>
              <Text style={styles.alertActionText}>Restock</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory Management</Text>
        </View>

        <View style={styles.inventoryActions}>
          <TouchableOpacity style={styles.inventoryActionButton}>
            <Feather name="list" size={20} color={colors.primary} />
            <Text style={styles.inventoryActionText}>All Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inventoryActionButton}>
            <Feather name="plus" size={20} color={colors.primary} />
            <Text style={styles.inventoryActionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inventoryActionButton}>
            <Feather name="edit" size={20} color={colors.primary} />
            <Text style={styles.inventoryActionText}>Bulk Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inventoryActionButton}>
            <Feather name="download" size={20} color={colors.primary} />
            <Text style={styles.inventoryActionText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderActivityTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Feather name="refresh-cw" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentActivity.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            {renderActivityIcon(item.type)}
            <View style={styles.activityContent}>
              <Text style={styles.activityMessage}>{item.message}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>SuriAddis Admin</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="search" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
            <Feather name="bell" size={22} color={colors.textSecondary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <View>
            <TouchableOpacity style={styles.avatarContainer} onPress={toggleDropdown}>
              <Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.avatar} />
            </TouchableOpacity>
            <Modal visible={dropdownVisible} transparent={true} animationType="fade" onRequestClose={closeDropdown}>
              <TouchableWithoutFeedback onPress={closeDropdown}>
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={navigateToSettings}>
                  <Feather name="settings" size={18} color={colors.textSecondary} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={navigateToUserManagement}>
                  <Feather name="users" size={18} color={colors.textSecondary} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownText}>User Management</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={closeDropdown}>
                  <Feather name="log-out" size={18} color={colors.error} style={styles.dropdownIcon} />
                  <Text style={[styles.dropdownText, { color: colors.error }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        </View>
      </Animated.View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "overview" && styles.tabButtonActive]}
          onPress={() => setActiveTab("overview")}
        >
          <Feather name="grid" size={18} color={activeTab === "overview" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === "overview" && styles.tabButtonTextActive]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "orders" && styles.tabButtonActive]}
          onPress={() => setActiveTab("orders")}
        >
          <Feather
            name="shopping-bag"
            size={18}
            color={activeTab === "orders" ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === "orders" && styles.tabButtonTextActive]}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "inventory" && styles.tabButtonActive]}
          onPress={() => setActiveTab("inventory")}
        >
          <Feather name="box" size={18} color={activeTab === "inventory" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === "inventory" && styles.tabButtonTextActive]}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "activity" && styles.tabButtonActive]}
          onPress={() => setActiveTab("activity")}
        >
          <Feather name="activity" size={18} color={activeTab === "activity" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === "activity" && styles.tabButtonTextActive]}>Activity</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderTabContent()}
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
  loadingContent: {
    width: "80%",
    padding: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: colors.cardBackground,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: spacing.md,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    borderRadius: spacing.sm,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary + "30",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 65 : 75,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownIcon: {
    marginRight: spacing.md,
  },
  dropdownText: {
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primary + "15",
  },
  tabButtonText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeightMedium,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  tabContent: {
    marginTop: spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    width: (width - (spacing.lg * 2 + spacing.md)) / 2,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTextContainer: {
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  statCardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.white,
    opacity: 0.1,
    borderBottomLeftRadius: spacing.lg,
    borderBottomRightRadius: spacing.lg,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    marginVertical: 0,
    borderRadius: spacing.md,
    padding: 0,
    margin: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  viewAllText: {
    fontSize: typography.fontSizeXs,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.md,
  },
  quickActionsContainer: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: (width - (spacing.lg * 2 + spacing.md * 2)) / 3,
    height: 90,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconStyle: {
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSizeXs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
  },
  recentOrdersContainer: {
    marginBottom: spacing.lg,
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
    borderRadius: spacing.md,
  },
  exportButtonText: {
    fontSize: typography.fontSizeXs,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  orderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: "capitalize",
    marginLeft: spacing.xs,
  },
  orderCustomer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  customerName: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderActionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.xs,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.md,
    marginRight: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeightMedium,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  alertDescription: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  alertHighlight: {
    color: colors.error,
    fontWeight: typography.fontWeightBold,
  },
  alertAction: {
    backgroundColor: colors.error + "15",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
  },
  alertActionText: {
    fontSize: typography.fontSizeXs,
    color: colors.error,
    fontWeight: typography.fontWeightMedium,
  },
  inventoryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inventoryActionButton: {
    width: (width - (spacing.lg * 2 + spacing.md)) / 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inventoryActionText: {
    fontSize: typography.fontSizeSm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.sm,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: typography.fontSizeSm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
})
