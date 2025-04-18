import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView, // Ensure SafeAreaView is imported
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { fetchProducts, supabase } from '../services/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import theme, { colors, spacing, typography, constants } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebouncedCallback } from 'use-debounce';
import { Picker } from '@react-native-picker/picker';

type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
};

type Category = { id: string; name: string };

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigation = useNavigation<any>();

  const debouncedLoadProducts = useDebouncedCallback(async (query: string, category: string) => {
    if (!refreshing) setLoading(true);
    try {
      const data = await fetchProducts(query, category);
      setProducts(data || []);
    } catch (e) {
      console.error("Error loading products:", e);
      Alert.alert('Error', 'Failed to load products.');
    }
    setLoading(false);
    if (refreshing) setRefreshing(false);
  }, 300);

  const loadProducts = async () => {
    debouncedLoadProducts(searchQuery, selectedCategory);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('products').delete().eq('id', id);
              if (error) throw error;
              setProducts(currentProducts => currentProducts.filter(p => p.id !== id));
            } catch (e) {
              console.error("Error deleting product:", e);
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('id, name').order('name');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Could not load categories.');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    debouncedLoadProducts(searchQuery, selectedCategory);
  }, []);

  useEffect(() => {
    debouncedLoadProducts(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await debouncedLoadProducts(searchQuery, selectedCategory);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={item.image_url ? { uri: item.image_url } : require('../../assets/placeholder-image.jpg')}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price?.toFixed(2) ?? 'N/A'}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEditProduct', { product: item })}
          style={[styles.actionButton, styles.editButton]}
        >
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inventory-2" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>No products found.</Text>
      <Text style={styles.emptySubText}>Pull down to refresh or add a new product.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      <View style={styles.filterContainer}>
        <MaterialIcons name="filter-list" size={20} style={styles.filterIcon} />
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          style={styles.picker}
          dropdownIconColor={colors.textSecondary}
        >
          <Picker.Item label="All Categories" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyListComponent}
        />
      )}

      <TouchableOpacity
        style={styles.fabContainer}
        onPress={() => navigation.navigate('AddEditProduct', {})}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="add" size={30} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + spacing.sm : spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterIcon: {
    marginRight: spacing.sm,
    color: colors.primary,
  },
  picker: {
    flex: 1,
    color: colors.textPrimary,
    height: 44,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
  },
  listContentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: constants.borderRadiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: constants.borderRadiusSm,
    marginRight: spacing.md,
    backgroundColor: colors.border,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productName: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
    borderRadius: constants.borderRadiusFull,
  },
  editButton: {},
  deleteButton: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + (Platform.OS === 'ios' ? 0 : spacing.sm),
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
