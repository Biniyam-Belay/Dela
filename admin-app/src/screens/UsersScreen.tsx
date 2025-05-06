import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const colors = {
  primary: '#6C5CE7',
  secondary: '#A29BFE',
  background: '#F9FAFF',
  cardBackground: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  success: '#00B894',
  error: '#D63031',
  warning: '#FDCB6E',
  border: '#E0E0E0',
  white: '#FFFFFF',
  darkPurple: '#4B3F72',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const typography = {
  fontSizeSm: 12,
  fontSizeMd: 14,
  fontSizeLg: 16,
  fontSizeXl: 20,
  fontSizeXxl: 24,
  fontWeightMedium: '500',
  fontWeightBold: '700',
  fontFamilyRegular: 'Inter-Regular',
  fontFamilyMedium: 'Inter-Medium',
  fontFamilyBold: 'Inter-Bold',
};

const constants = {
  borderRadiusSm: 8,
  borderRadiusMd: 12,
  borderRadiusLg: 16,
};

interface User {
  id: string;
  email: string | undefined;
  created_at: string;
  name: string;
}

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@suriaddis.com', created_at: new Date().toISOString(), name: 'Admin User' },
  { id: '2', email: 'user1@example.com', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), name: 'User One' },
  { id: '3', email: 'user2@example.com', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), name: 'User Two' },
];

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadUsers = useCallback(async () => {
    let gotUsers = false;
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = { data: null, error: null };

      if (fetchError) throw fetchError;

      await new Promise(resolve => setTimeout(resolve, 500));

      if (data && (data as any).users && (data as any).users.length > 0) {
        setUsers((data as any).users.map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'No Name',
        })));
        gotUsers = true;
      } else {
        setUsers(MOCK_USERS);
        gotUsers = true;
      }
    } catch (e: any) {
      console.error("Error loading users:", e);
      setError(e.message || 'Failed to fetch users.');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();

      return () => {
        fadeAnim.setValue(0);
      };
    }, [loadUsers, fadeAnim])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, [loadUsers]);

  const handleUserPress = (user: User) => {
    navigation.navigate('UserDetail', { user });
  };

  const renderListHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Users</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmptyComponent = () => (
    <Animated.View style={[styles.centered, { opacity: fadeAnim }]}>
      <Ionicons name="people-outline" size={72} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No users found</Text>
      <Text style={styles.emptySubText}>Pull down to refresh or check connection.</Text>
    </Animated.View>
  );

  const renderUserItem = ({ item }: { item: User }) => {
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scaleValue, { toValue: 0.98, friction: 3, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: fadeAnim }}>
        <TouchableOpacity
          onPress={() => handleUserPress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          <View style={styles.listItemCard}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle-outline" size={40} color={colors.primary} style={styles.userIcon} />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
            <Text style={styles.userDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={72} color={colors.error} />
          <Text style={styles.errorText}>Error loading users</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity onPress={loadUsers} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.cardBackground}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerContent: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizeXxl + 4,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  listItemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    padding: spacing.md,
    shadowColor: colors.darkPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userIcon: {
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.fontSizeLg,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  userEmail: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  userDate: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  separator: {
    height: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
  },
  emptyText: {
    fontSize: typography.fontSizeXl,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorText: {
    fontSize: typography.fontSizeXl,
    color: colors.error,
    fontFamily: typography.fontFamilyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: constants.borderRadiusMd,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyMedium,
  },
});
