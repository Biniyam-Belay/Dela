import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import theme, { colors, spacing, typography, constants } from '../theme';

type TabConfig = {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: 'Dashboard', icon: 'dashboard' },
  { name: 'Products', icon: 'inventory' },
  { name: 'Orders', icon: 'list-alt' },
  { name: 'Users', icon: 'people' },
  { name: 'Settings', icon: 'settings' },
];

const getIconForRoute = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
  const tab = TABS.find(t => t.name === routeName);
  return tab ? tab.icon : 'help-outline';
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const color = isFocused ? colors.primary : colors.textSecondary;
          const iconName = getIconForRoute(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={iconName}
                size={24}
                color={color}
              />
              <Text style={[styles.label, { color }]}>{label}</Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: spacing.md,
    marginBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    borderRadius: constants.borderRadiusLg,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.cardBackground,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: constants.borderRadiusLg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  label: {
    fontSize: typography.fontSizeXs,
    marginTop: 2,
    fontFamily: typography.fontFamilyMedium,
    letterSpacing: 0.1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
});