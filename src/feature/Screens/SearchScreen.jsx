import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
  Dimensions,
  ScrollView
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE = 'http://192.168.0.175:5000/api/search';

const SearchResultScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState(['All']);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedProducts, setSavedProducts] = useState([]);
  const [compareList, setCompareList] = useState([]); // For comparison
  const [filters, setFilters] = useState({
    sortBy: 'mbScore',
    minRating: 3.5
  });

  // Load saved products
  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedProducts');
        setSavedProducts(saved ? JSON.parse(saved) : []);
      } catch (error) {
        console.error('Error loading saved products:', error);
      }
    };
    loadSavedProducts();
  }, []);

  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        ...filters
      };
      const response = await axios.get(API_BASE, { params });
      const results = response.data.products || [];
      const uniqueStores = ['All', ...new Set(results.map(p => p.source))];
      setStores(uniqueStores);
      setProducts(results);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to fetch products. Check your connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      const isSaved = savedProducts.some(p => p.id === product.id);
      const updated = isSaved
        ? savedProducts.filter(p => p.id !== product.id)
        : [...savedProducts, product];
      await AsyncStorage.setItem('savedProducts', JSON.stringify(updated));
      setSavedProducts(updated);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Add product to compare list
  const handleAddToCompare = (product) => {
    if (!compareList.some(p => p.id === product.id)) {
      setCompareList((prev) => [...prev, product]);
    }
    setModalVisible(false);
  };

  const goToCompareScreen = () => {
    if (compareList.length < 2) {
      alert('You need at least two items to compare.');
      return;
    }
    navigation.navigate('ComparisonScreen', { compareItems: compareList });
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(product);
        setModalVisible(true);
      }}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.thumbnail }} style={styles.productImage} />
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>MB: {product.mbScore?.toFixed(2)}</Text>
          <Text style={styles.scoreText}>CB: {product.cbScore?.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => handleSaveProduct(product)}
        >
          <RNEIcon
            name={savedProducts.some(p => p.id === product.id) ? "bookmark" : "bookmark-outline"}
            type="material-community"
            size={22}
            color="#FFD700"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.storeName}>{product.source}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${product.price}</Text>
          <Text style={styles.shippingText}> + ${product.shipping} shipping</Text>
        </View>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} />
          <Text style={styles.reviewCount}>({product.reviews} reviews)</Text>
        </View>
    );

  // Header Component to be used as ListHeaderComponent
  const ListHeader = () => (
    <View>
      {/* Header Title & Compare Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Results</Text>
        {compareList.length >= 2 && (
          <TouchableOpacity onPress={goToCompareScreen} style={styles.compareNavBtn}>
            <Text style={styles.compareNavBtnText}>Compare ({compareList.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a product..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchProducts(searchQuery)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => fetchProducts(searchQuery)}>
          <Icon name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Store Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {stores.map((store) => {
          const isActive = selectedStore === store;
          return (
            <TouchableOpacity
              key={store}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setSelectedStore(store)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{store}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedStore === 'All' ? products : products.filter((p) => p.source === selectedStore)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.resultsContainer}
        ListHeaderComponent={ListHeader}
      />

      {/* Modal for Product Details */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedProduct && (
              <>
                <ScrollView style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.closeIcon}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: selectedProduct.thumbnail }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalBody}>
                    <Text style={styles.modalProductTitle}>{selectedProduct.title}</Text>
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceText}>${selectedProduct.price}</Text>
                      <Text style={styles.modalShippingText}> + ${selectedProduct.shipping} shipping</Text>
                    </View>
                    <View style={styles.scoresRow}>
                      <Text style={styles.scoresText}>MB: {selectedProduct.mbScore?.toFixed(2)}</Text>
                      <Text style={styles.scoresText}>CB: {selectedProduct.cbScore?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rating:</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <StarRating rating={selectedProduct.rating} />
                        <Text style={[styles.detailValue, { marginLeft: 6 }]}>
                          ({selectedProduct.reviews} reviews)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Store:</Text>
                      <Text style={styles.detailValue}>{selectedProduct.source}</Text>
                    </View>
                    <View style={styles.compareContainer}>
                      <Text style={styles.compareHeading}>Compare with other options:</Text>
                      <Text style={styles.compareText}>
                        Shipping cost, rating, payment methods, etc.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.compareBtn}
                    onPress={() => {
                      handleAddToCompare(selectedProduct);
                      navigation.navigate('ComparisonScreen', { compareItems: compareList });
                    }}
                  >
                    <Text style={styles.compareBtnText}>Compare</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewStoreBtn}
                    onPress={() => Linking.openURL(selectedProduct.link)}
                  >
                    <Text style={styles.viewStoreBtnText}>View on {selectedProduct.source}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Star Rating Component
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Icon key={i} name="star" size={16} color="#FFD700" />;
        } else if (i === fullStars && hasHalfStar) {
          return <Icon key={i} name="star-half" size={16} color="#FFD700" />;
        } else {
          return <Icon key={i} name="star-border" size={16} color="#FFD700" />;
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddintTop: -40,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  compareNavBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compareNavBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: 'white',
    fontSize: 15,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filterContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },
  filterPill: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 16,
  },
  // Product Card Styles
  productCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    padding: 6,
  },
  scoreText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  storeName: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  shippingText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewCount: {
    color: '#999',
    fontSize: 13,
    marginLeft: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.9,
    height: '80%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  modalBody: {
    padding: 16,
  },
  modalProductTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalPriceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalShippingText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
  },
  scoresRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  scoresText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  compareContainer: {
    marginTop: 16,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  compareHeading: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compareText: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#2A2A2A',
  },
  compareBtn: {
    backgroundColor: '#444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  compareBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  viewStoreBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewStoreBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SearchResultScreen;
