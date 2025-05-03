"use client"
import { useState } from "react"
import { BarChart3, CircleDollarSign, LineChart, Package, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { cn, formatCurrency } from "../../utils/utils"

// Mock Data
const MOCK_SALES_DATA = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [1200, 1900, 1500, 2800, 2200, 3100, 2700] }],
    currentPeriod: 15400,
    percentChange: 23.2,
  },
  "30D": {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [{ data: [10200, 12900, 9500, 14800] }],
    currentPeriod: 47400,
    percentChange: 12.9,
  },
  "3M": {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data: [32000, 38000, 42000] }],
    currentPeriod: 112000,
    percentChange: 6.7,
  },
}

const MOCK_ORDER_STATUS = {
  "7D": [
    { name: "Delivered", count: 150, color: "#10b981" },
    { name: "Shipped", count: 45, color: "#6366f1" },
    { name: "Pending", count: 25, color: "#f59e0b" },
    { name: "Cancelled", count: 10, color: "#ef4444" },
  ],
  "30D": [
    { name: "Delivered", count: 580, color: "#10b981" },
    { name: "Shipped", count: 120, color: "#6366f1" },
    { name: "Pending", count: 85, color: "#f59e0b" },
    { name: "Cancelled", count: 35, color: "#ef4444" },
  ],
  "3M": [
    { name: "Delivered", count: 1750, color: "#10b981" },
    { name: "Shipped", count: 320, color: "#6366f1" },
    { name: "Pending", count: 180, color: "#f59e0b" },
    { name: "Cancelled", count: 90, color: "#ef4444" },
  ],
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
}

const MOCK_CUSTOMERS_DATA = {
  "7D": { total: 120, new: 15, returning: 105, percentChange: 5.2 },
  "30D": { total: 480, new: 60, returning: 420, percentChange: 3.8 },
  "3M": { total: 1400, new: 180, returning: 1220, percentChange: 2.1 },
}

const MOCK_CUSTOMERS_GROWTH = {
  "7D": [10, 12, 15, 13, 14, 16, 15],
  "30D": [40, 45, 50, 55, 60, 65, 70, 75],
  "3M": [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170],
}

const MOCK_INSIGHTS = [
  { title: "Best Day for Sales", value: "Friday", icon: TrendingUp, color: "text-emerald-500 bg-emerald-50" },
  { title: "Top Customer Segment", value: "Returning", icon: Users, color: "text-violet-500 bg-violet-50" },
  { title: "Most Cancelled Product", value: "Board", icon: BarChart3, color: "text-rose-500 bg-rose-50" },
]

const TIME_PERIODS = ["7D", "30D", "3M"]
const TABS = ["Sales", "Orders", "Customers", "Insights"]

const formatCurrencyETB = (value) => formatCurrency(value, 'ETB', 'en-ET')

const formatNumber = (value) => value.toLocaleString()

const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
  changeColor = "",
  iconColor = "text-slate-700",
  iconBg = "bg-slate-100",
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-full", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      {change !== undefined && (
        <p
          className={cn(
            "text-xs mt-2 font-medium flex items-center",
            change >= 0 ? "text-emerald-500" : "text-rose-500",
            changeColor,
          )}
        >
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
          )}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% vs last period
        </p>
      )}
    </CardContent>
  </Card>
)

const ChartCard = ({ title, children }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <div className="h-[300px]">{children}</div>
    </CardContent>
  </Card>
)

export default function AdminAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("30D")
  const [activeTab, setActiveTab] = useState("Sales")

  const salesData = MOCK_SALES_DATA[selectedPeriod]
  const orderStatusData = MOCK_ORDER_STATUS[selectedPeriod]
  const topProductsData = MOCK_TOP_PRODUCTS[selectedPeriod]
  const customersData = MOCK_CUSTOMERS_DATA[selectedPeriod]
  const customersGrowthData = MOCK_CUSTOMERS_GROWTH[selectedPeriod].map((val, idx) => ({
    name: salesData.labels[idx % salesData.labels.length],
    customers: val,
  }))

  // Prepare data for charts
  const lineChartData = salesData.labels.map((label, index) => ({
    name: label,
    revenue: salesData.datasets[0].data[index],
  }))

  const barChartData = topProductsData.labels.map((label, index) => ({
    name: label,
    units: topProductsData.datasets[0].data[index],
  }))

  const renderSalesTab = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrencyETB(salesData.currentPeriod)}
          change={salesData.percentChange}
          icon={CircleDollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="Avg. Order Value"
          value={formatCurrencyETB(
            salesData.currentPeriod / (orderStatusData.reduce((sum, item) => sum + item.count, 0) || 1),
          )}
          change={8.5}
          icon={ShoppingBag}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <KPICard
          title="Conversion Rate"
          value="4.2%"
          change={1.8}
          icon={LineChart}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <KPICard
          title="Profit Margin"
          value="32.8%"
          change={-2.1}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Over Time">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => formatCurrencyETB(value)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => formatCurrencyETB(value)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Selling Products (Units)">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend />
              <Bar dataKey="units" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )

  const renderOrdersTab = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Orders"
          value={formatNumber(orderStatusData.reduce((sum, item) => sum + item.count, 0))}
          change={12.3}
          icon={Package}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <KPICard
          title="Conversion Rate"
          value="3.8%"
          change={0.5}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="Avg. Processing Time"
          value="1.2 days"
          change={-8.3}
          icon={Zap}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <KPICard
          title="Return Rate"
          value="2.1%"
          change={-0.4}
          icon={ShoppingBag}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Order Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                paddingAngle={2}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatNumber(value)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={10} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Orders Over Time">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => Math.round((value) / 100)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                labelFormatter={(label) => `Orders: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                name="Orders"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                fillOpacity={1}
                fill="url(#colorOrders)"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )

  const renderCustomersTab = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Customers"
          value={formatNumber(customersData.total)}
          change={customersData.percentChange}
          icon={Users}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <KPICard
          title="New Customers"
          value={formatNumber(customersData.new)}
          change={2.1}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="Returning Customers"
          value={formatNumber(customersData.returning)}
          change={1.2}
          icon={Users}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <KPICard
          title="Customer Lifetime Value"
          value={formatCurrencyETB(salesData.currentPeriod / customersData.total)}
          change={3.5}
          icon={CircleDollarSign}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Customer Growth Over Time">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={customersGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                fillOpacity={1}
                fill="url(#colorCustomers)"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer Segmentation">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={[
                  { name: "New", value: customersData.new, color: "#10b981" },
                  { name: "Returning", value: customersData.returning, color: "#6366f1" },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                paddingAngle={2}
              >
                {[
                  { name: "New", value: customersData.new, color: "#10b981" },
                  { name: "Returning", value: customersData.returning, color: "#6366f1" },
                ].map((entry, index) => (
                  <Cell key={`cell-cust-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatNumber(value)}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={10} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )

  const renderInsightsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_INSIGHTS.map((insight, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start p-6">
              <div className={cn("p-3 rounded-full mr-4", insight.color.split(" ")[1])}>
                <insight.icon className={cn("h-6 w-6", insight.color.split(" ")[0])} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{insight.title}</p>
                <h3 className="text-lg font-bold mt-1">{insight.value}</h3>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500"></div>
          </CardContent>
        </Card>
      ))}

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium">Optimize Friday Promotions</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Friday is your best-performing day. Consider launching new products or special promotions on Fridays
                  to maximize revenue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-emerald-50">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-medium">Focus on Customer Retention</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your returning customers make up 87% of your customer base. Implement a loyalty program to further
                  increase retention.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-rose-50">
                <Package className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h4 className="font-medium">Address Board Product Issues</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The Board product has the highest cancellation rate. Investigate quality issues or improve product
                  description to set better expectations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1 text-sm">Overview of your store's performance.</p>
        </div>
        {/* Time Period Selector */}
        <div className="flex flex-wrap gap-1 rounded-md overflow-hidden border border-slate-200 bg-white p-1">
          {TIME_PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded ${selectedPeriod === period ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 sm:px-6 pt-4 pb-0">
        <nav className="-mb-px flex space-x-6 border-b border-slate-100" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Only show charts and KPIs once per tab */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {activeTab === 'Sales' && renderSalesTab()}
        {activeTab === 'Orders' && renderOrdersTab()}
        {activeTab === 'Customers' && renderCustomersTab()}
        {activeTab === 'Insights' && renderInsightsTab()}
      </div>
    </div>
  )
}
