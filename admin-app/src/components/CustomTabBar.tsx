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
  { name: 'Home', icon: 'home' },
  { name: 'Wallet', icon: 'account-balance-wallet' },
  { name: 'Exchange', icon: 'swap-horiz' },
  { name: 'Markets', icon: 'storefront' },
  { name: 'Profile', icon: 'person' },
];

const getIconForRoute = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
  const tab = TABS.find(t => t.name === routeName);
  return tab ? tab.icon : 'help-outline';
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const middleIndex = Math.floor(TABS.length / 2);

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
          const isMiddleButton = index === middleIndex;

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

          const activeColor = colors.white;
          const inactiveColor = colors.textSecondary;
          const color = isFocused ? activeColor : inactiveColor;
          const iconName = getIconForRoute(route.name);

          const middleButtonContainerStyle = isMiddleButton ? styles.middleButtonContainer : {};
          const middleIconWrapperStyle = isMiddleButton ? styles.middleIconWrapper : {};

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, middleButtonContainerStyle]}
              activeOpacity={0.8}
            >
              {isFocused && !isMiddleButton && <View style={styles.activeIndicator} />}
              <View style={[styles.tabContent, middleIconWrapperStyle]}>
                <MaterialIcons
                  name={iconName}
                  size={isMiddleButton ? 30 : 24}
                  color={isMiddleButton ? colors.primary : color}
                />
                {!isMiddleButton && (
                  <Text style={[styles.label, { color }]}>{label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    marginHorizontal: spacing.md,
    marginBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    borderRadius: constants.borderRadiusXl,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: colors.black,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: constants.borderRadiusXl,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  middleButtonContainer: {},
  middleIconWrapper: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.black,
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
    bottom: 5,
    left: spacing.lg,
    right: spacing.lg,
    height: 3,
    backgroundColor: '#34D399',
    borderRadius: 1.5,
  },
});