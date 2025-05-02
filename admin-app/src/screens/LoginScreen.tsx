import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Animated } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import theme, { colors, spacing, typography, constants } from '../theme';

export default function LoginScreen({ onLogin }: { onLogin: (userId: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [error, setError] = useState<string | null>(null);
  const [errorAnim] = useState(new Animated.Value(0));

  // Animate card on mount
  useState(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Show error banner with animation
  const showError = (msg: string) => {
    console.log("showError called with message:", msg); // <-- Add log
    setError(msg);
    Animated.timing(errorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide error banner
  const hideError = () => {
    console.log("hideError called"); // <-- Add log
    Animated.timing(errorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setError(null));
  };

  const handleLogin = async () => {
    console.log("handleLogin started"); // <-- Add log
    setLoading(true);
    setError(null); // Clear previous errors
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password }); // Renamed error variable
    setLoading(false);
    console.log("Supabase response:", { data, supabaseError }); // <-- Add log
    if (supabaseError) {
      // Use the custom error display
      showError(supabaseError.message || 'An unexpected error occurred.');
    } else if (data.user) {
      console.log("Login successful, calling onLogin"); // <-- Add log
      onLogin(data.user.id);
    } else {
      console.log("Login failed: No user data and no error from Supabase?"); // <-- Add log
      showError('Login failed. Please check your credentials.'); // Fallback error
    }
  };

  // Redesigned error toast/banner
  const ErrorToast = ({ message, onClose }: { message: string; onClose: () => void }) => {
    console.log("ErrorToast rendering with message:", message); // <-- Add log
    return (
      <Animated.View
        style={[
          styles.errorToastContainer,
          {
            opacity: errorAnim,
            transform: [{ translateY: errorAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
        pointerEvents={message ? 'auto' : 'none'}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View style={styles.errorToastContent}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.error} style={styles.errorToastIcon} />
          <Text style={styles.errorToastText}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.errorToastCloseBtn} accessibilityLabel="Dismiss error">
            <Ionicons name="close-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Redesigned error toast/banner */}
      {error && <ErrorToast message={error} onClose={hideError} />}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>SuriAddis Admin</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="help-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }]}>
        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={secureEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setSecureEntry(!secureEntry)}
              >
                <MaterialIcons
                  name={secureEntry ? 'visibility-off' : 'visibility'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.sm : spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  iconButton: {
    padding: spacing.sm,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusLg,
    margin: spacing.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing.md + 24 + spacing.sm,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: constants.borderRadiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
  },
  errorToastContainer: {
    position: 'absolute',
    top: 150, // Moved down significantly, adjust this value based on visual testing
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  errorToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '60', // Increased opacity (from '1A' to '60')
    borderRadius: constants.borderRadiusMd,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '80', // Slightly darker border for contrast
    minHeight: 48,
  },
  errorToastIcon: {
    marginRight: spacing.sm,
  },
  errorToastText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
    lineHeight: typography.fontSizeMd * 1.4,
  },
  errorToastCloseBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    borderRadius: constants.borderRadiusFull,
  },
});