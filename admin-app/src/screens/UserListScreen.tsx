import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import UserListItem, { User } from '../components/UserListItem';

// Updated color palette for modern aesthetic
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
  darkPurple: '#4B3F72'
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
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
  fontFamilyBold: 'Inter-Bold'
};

const constants = {
  borderRadiusSm: 8,
  borderRadiusMd: 12,
  borderRadiusLg: 16
};

// Mock User Data (Replace with actual API call)
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?img=1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: '2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/150?img=2', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: '3', name: 'Charlie Chaplin', email: 'charlie@example.com', role: 'Viewer', avatarUrl: 'https://i.pravatar.cc/150?img=3', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/150?img=4', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
  { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?img=5', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
];

// Define Param List for type safety (adjust screen names as needed)
type RootStackParamList = {
  UserList: undefined;
  UserDetail: { user: User };
  AddUser: undefined; // Assuming an AddUser screen exists
};

// Define Navigation Prop Type for this screen
type UserListNavigationProp = RouteProp<RootStackParamList, 'UserList'>;

export default function UserListScreen() {
  const navigation = useNavigation<any>();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadUsers = useCallback(async () => {
    if (!refreshing) setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAllUsers(MOCK_USERS);
      setFilteredUsers(MOCK_USERS);
    } catch (e: any) {
      console.error("Failed to load users:", e);
      setError(e.message || "An unexpected error occurred.");
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
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
        easing: Easing.out(Easing.quad)
      }).start();
      return () => fadeAnim.setValue(0);
    }, [loadUsers, fadeAnim])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchTerm('');
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(allUsers);
    } else {
      const lowerCaseTerm = searchTerm.toLowerCase();
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(lowerCaseTerm) ||
        user.email.toLowerCase().includes(lowerCaseTerm) ||
        user.role?.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const handleUserPress = (user: User) => {
    navigation.navigate('UserDetail', { user });
  };

  const handleAddUser = () => {
    console.log("Navigate to Add User Screen");
  };

  const renderEmptyComponent = () => (
    <Animated.View style={[styles.centered, { opacity: fadeAnim }]}>
      <Ionicons name="sad-outline" size={72} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No users found</Text>
      {searchTerm ? (
        <Text style={styles.emptySubText}>Your search "{searchTerm}" did not match any users.</Text>
      ) : (
        <Text style={styles.emptySubText}>There are no users to display currently.</Text>
      )}
    </Animated.View>
  );

  const renderListHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading ? 'Loading...' : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or role..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchTerm.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderUserItem = ({ item }: { item: User }) => {
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scaleValue, { toValue: 0.98, friction: 4, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    return (
      <Animated.View style={{
        transform: [{ scale: scaleValue }],
        opacity: fadeAnim,
      }}>
        <TouchableOpacity
          onPress={() => handleUserPress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          <View style={styles.listItemCard}>
            <UserListItem user={item} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading && filteredUsers.length === 0 && !error && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Users...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={72} color={colors.error} />
          <Text style={styles.errorText}>Oops! Something went wrong.</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity onPress={loadUsers} style={styles.retryButton}>
            <Ionicons name="refresh-outline" size={18} color={colors.primary} style={{ marginRight: spacing.sm }}/>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
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
          keyboardShouldPersistTaps="handled"
        />
      )}

      {!isLoading && !error && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddUser}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={colors.white} />
        </TouchableOpacity>
      )}
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
  },
  headerGradient: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerContent: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizeXxl + 2,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: colors.darkPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    height: '100%',
    fontFamily: typography.fontFamilyRegular,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.lg,
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
    fontSize: typography.fontSizeLg,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '90%',
  },
  errorText: {
    fontSize: typography.fontSizeLg,
    color: colors.error,
    fontFamily: typography.fontFamilyMedium,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '90%',
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: constants.borderRadiusMd,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyMedium,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});