import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Icon as RNEIcon } from '@rneui/themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SERP API key
const SERP_API_KEY = '7adf35f97c008c6ddce7921ee949027b7b8b34fd4fa969bd54d613a413093dc1';

// Amazon API configuration (as backup)
const AMAZON_API_CONFIG = {
  baseURL: 'https://real-time-amazon-data.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
    'x-rapidapi-key': 'fa261c00d5msh6541b9a512b5ab6p164a0bjsnf5e94495e08d'
  }
};

// Default search terms for featured products
const DEFAULT_SEARCH_TERMS = [
  'Best smart phones', 
  'Top rated headphones', 
  'Fitness trackers',
  'Popular laptops'
];

const SearchResultScreen = ({ query = '', results = [], navigation }) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState(['All', 'Amazon', 'Walmart', 'eBay', 'Target', 'Bestbuy']);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedProducts, setSavedProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Load saved products from AsyncStorage
  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedProducts');
        if (saved) {
          setSavedProducts(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved products:', error);
      }
    };
    
    loadSavedProducts();
    fetchFeaturedProducts();
  }, []);

  // Handle initial load of results and query
  useEffect(() => {
    // Set initial search query from props
    if (query) {
      setSearchQuery(query);
    }
    
    // Initialize products state on first load
    if (results && results.length > 0 && products.length === 0) {
      console.log('Setting initial products from results props:', results.length);
      setProducts(results);
      
      // Extract unique stores from results
      const uniqueStores = ['All', ...new Set(results.map(item => item.store).filter(Boolean))];
      if (uniqueStores.length > 1) {
        setStores(uniqueStores);
      }
    } else if (query && products.length === 0 && !loading) {
      // Load products from API if needed
      console.log('Fetching initial products for query:', query);
      fetchProducts(query);
    }
  }, []); // Empty dependency array to run only once on mount

  // Check if a product is saved
  const isProductSaved = useCallback((productId) => {
    return savedProducts.some(item => item.id === productId);
  }, [savedProducts]);
  
  // Save or remove a product
  const handleSaveProduct = async (product) => {
    try {
      // Get existing saved products from AsyncStorage
      const savedProductsJson = await AsyncStorage.getItem('savedProducts');
      let savedProductsList = savedProductsJson ? JSON.parse(savedProductsJson) : [];
      
      // Check if product is already saved
      const isAlreadySaved = savedProductsList.some(item => item.id === product.id);
      
      if (isAlreadySaved) {
        // Remove from saved products
        savedProductsList = savedProductsList.filter(item => item.id !== product.id);
      } else {
        // Add to saved products
        savedProductsList.push(product);
      }
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('savedProducts', JSON.stringify(savedProductsList));
      
      // Update the saved products state
      setSavedProducts(savedProductsList);
      
      // Show feedback to the user (could use a toast or snackbar)
      console.log(isAlreadySaved ? 'Product removed from saved items' : 'Product saved');
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  // Fetch featured products for modals from random search terms
  const fetchFeaturedProducts = async () => {
    try {
      console.log('Fetching featured products...');
      // Pick a random search term from the defaults
      const randomTerm = DEFAULT_SEARCH_TERMS[Math.floor(Math.random() * DEFAULT_SEARCH_TERMS.length)];
      
      console.log(`Fetching featured products for "${randomTerm}"`);
      const results = await searchSerpApi(randomTerm);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} featured products`);
        setFeaturedProducts(results);
      } else {
        console.log('No featured products found, using fallback');
        // Fallback to hardcoded featured product if API fails
        setFeaturedProducts([{
          id: 'featured-fallback',
          title: 'Featured Product',
          specs: 'This is a featured product that you might be interested in.',
          price: '$99.99',
          image: 'https://via.placeholder.com/300',
          store: 'ShopCrawl',
          product_link: 'https://google.com',
          rating: 4.5,
          reviews: '(123 reviews)'
        }]);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Set fallback featured product
      setFeaturedProducts([{
        id: 'featured-fallback',
        title: 'Featured Product',
        specs: 'This is a featured product that you might be interested in.',
        price: '$99.99',
        image: 'https://via.placeholder.com/300',
        store: 'ShopCrawl',
        product_link: 'https://google.com',
        rating: 4.5,
        reviews: '(123 reviews)'
      }]);
    }
  };

  // Search using SERP API
  const searchSerpApi = async (searchTerm) => {
    try {
      console.log(`Searching for "${searchTerm}" using SERP API`);
      
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: searchTerm,
          api_key: SERP_API_KEY,
          engine: 'google_shopping',
          gl: 'us',
          hl: 'en',
        },
      });
      
      console.log('SERP API response received');
      
      // Check if we have shopping results
      if (response.data && response.data.shopping_results && Array.isArray(response.data.shopping_results)) {
        const results = response.data.shopping_results.map((item, index) => {
          return {
            id: `serp-${index}-${Date.now()}`,
            store: item.source || 'Google Shopping',
            title: item.title || 'Unknown Product',
            price: item.price || '$0',
            image: item.thumbnail || 'https://via.placeholder.com/150',
            specs: item.snippet || '',
            rating: parseFloat(item.rating) || 0, // Default to 0 for invalid ratings
            reviews: item.reviews ? `(${item.reviews} reviews)` : '(0 reviews)',
            product_link: item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title || searchTerm)}`
          };
        });
        
        // Extract unique stores
        const foundStores = ['All', ...new Set(results.map(item => item.store))];
        if (foundStores.length > 1) {
          setStores(foundStores);
        }
        
        console.log(`Found ${results.length} results from SERP API`);
        return results;
      } else {
        console.log('No shopping results found in SERP API response');
        return [];
      }
    } catch (error) {
      console.error('SERP API search error:', error);
      return [];
    }
  };

  // Search using Amazon API (as backup)
  const searchAmazonProducts = async (searchTerm) => {
    try {
      console.log(`Searching for "${searchTerm}" using Amazon API`);
      
      const response = await axios.get(`${AMAZON_API_CONFIG.baseURL}/search`, {
        headers: AMAZON_API_CONFIG.headers,
        params: {
          query: searchTerm,
          country: 'US',
          page: '1'
        }
      });
      
      if (response.data && response.data.data && response.data.data.products) {
        const results = response.data.data.products.slice(0, 10).map((product, index) => ({
          id: product.asin || `amazon-${index}-${Date.now()}`,
          store: 'Amazon',
          title: product.title || 'Unknown Product',
          price: product.price_string || product.original_price || '$0',
          image: product.image_url || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150'),
          specs: product.description || '',
          rating: product.rating || 0,
          reviews: product.reviews ? `(${product.reviews.total_reviews} reviews)` : '(0 reviews)',
          product_link: product.url || `https://www.amazon.com/s?k=${encodeURIComponent(product.title || searchTerm)}`
        }));
        
        console.log(`Found ${results.length} results from Amazon API`);
        return results;
      }
      
      console.log('No products found in Amazon API response');
      return [];
    } catch (error) {
      console.error('Amazon API search error:', error);
      return [];
    }
  };

  const fetchProducts = async (searchTerm) => {
    setLoading(true);
    
    try {
      console.log('Fetching products for:', searchTerm);
      // First try SERP API
      let results = await searchSerpApi(searchTerm);
      
      // If SERP failed, try Amazon API as backup
      if (results.length === 0) {
        console.log('No SERP results, trying Amazon API');
        results = await searchAmazonProducts(searchTerm);
      }
      
      // If we have results, update state
      if (results.length > 0) {
        console.log(`Found ${results.length} products`);
        setProducts(results);
      } else {
        console.log('No results found, using fallback');
        // If no results were found, add a fallback message or use mock data
        setProducts([{
          id: 'no-results',
          store: 'No Results',
          title: 'No products found for your search',
          price: '',
          image: 'https://via.placeholder.com/150',
          specs: 'Please try a different search term.',
          rating: 0,
          reviews: ''
        }]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use fallback mock data
      setProducts([{
        id: 'error',
        store: 'Error',
        title: 'Something went wrong',
        price: '',
        image: 'https://via.placeholder.com/150',
        specs: 'Please try again later.',
        rating: 0,
        reviews: ''
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Open product link in browser
  const openProductLink = (url) => {
    console.log('Opening URL:', url);
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Could not open URL:', err);
        // Fallback to a common search if the URL is invalid
        Linking.openURL('https://www.google.com/search?q=' + encodeURIComponent(selectedProduct?.title || ''));
      });
    } else if (selectedProduct?.title) {
      // If no URL but we have a product name, search for it
      console.log('No URL available, searching for product name');
      Linking.openURL('https://www.google.com/search?q=' + encodeURIComponent(selectedProduct.title));
    } else {
      console.log('No URL or product name available');
      // Last resort fallback
      Linking.openURL('https://www.google.com');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchProducts(searchQuery);
    }
  };

  const handleStoreFilter = (store) => {
    setSelectedStore(store);
  };

  // Show a random featured product in modal
  const showRandomFeaturedProduct = async () => {
    console.log('Showing random featured product');
    console.log('Current featured products:', featuredProducts.length);
    
    if (featuredProducts.length > 0) {
      const randomIndex = Math.floor(Math.random() * featuredProducts.length);
      const product = featuredProducts[randomIndex];
      console.log('Selected product:', product.title);
      
      setSelectedProduct(product);
      setModalVisible(true);
    } else {
      console.log('No featured products available, fetching new ones');
      // Create a fallback product in case fetching fails
      const fallbackProduct = {
        id: 'fallback-1',
        title: 'Fallback Featured Product',
        specs: 'We could not load a featured product right now. Please try again later.',
        price: '$99.99',
        image: 'https://via.placeholder.com/300',
        store: 'ShopCrawl',
        product_link: 'https://google.com',
        rating: 4.5,
        reviews: '(0 reviews)'
      };
      
      try {
        // Fetch and wait for results directly, don't rely on state update
        const results = await searchSerpApi(DEFAULT_SEARCH_TERMS[Math.floor(Math.random() * DEFAULT_SEARCH_TERMS.length)]);
        
        if (results && results.length > 0) {
          // Use the results directly instead of accessing state
          const randomIndex = Math.floor(Math.random() * results.length);
          const product = results[randomIndex];
          console.log('Selected new product:', product.title);
          
          // Update state for future use
          setFeaturedProducts(results);
          
          // Show the selected product
          setSelectedProduct(product);
        } else {
          // If no results, use fallback
          setSelectedProduct(fallbackProduct);
        }
      } catch (error) {
        console.error('Error fetching featured products for modal:', error);
        setSelectedProduct(fallbackProduct);
      }
      
      setModalVisible(true);
    }
  };

  // Get filtered products based on selected store
  const getFilteredProducts = () => {
    if (selectedStore === 'All') {
      return products;
    }
    return products.filter(product => product.store === selectedStore);
  };

  // Star rating component with proper error handling
  const StarRating = ({ rating }) => {
    // Handle invalid ratings by defaulting to zero
    const safeRating = !isNaN(rating) && rating >= 0 ? rating : 0;
    
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon key={`full-${i}`} name="star" size={16} color="#FFC107" />
        ))}
        {halfStar && <Icon key="half" name="star-half" size={16} color="#FFC107" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFC107" />
        ))}
      </View>
    );
  };

  // Render store filter buttons
  const renderStoreButton = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.storeButton,
        selectedStore === item && styles.selectedStoreButton
      ]}
      onPress={() => handleStoreFilter(item)}
    >
      <Text 
        style={[
          styles.storeButtonText,
          selectedStore === item && styles.selectedStoreButtonText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render products with proper keys
  const renderProducts = () => {
    const filteredProducts = getFilteredProducts();
    
    return filteredProducts.map((item, index) => (
      <TouchableOpacity 
        key={`product-${item.id || index}`}
        style={styles.productCard}
        onPress={() => {
          setSelectedProduct(item);
          setModalVisible(true);
        }}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* Bookmark icon with improved visibility */}
        <TouchableOpacity 
          style={styles.bookmarkButton} 
          onPress={() => handleSaveProduct(item)}
        >
          <RNEIcon 
            name={isProductSaved(item.id) ? "bookmark" : "bookmark-outline"} 
            type="material-community" 
            size={24} 
            color="#FFC107" 
          />
        </TouchableOpacity>
        
        <View style={styles.productInfo}>
          <View style={styles.storeContainer}>
            <Text style={styles.storeName}>{item.store}</Text>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.productSpecs} numberOfLines={2}>{item.specs}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={styles.reviewCount}>{item.reviews}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search across multiple stores..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#FFC107" />
        </TouchableOpacity>
      </View>
      
      {/* Featured banner */}
      <TouchableOpacity
        style={styles.featuredBanner}
        onPress={showRandomFeaturedProduct}
      >
        <Text style={styles.featuredText}>Discover something new!</Text>
        <Text style={styles.featuredSubtext}>Tap to see featured products</Text>
      </TouchableOpacity>
      
      {/* Store filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={stores}
          renderItem={renderStoreButton}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeList}
        />
      </View>
      
      {/* Products section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Results for "{query || searchQuery || 'All Products'}"
        </Text>
      </View>
      
      {/* Loading indicator or Products */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>Searching stores...</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.productsContainer}
        >
          {renderProducts()}
        </ScrollView>
      )}
      
      {/* Product detail modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Product details */}
            {selectedProduct ? (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalProductContainer}>
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.modalProductImage}
                    resizeMode="contain"
                  />
                  
                  {/* Bookmark button with improved visibility */}
                  <TouchableOpacity
                    style={styles.modalBookmarkButton}
                    onPress={() => handleSaveProduct(selectedProduct)}
                  >
                    <RNEIcon
                      name={isProductSaved(selectedProduct.id) ? "bookmark" : "bookmark-outline"}
                      type="material-community"
                      size={28}
                      color="#FFC107"
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.modalProductDetails}>
                    <Text style={styles.modalProductTitle}>{selectedProduct.title}</Text>
                    
                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalStoreName}>{selectedProduct.store}</Text>
                      <Text style={styles.modalProductPrice}>{selectedProduct.price}</Text>
                    </View>
                    
                    <Text style={styles.modalProductSpecs}>
                      {selectedProduct.specs || 'No description available for this product.'}
                    </Text>
                    
                    <View style={styles.modalRatingRow}>
                      <StarRating rating={selectedProduct.rating} />
                      <Text style={styles.modalReviewCount}>{selectedProduct.reviews}</Text>
                    </View>
                    
                    {/* Save product button */}
                    <TouchableOpacity 
                      style={styles.saveProductButton}
                      onPress={() => handleSaveProduct(selectedProduct)}
                    >
                      <Text style={styles.saveProductText}>
                        {isProductSaved(selectedProduct.id) ? 'Remove from Saved' : 'Save Product'}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* View on store button */}
                    <TouchableOpacity 
                      style={styles.viewOnStoreButton}
                      onPress={() => openProductLink(selectedProduct.product_link)}
                    >
                      <Text style={styles.viewOnStoreText}>
                        View on {selectedProduct.store}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            ) : (
              // Fallback content if no product is selected
              <View style={styles.modalFallbackContainer}>
                <ActivityIndicator size="large" color="#FFC107" />
                <Text style={styles.modalFallbackText}>Loading product details...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBanner: {
    backgroundColor: '#FFC107',
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  featuredSubtext: {
    fontSize: 12,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  storeList: {
    paddingHorizontal: 12,
  },
  storeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
  },
  selectedStoreButton: {
    backgroundColor: '#FFC107',
  },
  storeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  selectedStoreButtonText: {
    color: '#000',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productsContainer: {
    flexGrow: 0,
    height: 400,
    paddingLeft: 16,
    marginTop: 16,
  },
  productCard: {
    width: 300,
    height: 380,
    marginRight: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#444',
  },
  productInfo: {
    padding: 16,
    flex: 1,
  },
  storeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storeName: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productSpecs: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 12,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    color: '#999',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 400
  },
  loadingText: {
    color: '#FFC107',
    marginTop: 10,
    fontSize: 16
  },
  bookmarkButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker background for better visibility
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's on top
  },
  modalScrollView: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeModalButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalProductContainer: {
    width: '100%',
  },
  modalProductImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#444',
  },
  modalBookmarkButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', // Improved visibility
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalProductDetails: {
    padding: 20,
  },
  modalProductTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalStoreName: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalProductPrice: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalProductSpecs: {
    color: '#CCC',
    fontSize: 16,
    marginBottom: 15,
    lineHeight:  22,
  },
  modalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalReviewCount: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
  },
  saveProductButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveProductText: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalFallbackContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFallbackText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SearchResultScreen;