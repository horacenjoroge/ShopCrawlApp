import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Share, 
  Platform, 
  Animated, 
  ActivityIndicator,
  Modal,
  Linking,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Removed LinearGradient import

const { width } = Dimensions.get('window');
const productCardWidth = width * 0.8;

// API Base URL
const API_BASE_URL = ' https://4ff1-41-90-172-251.ngrok-free.app/api';

// API configurations
const AMAZON_API_CONFIG = {
  baseURL: 'https://real-time-amazon-data.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
    'x-rapidapi-key': 'fa261c00d5msh6541b9a512b5ab6p164a0bjsnf5e94495e08d'
  }
};

const SERP_API_KEY = 'f5f86e39c42a05dcb61c807ec5782b89eb3149cdf168e103c7e7f8889b87cb18';

// Trending categories
const trendingCategories = [
  { id: 1, name: 'Tech Gadgets', color: '#6366F1' },
  { id: 2, name: 'Fitness Gear', color: '#F59E0B' },
  { id: 3, name: 'Home Decor', color: '#10B981' },
  { id: 4, name: 'Beauty Products', color: '#EC4899' },
];

// Fallback products if API fails
const FALLBACK_PRODUCTS = [
  {
    id: 'fallback1',
    name: 'Premium Wireless Earbuds',
    description: 'Noise cancelling with 24-hour battery life',
    price: '$79.99',
    image: 'https://via.placeholder.com/300',
    store: 'Amazon',
    productUrl: 'https://www.amazon.com',
    category: 'Electronics',
    recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
  },
  {
    id: 'fallback2',
    name: 'Smart Fitness Tracker',
    description: 'Track your activity, sleep, and heart rate',
    price: '$49.99',
    image: 'https://via.placeholder.com/300',
    store: 'Amazon',
    productUrl: 'https://www.amazon.com',
    category: 'Fitness',
    recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
  }
];

// Cache functions for product data
const cacheProduct = async (asin, product) => {
  try {
    await AsyncStorage.setItem(`product_${asin}`, JSON.stringify(product));
  } catch (e) {
    console.error('Error caching product:', e);
  }
};

const getCachedProduct = async (asin) => {
  try {
    const cached = await AsyncStorage.getItem(`product_${asin}`);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Error getting cached product:', e);
    return null;
  }
};

// Category Pill Component
const CategoryPill = ({ category, onPress }) => (
  <TouchableOpacity 
    style={[styles.categoryPill, { backgroundColor: category.color }]} 
    onPress={() => onPress(category.name)}
  >
    <Text style={styles.categoryPillText}>{category.name}</Text>
  </TouchableOpacity>
);

// Recommendation Badge Component
const RecommendBadge = ({ icon }) => (
  <View style={styles.recommendBadge}>
    {typeof icon === 'string' ? (
      <Image source={{ uri: icon }} style={styles.recommendIcon} resizeMode="contain" />
    ) : (
      <Image source={icon} style={styles.recommendIcon} resizeMode="contain" />
    )}
  </View>
);

// Share Feature Component
const ShareFeature = () => {
  const onShare = async () => {
    try {
      await Share.share({
        message: 'Check out these great deals on ShopCrawl!',
        url: 'https://shopcrawl.com',
        title: 'ShopCrawl Deals'
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.shareContainer}>
      <Text style={styles.shareTitle}>Love ShopCrawl?</Text>
      <TouchableOpacity style={styles.shareButton} onPress={onShare}>
        <Icon name="share" type="feather" size={18} color="#FFF" style={styles.shareIcon} />
        <Text style={styles.shareButtonText}>Share with friends</Text>
      </TouchableOpacity>
    </View>
  );
};

// Deal Card Component
const DealCard = ({ item, onSave, onPress, isSaved }) => (
  <TouchableOpacity 
    onPress={() => onPress(item)}
    activeOpacity={0.9}
  >
    <Card style={styles.dealCard}>
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}
      <TouchableOpacity 
        style={styles.bookmarkButton} 
        onPress={() => onSave(item)}
      >
        <Icon 
          name={isSaved ? "bookmark" : "bookmark-outline"} 
          type="material-community" 
          size={24} 
          color={isSaved ? "#F59E0B" : "#FFF"} 
        />
      </TouchableOpacity>
      <Card.Cover 
        source={{ uri: item.image }} 
        style={styles.dealImage} 
      />
      <Card.Content style={styles.dealContent}>
        <View style={styles.storeContainer}>
          <Image 
            source={require('../../../assets/amazon.jpg')} 
            style={styles.storeIcon} 
            resizeMode="contain" 
          />
          <Text style={styles.storeName}>{item.store || 'Amazon'}</Text>
        </View>
        <Text style={styles.dealName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dealDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        <View style={styles.priceRow}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          )}
          <Text style={styles.discountedPrice}>{item.price}</Text>
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

// Main HomeScreen Component
const HomeScreen = ({ navigation, route = {} }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickyHeaderPosition = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState('');
  const [avatarLetter, setAvatarLetter] = useState('S');
  const [deals, setDeals] = useState([]);
  const [trendingDeals, setTrendingDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState([]);

  // Check if a product is saved
  const isProductSaved = useCallback((productId) => {
    return savedProducts.some(item => item.id === productId);
  }, [savedProducts]);

  // Handle search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== "") {
      handleSearch();
    }
  };

  // Fetch user data (email, etc.)
  const fetchUserData = async () => {
    try {
      let email = route.params?.userEmail || await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
        setAvatarLetter(email.charAt(0).toUpperCase());
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
  };

  // Load saved products from AsyncStorage
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

  // Initial load of user data, deals and saved products
  useEffect(() => {
    fetchUserData();
    fetchDeals();
    loadSavedProducts();
    fetchTrendingFromHistory();
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      loadSavedProducts();
      return () => {};
    }, [])
  );

  // Fetch trending products based on user's search history
  const fetchTrendingFromHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // First get user's search history
      const historyResponse = await axios.get(`${API_BASE_URL}/history`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      // Extract search terms from history
      let searchTerms = [];
      if (historyResponse.data.today) {
        searchTerms = [...searchTerms, ...historyResponse.data.today.map(h => h.query)];
      }
      if (historyResponse.data.pastWeek) {
        searchTerms = [...searchTerms, ...historyResponse.data.pastWeek.map(h => h.query)];
      }
      if (historyResponse.data.pastMonth) {
        searchTerms = [...searchTerms, ...historyResponse.data.pastMonth.map(h => h.query)];
      }

      // If no search history, use trending categories
      if (searchTerms.length === 0) {
        searchTerms = trendingCategories.map(cat => cat.name);
      }

      // Select a random search term from history
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      // Use it to fetch trending products
      if (randomTerm) {
        const results = await searchProducts(randomTerm);
        if (results.length > 0) {
          setTrendingDeals(results);
        }
      }
    } catch (error) {
      console.error('Error fetching trending from history:', error);
      // Fallback to trending categories if history API fails
      const randomCat = trendingCategories[Math.floor(Math.random() * trendingCategories.length)];
      const results = await searchProducts(randomCat.name);
      if (results.length > 0) {
        setTrendingDeals(results);
      }
    }
  };

  // Search using SERP API
  const searchSerpApi = async (query) => {
    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: { q: query, api_key: SERP_API_KEY, engine: 'google_shopping', gl: 'us', hl: 'en' },
      });

      if (response.data?.shopping_results?.length) {
        return response.data.shopping_results.map((item, index) => ({
          id: `serp-${index}-${Date.now()}`,
          name: item.title || 'Unknown Product',
          description: item.snippet || '',
          price: item.price || '$0',
          originalPrice: '',
          image: item.thumbnail || 'https://via.placeholder.com/300',
          store: item.source || 'Google Shopping',
          category: query,
          productUrl: item.link,
          recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
        }));
      }
      return [];
    } catch (error) {
      console.error('SERP API search error:', error);
      return [];
    }
  };

  // Search using Amazon API
  const searchAmazonProducts = async (query) => {
    try {
      const response = await axios.get(`${AMAZON_API_CONFIG.baseURL}/search`, {
        headers: AMAZON_API_CONFIG.headers,
        params: { query, country: 'US', page: '1' }
      });

      if (response.data?.data?.products) {
        const products = response.data.data.products.slice(0, 5).map(product => ({
          id: product.asin,
          name: product.title || 'Unknown Product',
          description: product.description || '',
          originalPrice: product.original_price || '',
          price: product.price_string || product.original_price || '$0',
          discount: product.is_on_sale ? `${product.discount_percentage || ''}% off!` : null,
          image: product.image_url || (product.images?.[0] || 'https://via.placeholder.com/300'),
          store: 'Amazon',
          category: typeof product.category === 'object' ? product.category.name : (product.category || query),
          productUrl: product.product_url,
          recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
        }));
        products.forEach(p => cacheProduct(p.id, p));
        return products;
      }
      return [];
    } catch (error) {
      console.error('Amazon API search error:', error);
      return [];
    }
  };

  // Combined search function (tries SERP first, then Amazon)
  const searchProducts = async (query) => {
    setError(null);
    let results = await searchSerpApi(query);
    if (results.length === 0) {
      results = await searchAmazonProducts(query);
    }
    if (results.length === 0) {
      setError(`No results found for "${query}"`);
    }
    return results;
  };

  // Fetch product details from Amazon API
  const fetchProductDetails = async (asin) => {
    const cached = await getCachedProduct(asin);
    if (cached) return cached;

    try {
      const response = await axios.get(`${AMAZON_API_CONFIG.baseURL}/product-details`, {
        headers: AMAZON_API_CONFIG.headers,
        params: { asin, country: 'US' }
      });

      if (response.data?.data) {
        const productData = response.data.data;
        const product = {
          id: asin,
          name: productData.title || 'Unknown Product',
          description: productData.description || '',
          originalPrice: productData.original_price || '',
          price: productData.price_string || productData.original_price || '$0',
          discount: productData.is_on_sale ? `${productData.discount_percentage || ''}% off!` : null,
          image: productData.images?.[0] || 'https://via.placeholder.com/300',
          store: 'Amazon',
          category: typeof productData.category === 'object' ? productData.category.name : (productData.category || 'Amazon Product'),
          productUrl: productData.product_url || `https://www.amazon.com/dp/${asin}`,
          recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
        };
        await cacheProduct(asin, product);
        return product;
      }
      throw new Error('Invalid product data received');
    } catch (error) {
      console.error(`Primary endpoint failed for ASIN ${asin}:`, error.message);
      
      // Try search endpoint as fallback if rate limited
      if (error.response?.status === 429) {
        console.log(`429 received for ASIN ${asin}, attempting search endpoint fallback`);
        try {
          const searchResponse = await axios.get(`${AMAZON_API_CONFIG.baseURL}/search`, {
            headers: AMAZON_API_CONFIG.headers,
            params: { query: asin, country: 'US', page: '1' }
          });

          if (searchResponse.data?.data?.products?.length > 0) {
            const product = searchResponse.data.data.products[0];
            const formattedProduct = {
              id: asin,
              name: product.title || 'Unknown Product',
              description: product.description || '',
              originalPrice: product.original_price || '',
              price: product.price_string || product.original_price || '$0',
              discount: product.is_on_sale ? `${product.discount_percentage || ''}% off!` : null,
              image: product.image_url || product.images?.[0] || 'https://via.placeholder.com/300',
              store: 'Amazon',
              category: typeof product.category === 'object' ? product.category.name : (product.category || 'Amazon Product'),
              productUrl: product.product_url || `https://www.amazon.com/dp/${asin}`,
              recommendations: [{ id: '1', icon: require('../../../assets/amazon.jpg') }]
            };
            await cacheProduct(asin, formattedProduct);
            return formattedProduct;
          }
        } catch (searchError) {
          console.error(`Search fallback failed for ASIN ${asin}:`, searchError.message);
        }
      }

      // Return a placeholder if all else fails
      return {
        id: asin,
        name: 'Product Information Unavailable',
        description: 'Could not retrieve product details due to API limits.',
        price: 'N/A',
        image: 'https://via.placeholder.com/300',
        store: 'Amazon',
        category: 'Unknown',
        productUrl: `https://www.amazon.com/dp/${asin}`
      };
    }
  };

  // Fetch initial deals
  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const DEFAULT_PRODUCT_ASINS = [
        'B07ZPKBL9V', 'B08RCJCGDJ', 'B08PF1Y7Q5', 'B07VKG1LFZ'
      ];

      const productPromises = DEFAULT_PRODUCT_ASINS.map(async (asin) => {
        try {
          return await fetchProductDetails(asin);
        } catch (err) {
          console.error(`Skipping ASIN ${asin} due to error:`, err.message);
          return null;
        }
      });

      const productsData = await Promise.all(productPromises);
      let validProducts = productsData.filter(product => product !== null);

      if (validProducts.length === 0) {
        console.log('No products loaded from API, using fallback data');
        setError('Showing sample products due to API limits. Search functionality still available.');
        validProducts = FALLBACK_PRODUCTS;
      } else if (validProducts.length < DEFAULT_PRODUCT_ASINS.length) {
        setError(`Loaded ${validProducts.length} of ${DEFAULT_PRODUCT_ASINS.length} products. Using fallback for unavailable items.`);
        validProducts = [...validProducts, ...FALLBACK_PRODUCTS.slice(0, DEFAULT_PRODUCT_ASINS.length - validProducts.length)];
      }

      setDeals(validProducts);
    } catch (err) {
      console.error('Unexpected error in fetchDeals:', err);
      setError('Failed to load deals. Showing sample products.');
      setDeals(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Save product to favorites (both locally and on backend)
  const handleSaveProduct = async (product) => {
    try {
      // First get the auth token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No auth token found, please log in to save products');
        // You could show a login prompt here
        return;
      }
      
      // Format product data consistently for the API
      const productData = {
        productId: product.id,
        productData: {
          name: product.name,
          price: product.price,
          image: product.image,
          store: product.store || 'Amazon',
          description: product.description || 'No description available',
          productUrl: product.productUrl,
          category: typeof product.category === 'object' ? product.category.name : product.category
        }
      };
      
      // Make API call to save/unsave the product
      console.log(`Saving product to ${API_BASE_URL}/products/save`);
      const response = await axios.post(
        `${API_BASE_URL}/products/save`, 
        productData,
        { headers: { 'x-auth-token': token } }
      );
      
      console.log('Save response:', response.data);
      
      // Also update locally for immediate UI feedback
      const isAlreadySaved = savedProducts.some(item => item.id === product.id);
      let updatedSavedProducts;
      
      if (isAlreadySaved) {
        // Remove product from saved list
        updatedSavedProducts = savedProducts.filter(item => item.id !== product.id);
      } else {
        // Add product to saved list
        updatedSavedProducts = [...savedProducts, product];
      }
      
      // Update state and AsyncStorage
      setSavedProducts(updatedSavedProducts);
      await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedSavedProducts));
      
    } catch (err) {
      console.error('Error saving product to backend:', err);
      
      // If server call fails, at least save to local storage as fallback
      try {
        const isAlreadySaved = savedProducts.some(item => item.id === product.id);
        let updatedSavedProducts;
        
        if (isAlreadySaved) {
          updatedSavedProducts = savedProducts.filter(item => item.id !== product.id);
        } else {
          updatedSavedProducts = [...savedProducts, product];
        }
        
        setSavedProducts(updatedSavedProducts);
        await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedSavedProducts));
        
        console.log(isAlreadySaved ? 
          'Product removed from saved items (local only)' : 
          'Product saved locally (API call failed)'
        );
      } catch (localErr) {
        console.error('Error saving product locally:', localErr);
      }
    }
  };

  // Handle search action
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery);
      setLoading(true);
      try {
        const results = await searchProducts(searchQuery);
        if (results.length > 0) {
          setDeals(results);
        }
        navigation.navigate('SearchResults', { query: searchQuery, results });
      } catch (error) {
        console.error('Search error:', error);
        setError('Something went wrong with your search. Please try again.');
      } finally {
        setLoading(false);
        setSearchQuery('');
      }
    }
  };

  // Save search to history
  const saveSearchToHistory = async (query) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      
      await axios.post(`${API_BASE_URL}/history`, 
        { query },
        { headers: { 'x-auth-token': token } }
      );
    } catch (err) {
      console.error('Error saving search to history:', err);
    }
  };

  // Handle category selection
  const handleCategorySelect = async (categoryName) => {
    saveSearchToHistory(categoryName);
    setLoading(true);
    try {
      const results = await searchProducts(categoryName);
      if (results.length > 0) {
        setDeals(results);
      }
      navigation.navigate('SearchResults', { query: categoryName, results });
    } catch (error) {
      console.error('Category search error:', error);
      setError('Something went wrong with your search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show product detail modal
  const showProductDetail = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  // Open product URL in browser
  const openProductUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // Animation values for sticky header
  const headerOpacity = scrollY.interpolate({
    inputRange: [stickyHeaderPosition.current, stickyHeaderPosition.current + 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const onDealsLayout = (event) => {
    stickyHeaderPosition.current = event.nativeEvent.layout.y - 60;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Avatar Profile Button */}
      <View style={styles.avatarTopContainer}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>

      {/* Sticky Search Header */}
      <Animated.View 
        style={[styles.stickyHeader, {
          opacity: headerOpacity,
          transform: [{
            translateY: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          }]
        }]}
      >
        <View style={styles.stickySearchBarWrapper}>
          <View style={styles.stickySearchBar}>
            <Icon name="search" type="feather" size={18} color="#888" style={{marginRight: 8}} />
            <TextInput
              style={styles.stickySearchInput}
              placeholder="Search products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main Search Section - Gradient replaced with regular View */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Discover Amazing Deals</Text>
          <View style={styles.searchBar}>
            <Icon name="search" type="feather" size={18} color="#888" style={{marginLeft: 10}} />
            <TextInput
              style={styles.searchInput}
              placeholder="What are you shopping for?"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
          <Text style={styles.trendingText}>Trending Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {trendingCategories.map(category => (
              <CategoryPill 
                key={category.id} 
                category={category} 
                onPress={handleCategorySelect} 
              />
            ))}
          </ScrollView>
        </View>

        {/* Share Section */}
        <ShareFeature />

        {/* Today's Deals Section */}
        <View style={styles.sectionContainer} onLayout={onDealsLayout}>
          <Text style={styles.sectionTitle}>Today's Top Deals</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Finding the best deals...</Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchDeals}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {deals.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={productCardWidth + 15}
                  contentContainerStyle={styles.dealsScrollContainer}
                >
                  {deals.map(deal => (
                    <DealCard 
                      key={deal.id} 
                      item={deal} 
                      onSave={handleSaveProduct}
                      onPress={showProductDetail}
                      isSaved={isProductSaved(deal.id)}
                    />
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        {/* Trending Based on History Section */}
        {trendingDeals.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={productCardWidth + 15}
              contentContainerStyle={styles.dealsScrollContainer}
            >
              {trendingDeals.map(deal => (
                <DealCard 
                  key={deal.id} 
                  item={deal} 
                  onSave={handleSaveProduct}
                  onPress={showProductDetail}
                  isSaved={isProductSaved(deal.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={{ height: 20 }} />
      </Animated.ScrollView>

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="x" type="feather" size={24} color="#666" />
                </TouchableOpacity>
                
                <Image 
                  source={{ uri: selectedProduct.image }} 
                  style={styles.modalImage} 
                  resizeMode="contain"
                />
                
                <TouchableOpacity 
                  style={styles.modalBookmarkButton}
                  onPress={() => handleSaveProduct(selectedProduct)}
                >
                  <Icon 
                    name={isProductSaved(selectedProduct.id) ? "bookmark" : "bookmark-outline"} 
                    type="material-community" 
                    size={28} 
                    color={isProductSaved(selectedProduct.id) ? "#F59E0B" : "#666"} 
                  />
                </TouchableOpacity>
                
                <View style={styles.modalStoreRow}>
                  <View style={styles.modalStoreContainer}>
                    <Image 
                      source={require('../../../assets/amazon.jpg')} 
                      style={styles.modalStoreIcon} 
                      resizeMode="contain" 
                    />
                    <Text style={styles.modalStoreName}>{selectedProduct.store || 'Amazon'}</Text>
                  </View>
                  <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
                </View>
                
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedProduct.description || 'No description available'}
                </Text>
                
                <TouchableOpacity 
                  style={styles.visitButton}
                  onPress={() => openProductUrl(selectedProduct.productUrl)}
                >
                  <Text style={styles.visitButtonText}>View on {selectedProduct.store}</Text>
                  <Icon name="external-link" type="feather" size={18} color="#FFF" style={{marginLeft: 8}} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  avatarTopContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  stickySearchBarWrapper: {
    backgroundColor: '#FFF',
    width: '100%',
  },
  stickySearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 40,
  },
  stickySearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  searchSection: {
    paddingTop: 80,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#6366F1', // Solid background color instead of gradient
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  trendingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingBottom: 5,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 5,
  },
  categoryPillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  shareContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareIcon: {
    marginRight: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dealsScrollContainer: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  dealCard: {
    width: productCardWidth,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    left: 0,
    top: 15,
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookmarkButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dealImage: {
    height: 180,
    backgroundColor: '#f8f9fa',
  },
  dealContent: {
    padding: 15,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  storeName: {
    fontSize: 14,
    color: '#666',
  },
  dealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  dealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  modalBookmarkButton: {
    position: 'absolute',
    top: 165,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalStoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalStoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStoreIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  modalStoreName: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  visitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;