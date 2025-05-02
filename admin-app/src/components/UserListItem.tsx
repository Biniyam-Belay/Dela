import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme, { colors, spacing, typography, constants } from '../theme';

// Define the expected User type structure
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'ADMIN' | 'USER' | string | null; // Allow for other roles or null
  // Add other relevant fields like createdAt if needed
};

type UserListItemProps = {
  user: User;
  onPress: () => void;
};

const getInitials = (name: string | null): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getRoleBadgeStyle = (role: string | null) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return { backgroundColor: colors.primaryMuted, textColor: colors.primary };
    case 'USER':
      return { backgroundColor: colors.successMuted, textColor: colors.success };
    default:
      return { backgroundColor: colors.greyMuted, textColor: colors.textSecondary };
  }
};

const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const roleStyle = getRoleBadgeStyle(user.role);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {user.name || 'Unnamed User'}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user.email || 'No Email'}
        </Text>
      </View>
      <View style={styles.roleContainer}>
        <View style={[styles.roleBadge, { backgroundColor: roleStyle.backgroundColor }]}>
          <Text style={[styles.roleText, { color: roleStyle.textColor }]}>
            {user.role || 'Unknown'}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusLg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: constants.borderRadiusFull,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.primary,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
  },
  roleContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: constants.borderRadiusSm,
  },
  roleText: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});

export default UserListItem;
