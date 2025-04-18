import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import theme, { colors, spacing, typography, constants } from '../theme';

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
};

const placeholderImage = require('../../assets/placeholder-image.jpg');

export default function CategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImageUri, setCatImageUri] = useState<string | null>(null);
  const [catImageFile, setCatImageFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.cardBackground },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: typography.fontWeightBold },
      headerRight: () => (
        <TouchableOpacity onPress={openAddModal} style={{ marginRight: spacing.md }}>
          <Feather name="plus-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadCategories = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Loading Categories',
        text2: error.message || 'Could not fetch categories.',
      });
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadCategories();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            "Permission Required",
            "Photo library access is needed to add category images. Please enable it in your device settings.",
            [{ text: "OK" }]
          );
        }
      }
    })();
  }, [loadCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('categories').delete().eq('id', id);
              if (error) throw error;
              Toast.show({ type: 'success', text1: 'Category Deleted', text2: `"${name}" was deleted.` });
              setCategories(prev => prev.filter(cat => cat.id !== id));
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Delete Failed', text2: error.message || 'Could not delete category.' });
            }
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImageUri(null);
    setCatImageFile(null);
    setIsSaving(false);
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setIsEditMode(true);
    setCurrentCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatImageUri(cat.image_url || null);
    setCatImageFile(null);
    setIsSaving(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCatImageUri(result.assets[0].uri);
        setCatImageFile(result.assets[0]);
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Image Error', text2: 'Could not open image picker.' });
    }
  };

  const removeImage = () => {
    setCatImageUri(null);
    setCatImageFile(null);
  };

  const uploadCategoryImage = async (file: ImagePicker.ImagePickerAsset): Promise<string | null> => {
    try {
      const fileExt = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `public/categories/${fileName}`;

      let contentType = file.mimeType ?? `image/${fileExt}`;
      if (!contentType.startsWith('image/')) {
        contentType = 'image/jpeg';
      }

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('categoryimages')
        .upload(filePath, blob, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('categoryimages')
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;

    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Image Upload Failed', text2: error.message || 'Could not upload image.' });
      return null;
    }
  };

  const handleSave = async () => {
    if (!catName.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Name', text2: 'Category name is required.' });
      return;
    }

    setIsSaving(true);
    let finalImageUrl: string | null | undefined = catImageUri;

    try {
      if (catImageFile) {
        finalImageUrl = await uploadCategoryImage(catImageFile);
        if (finalImageUrl === null) {
          setIsSaving(false);
          return;
        }
      } else if (isEditMode && catImageUri === null && currentCategory?.image_url) {
        finalImageUrl = null;
      } else if (!isEditMode && catImageUri === null) {
        finalImageUrl = null;
      }

      const payload: Omit<Category, 'id' | 'created_at'> = {
        name: catName.trim(),
        description: catDesc.trim() || null,
        image_url: finalImageUrl,
      };

      let error = null;
      let savedData: Category[] | null = null;

      if (isEditMode && currentCategory?.id) {
        const { data, error: updateError } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', currentCategory.id)
          .select()
          .single();
        error = updateError;
        savedData = data ? [data] : null;
      } else {
        const { data, error: insertError } = await supabase
          .from('categories')
          .insert([payload])
          .select();
        error = insertError;
        savedData = data;
      }

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Category ${isEditMode ? 'updated' : 'added'} successfully!`,
      });

      if (savedData && savedData.length > 0) {
        const savedCategory = savedData[0];
        if (isEditMode) {
          setCategories(prev => prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat));
        } else {
          setCategories(prev => [...prev, savedCategory].sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        loadCategories();
      }

      closeModal();

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error.message || `Could not ${isEditMode ? 'update' : 'add'} category.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <Image
        source={item.image_url ? { uri: item.image_url } : placeholderImage}
        style={styles.categoryImage}
        resizeMode="cover"
        onError={(e) => console.log(`Failed to load image: ${item.image_url}`, e.nativeEvent.error)}
      />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>}
      </View>
      <TouchableOpacity
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={22} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Feather name="plus" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>
      {loading && categories.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Feather name="grid" size={40} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No categories found.</Text>
                <Text style={styles.emptySubText}>Tap the Add Category button to create one.</Text>
              </View>
            ) : null
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity style={styles.modalContentWrapper} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isEditMode ? 'Edit' : 'Add New'} Category</Text>
                <TouchableOpacity onPress={closeModal} disabled={isSaving} style={styles.closeButton}>
                  <Feather name="x" size={26} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category Image</Text>
                <View style={styles.imagePickerRow}>
                  <TouchableOpacity style={styles.imagePreviewContainer} onPress={pickImage} disabled={isSaving}>
                    <Image
                      source={catImageUri ? { uri: catImageUri } : placeholderImage}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={[styles.imageOverlay, !catImageUri && styles.imageOverlayVisible]}>
                      <Feather name="camera" size={24} color={colors.white} />
                      <Text style={styles.imageOverlayText}>Tap to select</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.imagePickerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={pickImage} disabled={isSaving}>
                      <Feather name="edit-2" size={18} color={colors.primary} />
                      <Text style={styles.actionButtonText}>Change</Text>
                    </TouchableOpacity>
                    {catImageUri && (
                      <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={removeImage} disabled={isSaving}>
                        <Feather name="trash-2" size={18} color={colors.error} />
                        <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Electronics"
                  placeholderTextColor={colors.textSecondary}
                  value={catName}
                  onChangeText={setCatName}
                  editable={!isSaving}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Briefly describe the category"
                  placeholderTextColor={colors.textSecondary}
                  value={catDesc}
                  onChangeText={setCatDesc}
                  multiline
                  numberOfLines={3}
                  editable={!isSaving}
                  autoCapitalize="sentences"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isSaving ? styles.buttonDisabled : styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>{isEditMode ? 'Update Category' : 'Add Category'}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
                disabled={isSaving}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: '-10%',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
  },
  emptyText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontFamily: typography.fontFamilyMedium,
  },
  emptySubText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontFamily: typography.fontFamilyRegular,
    maxWidth: '80%',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusLg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: constants.borderRadiusMd,
    marginRight: spacing.lg,
    backgroundColor: colors.border,
  },
  categoryInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamilyBold,
  },
  categoryDesc: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyRegular,
    lineHeight: typography.fontSizeSm * 1.4,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: constants.borderRadiusFull,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusXl,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  modalScrollView: {},
  modalScrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyBold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizeSm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamilyMedium,
  },
  input: {
    backgroundColor: colors.background,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: constants.borderRadiusMd,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    marginRight: spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  imageOverlayVisible: {
    opacity: 1,
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: typography.fontSizeXs,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.fontFamilyRegular,
  },
  imagePickerActions: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: constants.borderRadiusSm,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
  },
  removeButton: {},
  removeButtonText: {
    color: colors.error,
  },
  button: {
    borderRadius: constants.borderRadiusMd,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    flexDirection: 'row',
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBackground,
    opacity: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    fontFamily: typography.fontFamilyBold,
    marginLeft: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
    marginLeft: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyBold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: constants.borderRadiusMd,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    fontFamily: typography.fontFamilyMedium,
    marginLeft: spacing.xs,
  },
});
