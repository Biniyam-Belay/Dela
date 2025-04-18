import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders with user and total fields (customize as needed)
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, user_id')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.order}>
            <Text style={styles.orderId} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
              Order #{item.id}
            </Text>
            <Text>Status: {item.status || 'N/A'}</Text>
            <Text>Total: ${item.total ?? 'N/A'}</Text>
            <Text>User ID: {item.user_id}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  order: { marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2' },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  date: { marginTop: 4, fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
});
