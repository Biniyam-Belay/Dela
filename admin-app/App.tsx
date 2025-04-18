import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './src/services/supabaseClient';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import Toast from 'react-native-toast-message'; // Import Toast

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app start
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        setUserId(data.session.user.id);
      }
      setLoading(false);
    };
    restoreSession();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      registerForPushNotificationsAsync(userId);
    }
  }, [userId]);

  if (loading) return null;
  if (!userId) {
    return (
      <>
        <LoginScreen onLogin={setUserId} />
        <Toast />{/* Add Toast component here */}
      </>
    );
  }

  return (
    <>
      <AppNavigator onLogout={() => setUserId(null)} />
      <Toast />{/* Add Toast component here */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
