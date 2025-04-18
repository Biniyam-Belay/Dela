import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { fetchAdminNotifications } from '../services/notificationService';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data || []);
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  notification: { marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2' },
  type: { fontWeight: 'bold', color: '#007bff' },
  titleText: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  body: { marginTop: 4 },
  date: { marginTop: 4, fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
});
