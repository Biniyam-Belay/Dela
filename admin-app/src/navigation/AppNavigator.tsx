import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AddEditProductScreen from '../screens/AddEditProductScreen';
import OrdersScreen from '../screens/OrdersScreen';
import UsersScreen from '../screens/UsersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CustomTabBar from '../components/CustomTabBar';
import ControlPanelScreen from '../screens/ControlPanelScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Products: undefined;
  ProductDetails: { productId: string };
  AddEditProduct: { productId?: string };
  Orders: undefined;
  OrderDetails: { orderId: string };
  Categories: undefined;
  Users: undefined;
  UserDetail: { userId: string };
  UserAddEdit: { userId?: string };
  Settings: undefined;
  Notifications: undefined;
  ControlPanel: undefined;
  Analytics: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const UserStack = createNativeStackNavigator();

function UserStackNavigator() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UserList" component={UsersScreen} />
      <UserStack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </UserStack.Navigator>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Users" component={UserStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs">
          {props => <MainTabs {...props} onLogout={onLogout} />}
        </RootStack.Screen>
        <RootStack.Screen
          name="Products"
          component={ProductsScreen}
          options={{ headerShown: true, title: 'Products' }}
        />
        <RootStack.Screen
          name="AddEditProduct"
          component={AddEditProductScreen}
          options={{ headerShown: true, title: 'Add/Edit Product' }}
        />
        <RootStack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ headerShown: true, title: 'Order Detail' }}
        />
        <RootStack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ headerShown: true, title: 'Categories' }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings' }}
        />
        <RootStack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ headerShown: true, title: 'Analytics' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}