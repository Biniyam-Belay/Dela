import { Button, View, Text, StyleSheet } from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function SettingsScreen({ onLogout }: { onLogout: () => void }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 24 },
});
