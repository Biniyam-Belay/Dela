import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { User } from '../components/UserListItem';

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
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
  fontFamilyRegular: 'Inter-Regular',
  fontFamilyMedium: 'Inter-Medium',
  fontFamilyBold: 'Inter-Bold'
};

const constants = {
  borderRadiusSm: 8,
  borderRadiusMd: 12,
  borderRadiusLg: 16,
  borderRadiusXl: 20
};

type RootStackParamList = {
  UserDetail: { user: User };
};

type UserDetailRouteProp = RouteProp<RootStackParamList, 'UserDetail'>;

export default function UserDetailScreen() {
  const route = useRoute<UserDetailRouteProp>();
  const navigation = useNavigation();
  const { user } = route.params;

  const handleEdit = () => {
    console.log("Edit user:", user.id);
  };

  const handleDelete = () => {
    console.log("Delete user:", user.id);
  };

  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}` }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name || 'Unnamed User'}</Text>
          <Text style={styles.userRole}>{user.role || 'No Role Assigned'}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Joined Date</Text>
              <Text style={styles.detailValue}>{joinDate}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete User Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary + '30',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSizeXxl,
    fontFamily: typography.fontFamilyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  userRole: {
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyRegular,
    color: colors.primary,
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: constants.borderRadiusSm,
    overflow: 'hidden',
  },
  detailsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusLg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.darkPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '80',
  },
  detailIcon: {
    marginRight: spacing.lg,
    marginTop: spacing.xs,
    width: 24,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSizeSm,
    fontFamily: typography.fontFamilyRegular,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyMedium,
    color: colors.textPrimary,
  },
  deleteButtonContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: constants.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  deleteButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyMedium,
    color: colors.error,
  },
});
