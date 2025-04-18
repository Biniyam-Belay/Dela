import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  LayoutAnimation, // Import LayoutAnimation
  UIManager, // Import UIManager
} from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import theme, { colors, spacing, typography, constants } from '../theme';
import Toast from 'react-native-toast-message';

const fadedPrimary = colors.primary + '20';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Category = {
  id: string;
  name: string;
};

export default function AddEditProductScreen({ route, navigation }: any) {
  const product = route.params?.product;
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock_quantity?.toString() || '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageFiles, setImageFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Edit Product' : 'Add New Product',
      headerStyle: {
        backgroundColor: colors.cardBackground,
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        fontWeight: typography.fontWeightBold,
      },
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={loading} style={{ marginRight: spacing.md }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <MaterialIcons name="save" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEdit, loading, name, description, price, stock, isActive, categoryId, images]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await supabase.from('categories').select('id, name').order('name');
        if (error) throw error;
        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        Toast.show({
          type: 'error',
          text1: 'Error Loading Categories',
          text2: error.message || 'Could not load categories.',
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isEdit]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "You need to grant permission to access the photo library. Please enable it in your device settings."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      console.log('ImagePicker result:', result);
      if (result.canceled) {
        Toast.show({
          type: 'info',
          text1: 'Image Selection Cancelled',
          text2: 'You did not select any new images.',
        });
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const newAssets = result.assets.filter(asset => !images.includes(asset.uri));
        const newUris = newAssets.map(a => a.uri);
        const newFiles = newAssets;

        // Configure animation before state update
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setImages([...images, ...newUris]);
        setImageFiles([...imageFiles, ...newFiles]);
        Toast.show({
          type: 'success',
          text1: 'Images Added',
          text2: `${newAssets.length} new image(s) ready for upload.`,
        });
      }
    } catch (err: any) {
      console.error('Error opening image picker:', err);
      Toast.show({
        type: 'error',
        text1: 'Image Picker Error',
        text2: err.message || 'Could not open image picker.',
      });
    }
  };

  const removeImage = (uriToRemove: string) => {
    // Configure animation before state update
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setImages(images.filter(uri => uri !== uriToRemove));
    setImageFiles(imageFiles.filter(file => file.uri !== uriToRemove));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const existingUrls = images.filter(img => img.startsWith('http'));
    const newFilesToUpload = imageFiles.filter(file => !existingUrls.includes(file.uri));

    if (newFilesToUpload.length === 0) {
      return images;
    }

    for (const file of newFilesToUpload) {
      try {
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productimages')
          .upload(filePath, blob, {
            contentType: file.mimeType ?? 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload Error:', uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('productimages')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (error: any) {
        console.error(`Failed to upload image ${file.uri}:`, error);
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: `Could not upload image: ${file.fileName || 'selected image'}. ${error.message || ''}`,
          visibilityTime: 5000,
        });
      }
    }
    return [...existingUrls, ...uploadedUrls];
  };

  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in Name, Price, and select a Category.',
      });
      return;
    }
    if (images.length === 0 && imageFiles.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Missing Image',
        text2: 'Please add at least one image for the product.',
      });
      return;
    }

    setLoading(true);

    try {
      const finalImageUrls = await uploadImages();

      const expectedImageCount = images.filter(img => img.startsWith('http')).length + imageFiles.filter(file => !images.includes(file.uri)).length;
      if (finalImageUrls.length < expectedImageCount) {
        Toast.show({
          type: 'warning',
          text1: 'Partial Upload',
          text2: 'Some images failed to upload. Please try saving again.',
          visibilityTime: 5000,
        });
        setLoading(false);
        setImages(finalImageUrls);
        setImageFiles(imageFiles.filter(f => finalImageUrls.includes(f.uri)));
        return;
      }

      const payload = {
        name: name.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 0,
        is_active: isActive,
        categoryId: categoryId,
        images: finalImageUrls,
      };

      let result;
      if (isEdit && product?.id) {
        result = await supabase.from('products').update(payload).eq('id', product.id).select();
      } else {
        result = await supabase.from('products').insert([payload]).select();
      }

      if (result.error) {
        throw result.error;
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Product ${isEdit ? 'updated' : 'added'} successfully!`,
      });
      navigation.goBack();
    } catch (error: any) {
      console.error("Error saving product:", error);
      Toast.show({
        type: 'error',
        text1: 'Save Error',
        text2: `Failed to ${isEdit ? 'update' : 'add'} product. ${error?.message || ''}`,
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Wireless Headphones"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
          {(!name && loading === false) && (
            <Text style={styles.helperText}>Name is required.</Text>
          )}
        </View>
        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of the product"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>
        <View style={styles.sectionDivider} />

        {/* Price & Stock */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flexInput]}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 99.99"
              placeholderTextColor={colors.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {(!price && loading === false) && (
              <Text style={styles.helperText}>Price is required.</Text>
            )}
          </View>
          <View style={styles.spacer} />
          <View style={[styles.inputGroup, styles.flexInput]}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              placeholderTextColor={colors.textSecondary}
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
        </View>
        <View style={styles.sectionDivider} />

        {/* Category Picker Card */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryCard}>
            {loadingCategories ? (
              <ActivityIndicator color={colors.primary} style={{ height: 50 }} />
            ) : (
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
                style={styles.picker}
                enabled={!loading && !loadingCategories}
                dropdownIconColor={colors.textSecondary}
              >
                <Picker.Item label="-- Select a Category --" value="" style={styles.pickerItem} />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} style={styles.pickerItem} />
                ))}
              </Picker>
            )}
          </View>
          {(!categoryId && loading === false) && (
            <Text style={styles.helperText}>Category is required.</Text>
          )}
        </View>
        <View style={styles.sectionDivider} />

        {/* Images Grid */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Images *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {images.map((uri) => (
              <View key={uri} style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => removeImage(uri)} style={styles.removeImageButton} disabled={loading}>
                  <MaterialIcons name="cancel" size={22} color={colors.white} style={styles.removeImageIcon} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages} disabled={loading}>
              <MaterialIcons name="add-photo-alternate" size={30} color={colors.primary} />
              <Text style={styles.addImageText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
          {images.length === 0 && <Text style={styles.imageHint}>Add at least one image.</Text>}
        </View>
        <View style={styles.sectionDivider} />

        {/* Product Active Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Product Active</Text>
          <Switch
            trackColor={{ false: colors.border, true: fadedPrimary }}
            thumbColor={isActive ? colors.primary : colors.cardBackground}
            ios_backgroundColor={colors.border}
            onValueChange={setIsActive}
            value={isActive}
            disabled={loading}
          />
        </View>
        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  container: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: constants.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexInput: {
    flex: 1,
  },
  spacer: {
    width: spacing.md,
  },
  pickerContainer: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: constants.borderRadiusMd,
    justifyContent: 'center',
    minHeight: 50,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? undefined : 50,
    color: colors.textPrimary,
  },
  pickerItem: {
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: constants.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    minHeight: 50,
  },
  imageScrollView: {
    paddingVertical: spacing.sm,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: constants.borderRadiusSm,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    padding: 2,
  },
  removeImageIcon: {},
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: constants.borderRadiusSm,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: fadedPrimary,
    padding: spacing.sm,
  },
  addImageText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizeXs,
    color: colors.primary,
    fontWeight: typography.fontWeightMedium,
  },
  imageHint: {
    fontSize: typography.fontSizeSm,
    color: colors.error,
    marginTop: spacing.sm,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: constants.borderRadiusMd,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    letterSpacing: 0.5,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    borderRadius: 1,
  },
  helperText: {
    color: colors.error,
    fontSize: typography.fontSizeSm,
    marginTop: spacing.xs,
  },
  categoryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
