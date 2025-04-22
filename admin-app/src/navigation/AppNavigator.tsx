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

const RootStack = createNativeStackNavigator();
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
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={ControlPanelScreen} />
      <Tab.Screen name="Exchange" component={NotificationsScreen} />
      <Tab.Screen name="Markets" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={UserStackNavigator} />
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
      </RootStack.Navigator>
    </NavigationContainer>
  );
}