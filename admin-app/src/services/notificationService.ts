import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabaseClient';

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return null;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return null;
  }
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  // Save the token to Supabase, associated with the admin user
  await savePushTokenToSupabase(userId, token);
  return token;
}

export async function savePushTokenToSupabase(userId: string, token: string) {
  // You should have a table (e.g., admin_push_tokens) in Supabase for this
  const { error } = await supabase
    .from('admin_push_tokens')
    .upsert({ user_id: userId, token });
  if (error) {
    console.error('Error saving push token:', error);
  }
}

export async function fetchAdminNotifications() {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
