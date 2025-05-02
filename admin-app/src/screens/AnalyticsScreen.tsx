"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
} from "react-native"
import { LineChart, BarChart, PieChart, ContributionGraph } from "react-native-chart-kit"
import { colors, spacing, typography } from "../theme"
import { Feather } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

// Time period options for filtering
const TIME_PERIODS = ["7D", "30D", "3M", "6M", "1Y", "All"]

// Mock data - replace with actual data fetching
const MOCK_SALES_DATA = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [1200, 1900, 1500, 2800, 2200, 3100, 2700] }],
    previousPeriod: 12500,
    currentPeriod: 15400,
    percentChange: 23.2,
  },
  "30D": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [10200, 12900, 9500, 14800] }],
    previousPeriod: 42000,
    currentPeriod: 47400,
    percentChange: 12.9,
  },
  "3M": {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data: [32000, 38000, 42000] }],
    previousPeriod: 105000,
    currentPeriod: 112000,
    percentChange: 6.7,
  },
  "6M": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [32000, 38000, 42000, 39000, 45000, 48000] }],
    previousPeriod: 220000,
    currentPeriod: 244000,
    percentChange: 10.9,
  },
  "1Y": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ data: [32000, 38000, 42000, 39000, 45000, 48000, 52000, 49000, 53000, 57000, 62000, 68000] }],
    previousPeriod: 480000,
    currentPeriod: 585000,
    percentChange: 21.9,
  },
  All: {
    labels: ["2019", "2020", "2021", "2022", "2023"],
    datasets: [{ data: [380000, 420000, 490000, 585000, 680000] }],
    previousPeriod: 1875000,
    currentPeriod: 2555000,
    percentChange: 36.3,
  },
}

const MOCK_TOP_PRODUCTS = {
  "7D": {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [50, 35, 28, 22, 18] }],
  },
  "30D": {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [210, 175, 120, 95, 80] }],
  },
  "3M": {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [620, 540, 380, 290, 240] }],
  },
  "6M": {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [1250, 980, 760, 580, 490] }],
  },
  "1Y": {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [2450, 1980, 1560, 1280, 990] }],
  },
  All: {
    labels: ["Coffee", "Mug", "Tea", "Board", "Utensils"],
    datasets: [{ data: [5250, 4180, 3560, 2980, 2490] }],
  },
}

const MOCK_ORDER_STATUS = {
  "7D": [
    { name: "Delivered", count: 150, color: colors.success, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Shipped", count: 45, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 25, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 10, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "30D": [
    { name: "Delivered", count: 580, color: colors.success, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Shipped", count: 120, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 85, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 35, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "3M": [
    {
      name: "Delivered",
      count: 1750,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    { name: "Shipped", count: 320, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 180, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 90, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "6M": [
    {
      name: "Delivered",
      count: 3450,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    { name: "Shipped", count: 580, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 320, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 150, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "1Y": [
    {
      name: "Delivered",
      count: 6850,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    { name: "Shipped", count: 980, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 520, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 320, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  All: [
    {
      name: "Delivered",
      count: 12850,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    { name: "Shipped", count: 1580, color: colors.info, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Pending", count: 820, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Cancelled", count: 650, color: colors.error, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
}

const MOCK_USER_GROWTH = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [5, 8, 6, 9, 12, 15, 10] }],
    total: 65,
    percentChange: 8.3,
  },
  "30D": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [28, 35, 42, 50] }],
    total: 155,
    percentChange: 12.2,
  },
  "3M": {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data: [120, 145, 180] }],
    total: 445,
    percentChange: 15.6,
  },
  "6M": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [120, 145, 180, 210, 250, 290] }],
    total: 1195,
    percentChange: 18.9,
  },
  "1Y": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ data: [120, 145, 180, 210, 250, 290, 320, 350, 390, 420, 460, 500] }],
    total: 3635,
    percentChange: 22.5,
  },
  All: {
    labels: ["2019", "2020", "2021", "2022", "2023"],
    datasets: [{ data: [1200, 2500, 4800, 7500, 12000] }],
    total: 28000,
    percentChange: 60.0,
  },
}

const MOCK_SALES_BY_CATEGORY = {
  "7D": [
    { name: "Kitchen", sales: 5200, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 3800, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 2900, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 2100, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 1400, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "30D": [
    { name: "Kitchen", sales: 18500, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 12800, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 9200, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 7500, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 5400, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "3M": [
    { name: "Kitchen", sales: 48000, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 32000, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 24000, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 18000, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 12000, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "6M": [
    { name: "Kitchen", sales: 92000, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 68000, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 48000, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 36000, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 24000, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  "1Y": [
    { name: "Kitchen", sales: 185000, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 135000, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 98000, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 72000, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 48000, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
  All: [
    { name: "Kitchen", sales: 580000, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Dining", sales: 420000, color: colors.secondary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Decor", sales: 320000, color: colors.tertiary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bedroom", sales: 240000, color: colors.quaternary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: "Bath", sales: 180000, color: colors.quinary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ],
}

const MOCK_CUSTOMER_ACTIVITY = {
  "7D": [
    { date: "2023-01-01", count: 12 },
    { date: "2023-01-02", count: 8 },
    { date: "2023-01-03", count: 15 },
    { date: "2023-01-04", count: 10 },
    { date: "2023-01-05", count: 18 },
    { date: "2023-01-06", count: 22 },
    { date: "2023-01-07", count: 16 },
  ],
  "30D": Array.from({ length: 30 }, (_, i) => ({
    date: `2023-01-${(i + 1).toString().padStart(2, "0")}`,
    count: Math.floor(Math.random() * 20) + 5,
  })),
  "3M": Array.from({ length: 90 }, (_, i) => {
    const date = new Date(2023, 0, i + 1)
    return {
      date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`,
      count: Math.floor(Math.random() * 20) + 5,
    }
  }),
  "6M": Array.from({ length: 180 }, (_, i) => {
    const date = new Date(2023, 0, i + 1)
    return {
      date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`,
      count: Math.floor(Math.random() * 20) + 5,
    }
  }),
  "1Y": Array.from({ length: 365 }, (_, i) => {
    const date = new Date(2023, 0, i + 1)
    return {
      date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`,
      count: Math.floor(Math.random() * 20) + 5,
    }
  }),
  All: Array.from({ length: 365 }, (_, i) => {
    const date = new Date(2023, 0, i + 1)
    return {
      date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`,
      count: Math.floor(Math.random() * 20) + 5,
    }
  }),
}

// Muted color palette for charts
const chartColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  tertiary: colors.tertiary,
  quaternary: colors.quaternary,
  quinary: colors.quinary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
}

const chartConfigBase = {
  backgroundColor: colors.cardBackground,
  backgroundGradientFrom: colors.cardBackground,
  backgroundGradientTo: colors.cardBackground,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(121, 134, 203, ${opacity})`, // Muted indigo (used for lines/bars, not pie slices typically)
  labelColor: (opacity = 1) => `${colors.textSecondary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`, // Use theme secondary text color for labels
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: chartColors.primary,
    fill: colors.cardBackground,
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: colors.border + "60",
    strokeWidth: 0.5,
  },
}

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30D")
  const [activeTab, setActiveTab] = useState("sales")

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false)
      startAnimations()
    }, 1000)
    return () => clearTimeout(timer)
    // Replace with actual data fetching logic
    // fetchAnalyticsData().then(data => { ... setLoading(false); startAnimations(); });
  }, [])

  const startAnimations = () => {
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
    ]).start()
  }

  const formatCurrency = (value) => {
    return "$" + value.toLocaleString()
  }

  const formatNumber = (value) => {
    return value.toLocaleString()
  }

  const renderPercentChange = (value) => {
    const isPositive = value >= 0
    return (
      <View style={[styles.percentChangeContainer, isPositive ? styles.positiveChange : styles.negativeChange]}>
        <Feather
          name={isPositive ? "arrow-up-right" : "arrow-down-right"}
          size={14}
          color={isPositive ? colors.success : colors.error}
        />
        <Text style={[styles.percentChangeText, isPositive ? styles.positiveChangeText : styles.negativeChangeText]}>
          {Math.abs(value).toFixed(1)}%
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={chartColors.primary} />
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
      </View>
    )
  }

  const renderSalesTab = () => {
    const salesData = MOCK_SALES_DATA[selectedPeriod]
    const categoryData = MOCK_SALES_BY_CATEGORY[selectedPeriod]

    // Convert sales by category to format needed for PieChart
    const pieChartData = categoryData.map((item) => ({
      name: item.name,
      population: item.sales,
      color: item.color,
      legendFontColor: item.legendFontColor,
      legendFontSize: item.legendFontSize,
    }))

    return (
      <>
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <Text style={styles.kpiValue}>{formatCurrency(salesData.currentPeriod)}</Text>
            {renderPercentChange(salesData.percentChange)}
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Avg. Order Value</Text>
            <Text style={styles.kpiValue}>
              {formatCurrency(
                salesData.currentPeriod / MOCK_ORDER_STATUS[selectedPeriod].reduce((sum, item) => sum + item.count, 0),
              )}
            </Text>
            {renderPercentChange(8.5)} {/* Mock data */}
          </View>
        </View>

        {/* Sales Over Time */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue Over Time</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <LineChart
            data={salesData}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(121, 134, 203, ${opacity})`,
            }}
            bezier
            style={styles.chartStyle}
          />
          <View style={styles.chartFooter}>
            <View style={styles.chartLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: chartColors.primary }]} />
              <Text style={styles.chartLegendText}>Revenue</Text>
            </View>
          </View>
        </View>

        {/* Sales by Category */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales by Category</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <PieChart
            data={pieChartData}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={chartConfigBase}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chartStyle}
          />
        </View>

        {/* Top Selling Products */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Top Selling Products (Units)</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <BarChart
            data={MOCK_TOP_PRODUCTS[selectedPeriod]}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(100, 181, 246, ${opacity})`, // Muted blue
            }}
            verticalLabelRotation={0}
            style={styles.chartStyle}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
      </>
    )
  }

  const renderOrdersTab = () => {
    return (
      <>
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Orders</Text>
            <Text style={styles.kpiValue}>
              {formatNumber(MOCK_ORDER_STATUS[selectedPeriod].reduce((sum, item) => sum + item.count, 0))}
            </Text>
            {renderPercentChange(12.3)} {/* Mock data */}
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Conversion Rate</Text>
            <Text style={styles.kpiValue}>3.8%</Text>
            {renderPercentChange(0.5)} {/* Mock data */}
          </View>
        </View>

        {/* Order Status Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Order Status Distribution</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <PieChart
            data={MOCK_ORDER_STATUS[selectedPeriod]}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={chartConfigBase}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chartStyle}
          />
        </View>

        {/* Order Fulfillment Time */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Average Fulfillment Time (Days)</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [{ data: [3.2, 2.8, 2.5, 2.2, 1.9, 1.7] }],
            }}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(77, 208, 225, ${opacity})`, // Muted cyan
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>

        {/* Order Value Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Order Value Distribution</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <BarChart
            data={{
              labels: ["<$50", "$50-100", "$100-200", "$200-500", ">$500"],
              datasets: [{ data: [120, 180, 240, 90, 40] }],
            }}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(77, 182, 172, ${opacity})`, // Muted teal
            }}
            verticalLabelRotation={0}
            style={styles.chartStyle}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
      </>
    )
  }

  const renderCustomersTab = () => {
    const userData = MOCK_USER_GROWTH[selectedPeriod]

    return (
      <>
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Customers</Text>
            <Text style={styles.kpiValue}>{formatNumber(userData.total)}</Text>
            {renderPercentChange(userData.percentChange)}
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Repeat Purchase Rate</Text>
            <Text style={styles.kpiValue}>42%</Text>
            {renderPercentChange(3.5)} {/* Mock data */}
          </View>
        </View>

        {/* User Growth */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Customer Growth</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <LineChart
            data={userData}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(129, 199, 132, ${opacity})`, // Muted green
              propsForDots: {
                ...chartConfigBase.propsForDots,
                stroke: chartColors.success,
              },
            }}
            bezier
            style={styles.chartStyle}
            fromZero
          />
        </View>

        {/* Customer Activity Heatmap */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Customer Activity</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ContributionGraph
            values={MOCK_CUSTOMER_ACTIVITY[selectedPeriod]}
            endDate={new Date("2023-01-31")}
            numDays={selectedPeriod === "7D" ? 7 : selectedPeriod === "30D" ? 30 : 90}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={{
              ...chartConfigBase,
              color: (opacity = 1) => `rgba(100, 181, 246, ${opacity})`, // Muted blue
            }}
            style={styles.chartStyle}
          />
          <Text style={styles.chartNote}>Customer purchase activity heatmap</Text>
        </View>

        {/* Customer Segmentation */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Customer Segmentation</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Feather name="download" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <PieChart
            data={[
              {
                name: "New",
                population: 35,
                color: chartColors.primary,
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
              },
              {
                name: "Returning",
                population: 42,
                color: chartColors.secondary,
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
              },
              {
                name: "Loyal",
                population: 23,
                color: chartColors.tertiary,
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
              },
            ]}
            width={width - spacing.lg * 2 - spacing.md * 2}
            height={220}
            chartConfig={chartConfigBase}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chartStyle}
          />
        </View>
      </>
    )
  }

  const renderInsightsTab = () => {
    return (
      <>
        {/* Insights Cards */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: `${chartColors.success}30` }]}>
              <Feather name="trending-up" size={20} color={chartColors.success} />
            </View>
            <Text style={styles.insightTitle}>Revenue Growth</Text>
          </View>
          <Text style={styles.insightDescription}>
            Your revenue has increased by {MOCK_SALES_DATA[selectedPeriod].percentChange.toFixed(1)}% compared to the
            previous period.
          </Text>
          <View style={styles.insightAction}>
            <Text style={styles.insightActionText}>View detailed report</Text>
            <Feather name="chevron-right" size={16} color={chartColors.primary} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: `${chartColors.warning}30` }]}>
              <Feather name="alert-circle" size={20} color={chartColors.warning} />
            </View>
            <Text style={styles.insightTitle}>Inventory Alert</Text>
          </View>
          <Text style={styles.insightDescription}>
            5 products are running low on inventory. Consider restocking soon to avoid stockouts.
          </Text>
          <View style={styles.insightAction}>
            <Text style={styles.insightActionText}>View inventory</Text>
            <Feather name="chevron-right" size={16} color={chartColors.primary} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: `${chartColors.info}30` }]}>
              <Feather name="users" size={20} color={chartColors.info} />
            </View>
            <Text style={styles.insightTitle}>Customer Retention</Text>
          </View>
          <Text style={styles.insightDescription}>
            Your customer retention rate is 42%, which is 3.5% higher than the previous period.
          </Text>
          <View style={styles.insightAction}>
            <Text style={styles.insightActionText}>View customer details</Text>
            <Feather name="chevron-right" size={16} color={chartColors.primary} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: `${chartColors.primary}30` }]}>
              <Feather name="star" size={20} color={chartColors.primary} />
            </View>
            <Text style={styles.insightTitle}>Top Performing Product</Text>
          </View>
          <Text style={styles.insightDescription}>
            "Organic Coffee Beans" is your best-selling product with{" "}
            {MOCK_TOP_PRODUCTS[selectedPeriod].datasets[0].data[0]} units sold in this period.
          </Text>
          <View style={styles.insightAction}>
            <Text style={styles.insightActionText}>View product details</Text>
            <Feather name="chevron-right" size={16} color={chartColors.primary} />
          </View>
        </View>
      </>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "sales":
        return renderSalesTab()
      case "orders":
        return renderOrdersTab()
      case "customers":
        return renderCustomersTab()
      case "insights":
        return renderInsightsTab()
      default:
        return renderSalesTab()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="settings" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.periodSelector}>
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "sales" && styles.tabButtonActive]}
          onPress={() => setActiveTab("sales")}
        >
          <Feather
            name="dollar-sign"
            size={18}
            color={activeTab === "sales" ? chartColors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === "sales" && styles.tabButtonTextActive]}>Sales</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "orders" && styles.tabButtonActive]}
          onPress={() => setActiveTab("orders")}
        >
          <Feather
            name="shopping-bag"
            size={18}
            color={activeTab === "orders" ? chartColors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === "orders" && styles.tabButtonTextActive]}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "customers" && styles.tabButtonActive]}
          onPress={() => setActiveTab("customers")}
        >
          <Feather
            name="users"
            size={18}
            color={activeTab === "customers" ? chartColors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === "customers" && styles.tabButtonTextActive]}>Customers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "insights" && styles.tabButtonActive]}
          onPress={() => setActiveTab("insights")}
        >
          <Feather
            name="trending-up"
            size={18}
            color={activeTab === "insights" ? chartColors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === "insights" && styles.tabButtonTextActive]}>Insights</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveTab()}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "android" ? 40 : spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  headerAction: {
    padding: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.cardBackground,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
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
    borderRadius: spacing.lg,
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
    color: chartColors.primary,
    fontWeight: typography.fontWeightMedium,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  periodButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
  },
  periodButtonActive: {
    backgroundColor: `${chartColors.primary}20`,
  },
  periodButtonText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  periodButtonTextActive: {
    color: chartColors.primary,
    fontWeight: typography.fontWeightBold,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
    backgroundColor: `${chartColors.primary}15`,
  },
  tabButtonText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeightMedium,
  },
  tabButtonTextActive: {
    color: chartColors.primary,
    fontWeight: typography.fontWeightBold,
  },
  scrollView: {
    flex: 1,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  kpiCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  percentChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    alignSelf: "flex-start",
  },
  positiveChange: {
    backgroundColor: `${colors.success}20`,
  },
  negativeChange: {
    backgroundColor: `${colors.error}20`,
  },
  percentChangeText: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    marginLeft: 2,
  },
  positiveChangeText: {
    color: colors.success,
  },
  negativeChangeText: {
    color: colors.error,
  },
  chartCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textPrimary,
  },
  chartAction: {
    padding: spacing.xs,
  },
  chartStyle: {
    marginVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  chartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  chartLegendText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  chartNote: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  insightTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textPrimary,
  },
  insightDescription: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  insightAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightActionText: {
    fontSize: typography.fontSizeXs,
    color: chartColors.primary,
    fontWeight: typography.fontWeightMedium,
    marginRight: spacing.xs,
  },
})
