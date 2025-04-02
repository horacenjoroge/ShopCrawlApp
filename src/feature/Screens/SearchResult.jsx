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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Icon as RNEIcon } from '@rneui/themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE = 'http://192.168.0.175:5000/api/search';

const SearchResultScreen = ({ route = {} }) => {
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState(['All']);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedProducts, setSavedProducts] = useState([]);
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

  // Fetch products
  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        ...filters
      };
      const response = await axios.get(API_BASE, { params });
      const results = response.data.products || [];

      // Unique store list
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

  // Handle initial search
  useEffect(() => {
    if (searchQuery) {
      fetchProducts(searchQuery);
    }
  }, [filters]);

  // Save/unsave product
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

  // Product card
  const ProductCard = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(product);
        setModalVisible(true);
      }}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.thumbnail }} style={styles.productImage} />
        {/* MB/CB Scores */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>MB: {product.mbScore?.toFixed(2)}</Text>
          <Text style={styles.scoreText}>CB: {product.cbScore?.toFixed(2)}</Text>
        </View>

        {/* Bookmark */}
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

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.storeName}>{product.source}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${product.price}</Text>
          <Text style={styles.shippingText}> + ${product.shipping} shipping</Text>
        </View>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} />
          <Text style={styles.reviewCount}>({product.reviews} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShopCrawl</Text>
        <Text style={styles.headerSubtitle}>
          Your intelligent shopping assistant for computing Marginal Benefit (MB) and Cost-Benefit (CB) analysis.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchProducts(searchQuery)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => fetchProducts(searchQuery)}>
          <Icon name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Store filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stores.map((store, idx) => {
            const isActive = selectedStore === store;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedStore(store)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {store}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Analyzing products...</Text>
        </View>
      ) : (
        <FlatList
          data={
            selectedStore === 'All'
              ? products
              : products.filter((p) => p.source === selectedStore)
          }
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.resultsContainer}
        />
      )}

      {/* Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedProduct && (
              <>
                <ScrollView style={{ flex: 1 }}>
                  {/* Header Image */}
                  <Image
                    source={{ uri: selectedProduct.thumbnail }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalBody}>
                    <Text style={styles.modalProductTitle}>
                      {selectedProduct.title}
                    </Text>
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceText}>
                        ${selectedProduct.price}
                      </Text>
                      <Text style={styles.modalShippingText}>
                        + ${selectedProduct.shipping} shipping
                      </Text>
                    </View>

                    {/* Scores */}
                    <View style={styles.scoresRow}>
                      <Text style={styles.scoresText}>
                        MB: {selectedProduct.mbScore?.toFixed(2)}
                      </Text>
                      <Text style={styles.scoresText}>
                        CB: {selectedProduct.cbScore?.toFixed(2)}
                      </Text>
                    </View>

                    {/* Payment, rating, etc. */}
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

                    {/* Compare Section (demo) */}
                    <View style={styles.compareContainer}>
                      <Text style={styles.compareHeading}>Compare with other options:</Text>
                      <Text style={styles.compareText}>
                        E.g., cost differences, shipping, rating, payment methods, etc.
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBuyButton}
                    onPress={() => Linking.openURL(selectedProduct.link)}
                  >
                    <Text style={styles.modalBuyButtonText}>
                      View on {selectedProduct.source}
                    </Text>
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
  // Container
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: '#1C1C1C',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
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

  // Store Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPill: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    elevation: 2,
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

  // Loading
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 16,
  },

  // Product List
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },

  // Product Card
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
  modalImage: {
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
  modalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  modalReviewCount: {
    color: '#999',
    fontSize: 13,
    marginLeft: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.9,
    height: '85%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
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
  modalCloseButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#444',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalBuyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  modalBuyButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  viewOnStoreButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  viewOnStoreText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchResultScreen;
