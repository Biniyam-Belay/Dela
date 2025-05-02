// Create file: /home/biniyam/projects/suriAddis/admin-app/src/screens/ControlPanelScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; // Import icons
import theme, { colors, spacing, typography, constants } from '../theme'; // Import theme

// Define the type for the navigation prop
type RootStackParamList = {
  Products: undefined;
  Categories: undefined;
  Users: undefined; // Added Users
  Settings: undefined; // Added Settings
  // Add other screen names and their params if needed
};

type ControlPanelNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define interface for control items
interface ControlItem {
  key: keyof RootStackParamList;
  title: string;
  icon: React.ComponentProps<typeof Feather>['name']; // Using Feather icons
  color: string;
}

const controlItems: ControlItem[] = [
  { key: 'Products', title: 'Manage Products', icon: 'package', color: colors.primary },
  { key: 'Categories', title: 'Manage Categories', icon: 'grid', color: colors.info },
  { key: 'Users', title: 'Manage Users', icon: 'users', color: colors.success }, // Example: Add Users
  { key: 'Settings', title: 'App Settings', icon: 'settings', color: colors.warning }, // Example: Add Settings
];

export default function ControlPanelScreen() {
  const navigation = useNavigation<ControlPanelNavigationProp>();

  const handlePress = (screenName: keyof RootStackParamList) => {
    // Simplified navigation call. React Navigation will find the screen
    // in the parent StackNavigator if it's not in the current TabNavigator.
    try {
        navigation.navigate(screenName);
    } catch (error) {
        // Catch potential errors if the screen truly doesn't exist anywhere
        console.error(`Navigation error: Could not find screen "${screenName}".`, error);
        // Optionally show a user-facing error message using Toast
        // import Toast from 'react-native-toast-message'; // Make sure Toast is imported
        /*
        Toast.show({
            type: 'error',
            text1: 'Navigation Error',
            text2: `Screen "${screenName}" is not available.`,
        });
        */
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Control Panel</Text>
        <Text style={styles.subtitle}>Manage your application settings and content.</Text>

        <View style={styles.controlsGrid}>
          {controlItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.controlButton}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                 <Feather name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.buttonText}>{item.title}</Text>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          ))}
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
  container: {
    flexGrow: 1,
    padding: spacing.md,
    paddingTop: spacing.lg, // More space at the top
  },
  headerTitle: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm, // Align with buttons if needed
  },
  subtitle: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    marginBottom: spacing.xl, // More space below subtitle
    paddingHorizontal: spacing.sm,
  },
  controlsGrid: {
    // Using a vertical list layout instead of a grid for simplicity and elegance
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: constants.borderRadiusMd,
    marginBottom: spacing.md, // Space between buttons
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8, // Slightly more visible shadow
    shadowRadius: 4,
    elevation: 3, // Android shadow
    borderWidth: 1, // Subtle border
    borderColor: colors.border,
  },
  iconContainer: {
      width: 50,
      height: 50,
      borderRadius: constants.borderRadiusLg, // More rounded icon background
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
  },
  buttonText: {
    flex: 1, // Take remaining space
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
  },
  chevron: {
     marginLeft: spacing.sm,
  }
});