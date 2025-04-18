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
  { name: 'Control', icon: 'tune' },
  { name: 'Orders', icon: 'shopping-cart' },
  { name: 'Dashboard', icon: 'dashboard' },
  { name: 'Users', icon: 'people' },
  { name: 'Notifications', icon: 'notifications' },
];

const getIconForRoute = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
  const tab = TABS.find(t => t.name === routeName);
  return tab ? tab.icon : 'help-outline';
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
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

        const activeColor = colors.primary;
        const inactiveColor = colors.textSecondary;
        const color = isFocused ? activeColor : inactiveColor;
        const iconName = getIconForRoute(route.name);

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
            activeOpacity={0.8}
          >
            {isFocused && <View style={styles.activeIndicator} />}
            <View style={styles.tabContent}>
              <MaterialIcons
                name={iconName}
                size={24}
                color={color}
              />
              <Text style={[styles.label, { color }]}>{label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 80 : 70,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: spacing.sm,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.fontSizeXs,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamilyMedium,
    letterSpacing: 0.1,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 3,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});