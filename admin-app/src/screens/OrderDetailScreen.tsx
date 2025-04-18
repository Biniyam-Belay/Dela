import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error) Alert.alert('Error', error.message);
      setOrder(data);
      setLoading(false);
    };
    loadOrder();
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    setUpdating(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setOrder({ ...order, status: newStatus });
      Alert.alert('Success', 'Order status updated!');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.id}</Text>
      <Text>Status: {order.status || 'N/A'}</Text>
      <Text>Total: ${order.total ?? 'N/A'}</Text>
      <Text>User ID: {order.user_id}</Text>
      <Text>Date: {new Date(order.created_at).toLocaleString()}</Text>
      {/* Add more order details here as needed */}
      <View style={styles.statusRow}>
        <Button title="Mark as Pending" onPress={() => updateStatus('pending')} disabled={updating} />
        <Button title="Mark as Shipped" onPress={() => updateStatus('shipped')} disabled={updating} />
        <Button title="Mark as Delivered" onPress={() => updateStatus('delivered')} disabled={updating} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
