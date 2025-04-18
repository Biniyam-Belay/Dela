import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Use a suitable picker library
import theme, { colors, spacing, typography, constants } from '../theme';
// Assume api functions exist: fetchUserById, createUser, updateUser
// import { fetchUserById, createUser, updateUser } from '../services/api';
import { User } from '../components/UserListItem'; // Import User type

// Placeholder fetch/update functions
const fetchUserById = async (userId: string): Promise<User | null> => {
  console.log(`Fetching user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  if (userId === '1') return { id: '1', name: 'Biniyam Tesfaye', email: 'biniyam@example.com', role: 'ADMIN' };
  if (userId === '6') return { id: '6', name: 'Super Admin', email: 'admin@suriaddis.com', role: 'ADMIN' };
  return null;
};
const createUser = async (data: Partial<User>): Promise<User> => {
  console.log('Creating user:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: Date.now().toString(), role: 'USER', ...data } as User;
};
const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  console.log(`Updating user ${userId}:`, data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: userId, name: 'Updated Name', email: 'updated@example.com', role: 'USER', ...data } as User;
};

type UserAddEditRouteProp = RouteProp<{ params: { userId?: string } }, 'params'>;

const USER_ROLES = ['USER', 'ADMIN']; // Define available roles

export default function UserAddEditScreen() {
  const navigation = useNavigation();
  const route = useRoute<UserAddEditRouteProp>();
  const userId = route.params?.userId;
  const isEditMode = Boolean(userId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(USER_ROLES[0]); // Default to 'USER'
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit User' : 'Add New User',
      headerBackTitleVisible: false,
    });

    if (isEditMode && userId) {
      const loadUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userData = await fetchUserById(userId);
          if (userData) {
            setName(userData.name || '');
            setEmail(userData.email || '');
            setRole(userData.role || USER_ROLES[0]);
          } else {
            setError('User not found.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load user data.');
          console.error('Error loading user:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadUser();
    }
  }, [isEditMode, userId, navigation]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    if (!isEditMode && (!password || password.length < 6)) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return false;
    }
    if (isEditMode && password && password.length > 0 && password.length < 6) {
        Alert.alert('Validation Error', 'New password must be at least 6 characters long (or leave blank to keep current).');
        return false;
    }
    if (!role || !USER_ROLES.includes(role)) {
      Alert.alert('Validation Error', 'Please select a valid role.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    const userData: Partial<User> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role,
    };
    // Only include password if it's being set (new user) or changed (edit user)
    if (password) {
        // In a real app, you'd hash the password on the backend
        userData.password = password; // Send plain text for now (DEMO ONLY)
    }


    try {
      if (isEditMode && userId) {
        await updateUser(userId, userData);
      } else {
        await createUser(userData);
      }
      navigation.goBack(); // Go back to the list after successful save
    } catch (err: any) {
      setError(err.message || 'Failed to save user.');
      Alert.alert('Save Error', err.message || 'Could not save user data. Please try again.');
      console.error('Error saving user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !isSaving) { // Show loading error only if not currently trying to save
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={60} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter user's full name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter user's email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Password {isEditMode ? '(Optional)' : <Text style={styles.required}>*</Text>}
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
           {isEditMode && <Text style={styles.helpText}>Enter a new password only if you want to change it.</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role <Text style={styles.required}>*</Text></Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem} // iOS specific styling
            >
              {USER_ROLES.map((r) => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
            {Platform.OS === 'android' && <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} style={styles.pickerIconAndroid} />}
          </View>
        </View>

        {error && isSaving && ( // Show saving error inline
            <Text style={styles.inlineErrorText}>{error}</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Save User</Text>
            )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizeSm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamilyMedium,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: constants.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm + 3,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    minHeight: 50,
    fontFamily: typography.fontFamilyRegular,
  },
  helpText: {
      fontSize: typography.fontSizeXs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      fontFamily: typography.fontFamilyRegular,
  },
  pickerContainer: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: constants.borderRadiusMd,
    minHeight: 50,
    justifyContent: 'center',
    overflow: 'hidden', // Needed for borderRadius on Android
    position: 'relative', // For Android icon positioning
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? undefined : 50, // Android needs explicit height
    color: colors.textPrimary,
  },
  pickerItem: { // iOS only
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamilyRegular,
    height: 150, // Adjust height for better scroll experience on iOS
  },
  pickerIconAndroid: { // Android only
      position: 'absolute',
      right: spacing.md,
      top: '50%',
      marginTop: -12, // Half of icon size
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    borderRadius: constants.borderRadiusMd,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    marginLeft: spacing.md,
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    fontFamily: typography.fontFamilyBold,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizeMd,
    color: colors.error,
    textAlign: 'center',
    fontFamily: typography.fontFamilyMedium,
  },
   inlineErrorText: {
    fontSize: typography.fontSizeSm,
    color: colors.error,
    fontFamily: typography.fontFamilyRegular,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: constants.borderRadiusMd,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
  },
});
