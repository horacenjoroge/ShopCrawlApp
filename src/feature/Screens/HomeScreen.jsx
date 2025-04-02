


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
  ActivityIndicator
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Get screen dimensions for responsive sizing
const { width } = Dimensions.get('window');
const productCardWidth = width * 0.7;

// Sample data for categories to search
const categories = [
  { id: 1, name: 'Best protein powder', color: '#FFDF85' },
  { id: 2, name: 'Top-rated jogging strollers', color: '#FFA082' },
  { id: 3, name: 'Best moisturizers for dry skin', color: '#87E1E1' },
  { id: 4, name: 'Women\'s hiking boots', color: '#FFB6B6' },
];

// API configurations
const AMAZON_API_CONFIG = {
  baseURL: 'https://real-time-amazon-data.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
    'x-rapidapi-key': 'fa261c00d5msh6541b9a512b5ab6p164a0bjsnf5e94495e08d'
  }
};

// SERP API key
const SERP_API_KEY = '7adf35f97c008c6ddce7921ee949027b7b8b34fd4fa969bd54d613a413093dc1';

// Default product ASINs to fetch if no search is performed
const DEFAULT_PRODUCT_ASINS = [
  'B07ZPKBL9V', // Example ASIN
  'B08RCJCGDJ',
  'B08PF1Y7Q5',
  'B07VKG1LFZ'
];

// Search category component
const CategoryPill = ({ category, onPress }) => (
  <TouchableOpacity 
    style={[styles.categoryPill, { backgroundColor: category.color }]}
    onPress={() => onPress(category.name)}
  >
    <Text style={styles.categoryPillText}>{category.name}</Text>
  </TouchableOpacity>
);

// Recommendation badge component
const RecommendBadge = ({ icon }) => (
  <View style={styles.recommendBadge}>
    {typeof icon === 'string' ? (
      <Image source={{ uri: icon }} style={styles.recommendIcon} resizeMode="contain" />
    ) : (
      <Image source={icon} style={styles.recommendIcon} resizeMode="contain" />
    )}
  </View>
);

// Share feature component
const ShareFeature = () => {
  const onShare = async () => {
    try {
      await Share.share({
        message: 'Check out these great deals on ShopCrawl!',
        url: 'https://shopcrawl.com', // Replace with your actual URL
        title: 'ShopCrawl Deals'
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.shareContainer}>
      <View style={styles.shareIconsRow}>
        <View style={[styles.shareIconCircle, { backgroundColor: '#FFB6B6' }]}>
          <Icon name="smile" type="feather" size={24} color="#000" />
        </View>
        <View style={[styles.shareIconCircle, { backgroundColor: '#FFDF85' }]}>
          <Icon name="heart" type="feather" size={24} color="#000" />
        </View>
        <View style={[styles.shareIconCircle, { backgroundColor: '#87E1E1' }]}>
          <Icon name="smile" type="feather" size={24} color="#000" />
        </View>
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={onShare}>
        <Text style={styles.shareButtonText}>Love ShopCrawl? Share it with friends!</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeShareButton}>
        <Icon name="x" type="feather" size={24} color="#999" />
      </TouchableOpacity>
    </View>
  );
};

// Product card component
const DealCard = ({ item, onSave }) => (
  <Card style={[styles.dealCard, { width: productCardWidth }]}>
    {/* Discount badge */}
    {item.discount && (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
    )}
    
    {/* Bookmark icon */}
    <TouchableOpacity style={styles.bookmarkButton} onPress={() => onSave(item)}>
      <Icon name="bookmark-outline" type="material-community" size={24} color="#888" />
    </TouchableOpacity>
    
    <Card.Cover 
      source={{ uri: item.image }} 
      style={styles.dealImage} 
    />
    
    <Card.Content style={styles.dealContent}>
      <Text style={styles.dealName}>{item.name}</Text>
      <Text style={styles.dealDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      
      {/* Recommendations */}
      {item.recommendations && item.recommendations.length > 0 && (
        <View style={styles.recommendRow}>
          <Text style={styles.recommendText}>RECOMMENDED BY:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recommendBadges}>
              {item.recommendations.map((rec, index) => (
                <RecommendBadge key={index} icon={rec.icon} />
              ))}
              {item.recommendations.length > 4 && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreText}>+{item.recommendations.length - 4}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}
      
      {/* Store and price */}
      <View style={styles.priceRow}>
        <View style={styles.storeContainer}>
          <Image 
            source={require('../../../assets/amazon.jpg')} 
            style={styles.storeIcon} 
            resizeMode="contain" 
          />
          <Text style={styles.storeName}>{item.store || 'Amazon'}</Text>
        </View>
        <View style={styles.priceContainer}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          )}
          <Text style={styles.discountedPrice}>{item.price}</Text>
        </View>
      </View>
    </Card.Content>
    
    {/* Category footer */}
    <TouchableOpacity style={styles.categoryContainer}>
      <Text style={styles.categoryText}>{typeof item.category === 'object' ? item.category.name : (item.category || 'Amazon Product')}</Text>
      <Icon name="arrow-right" type="feather" size={18} color="#000" />
    </TouchableOpacity>
  </Card>
);

const HomeScreen = ({ navigation, route = {} }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickyHeaderPosition = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState('');
  const [avatarLetter, setAvatarLetter] = useState('S');
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== "") {
      handleSearch();
    }
  };
  
  // Get user data from AsyncStorage on component mount
  const fetchUserData = async () => {
    try {
      // First try to get from route params if available
      let email = route.params?.userEmail;
      console.log('Email from route params:', email);
      
      // If not in route params, try AsyncStorage
      if (!email) {
        email = await AsyncStorage.getItem('userEmail');
        console.log('Email from AsyncStorage:', email);
      }
      
      if (email) {
        console.log('Setting user email to:', email);
        setUserEmail(email);
        const firstLetter = email.charAt(0).toUpperCase();
        console.log('Setting avatar letter to:', firstLetter);
        setAvatarLetter(firstLetter);
      } else {
        console.log('No email found');
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
  };
  
  useEffect(() => {
    fetchUserData();
    fetchDeals();
  }, [route.params]);
  
  // Refresh user data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing user data');
      fetchUserData();
      return () => {};
    }, [])
  );
  
  // Function to search products using SERP API
  const searchSerpApi = async (query) => {
    try {
      console.log(`Searching for "${query}" using SERP API`);
      
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: query,
          api_key: SERP_API_KEY,
          engine: 'google_shopping',
          gl: 'us', // Use 'us' for better results
          hl: 'en',
        },
      });
      
      console.log('SERP API response received');
      
      // Check if we have shopping results
      if (response.data && response.data.shopping_results && Array.isArray(response.data.shopping_results)) {
        const results = response.data.shopping_results.map((item, index) => {
          return {
            id: `serp-${index}-${Date.now()}`,
            name: item.title || 'Unknown Product',
            description: item.snippet || '',
            price: item.price || '$0',
            originalPrice: '',
            image: item.thumbnail || 'https://via.placeholder.com/300',
            store: item.source || 'Google Shopping',
            category: query,
            recommendations: [
              { id: '1', icon: require('../../../assets/amazon.jpg') }
            ]
          };
        });
        
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
  
  // Function to search Amazon API
  const searchAmazonProducts = async (query) => {
    try {
      console.log(`Searching for "${query}" using Amazon API`);
      
      const response = await axios.get(`${AMAZON_API_CONFIG.baseURL}/search`, {
        headers: AMAZON_API_CONFIG.headers,
        params: {
          query: query,
          country: 'US',
          page: '1'
        }
      });
      
      if (response.data && response.data.data && response.data.data.products) {
        const results = response.data.data.products.slice(0, 5).map(product => ({
          id: product.asin,
          name: product.title || 'Unknown Product',
          description: product.description || '',
          originalPrice: product.original_price || '',
          price: product.price_string || product.original_price || '$0',
          discount: product.is_on_sale ? `${product.discount_percentage || ''}% off!` : null,
          image: product.image_url || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'),
          store: 'Amazon',
          category: typeof product.category === 'object' ? product.category.name : (product.category || query),
          recommendations: [
            { id: '1', icon: require('../../../assets/amazon.jpg') }
          ]
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
  
  // Combined search function
  const searchProducts = async (query) => {
    setError(null);
    
    // First try SERP API
    let results = await searchSerpApi(query);
    
    // If SERP failed, try Amazon
    if (results.length === 0) {
      console.log('No SERP results, trying Amazon API');
      results = await searchAmazonProducts(query);
    }
    
    if (results.length === 0) {
      setError(`No results found for "${query}"`);
    }
    
    return results;
  };
  
  // Fetch deals from API
  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch multiple product details in parallel
      const productPromises = DEFAULT_PRODUCT_ASINS.map(asin => fetchProductDetails(asin));
      const productsData = await Promise.all(productPromises);
      
      // Filter out any null results
      const validProducts = productsData.filter(product => product !== null);
      
      if (validProducts.length === 0) {
        throw new Error('No products found');
      }
      
      setDeals(validProducts);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch product details from Amazon API
  const fetchProductDetails = async (asin) => {
    try {
      const response = await axios.get(`${AMAZON_API_CONFIG.baseURL}/product-details`, {
        headers: AMAZON_API_CONFIG.headers,
        params: {
          asin: asin,
          country: 'US'
        }
      });
      
      if (response.data && response.data.data) {
        const productData = response.data.data;
        
        // Format product data for our app
        return {
          id: asin,
          name: productData.title || 'Unknown Product',
          description: productData.description || '',
          originalPrice: productData.original_price || '',
          price: productData.price_string || productData.original_price || '$0',
          discount: productData.is_on_sale ? `${productData.discount_percentage || ''}% off!` : null,
          image: productData.images && productData.images.length > 0 ? productData.images[0] : 'https://via.placeholder.com/300',
          store: 'Amazon',
          category: typeof productData.category === 'object' ? productData.category.name : (productData.category || 'Amazon Product'),
          recommendations: [
            { id: '1', icon: require('../../../assets/amazon.jpg') }
          ]
        };
      }
      
      throw new Error('Invalid product data received');
      
    } catch (error) {
      console.error(`Error fetching product details for ASIN ${asin}:`, error);
      // Return a fallback product
      return {
        id: asin,
        name: 'Product Information Unavailable',
        description: 'Could not retrieve product details at this time.',
        price: 'N/A',
        image: 'https://via.placeholder.com/300',
        store: 'Amazon',
        category: 'Unknown'
      };
    }
  };
  
  // Save a product to user's saved items
  const handleSaveProduct = async (product) => {
    try {
      // Get existing saved products from AsyncStorage
      const savedProductsJson = await AsyncStorage.getItem('savedProducts');
      let savedProducts = savedProductsJson ? JSON.parse(savedProductsJson) : [];
      
      // Check if product is already saved
      const isAlreadySaved = savedProducts.some(item => item.id === product.id);
      
      if (isAlreadySaved) {
        // Remove from saved products
        savedProducts = savedProducts.filter(item => item.id !== product.id);
      } else {
        // Add to saved products
        savedProducts.push(product);
      }
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      
      // Show feedback to the user (could use a toast or snackbar)
      console.log(isAlreadySaved ? 'Product removed from saved items' : 'Product saved');
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };
  
  // Handle search submission
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Save search query to history via API
      saveSearchToHistory(searchQuery);
      
      // Show loading state
      setLoading(true);
      
      try {
        // Search for products
        const results = await searchProducts(searchQuery);
        
        // Update deals to show search results immediately
        if (results.length > 0) {
          setDeals(results);
        }
        
        // Also navigate to search results
        navigation.navigate('SearchResults', { 
          query: searchQuery,
          results: results
        });
      } catch (error) {
        console.error('Search error:', error);
        setError('Something went wrong with your search. Please try again.');
      } finally {
        setLoading(false);
        // Clear the search input
        setSearchQuery('');
      }
    }
  };
  
  // Save search query to history
  const saveSearchToHistory = async (query) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No auth token found, skipping history save');
        return;
      }
      
      // Make API call to save the search query
      await axios.post('http://192.168.100.54:3000/api/history', 
        { query },
        { headers: { 'x-auth-token': token } }
      );
      
      console.log('Search saved to history:', query);
    } catch (err) {
      console.error('Error saving search to history:', err);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = async (categoryName) => {
    saveSearchToHistory(categoryName);
    
    // Show loading state
    setLoading(true);
    
    try {
      // Search for products
      const results = await searchProducts(categoryName);
      
      // Update deals to show category results
      if (results.length > 0) {
        setDeals(results);
      }
      
      // Navigate to search results
      navigation.navigate('SearchResults', { 
        query: categoryName,
        results: results
      });
    } catch (error) {
      console.error('Category search error:', error);
      setError('Something went wrong with your search. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [stickyHeaderPosition.current, stickyHeaderPosition.current + 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Save the position of the "Today's Deals" section for sticky header
  const onTodaysDealsLayout = (event) => {
    stickyHeaderPosition.current = event.nativeEvent.layout.y - 60;
  };

  return (
    <View style={styles.container}>
      {/* Avatar at top right */}
      <View style={styles.avatarTopContainer}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sticky search bar - appears when scrolling down */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { 
            opacity: headerOpacity,
            transform: [{
              translateY: headerOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            }]
          }
        ]}
      >
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
        }} />
        <View style={styles.stickySearchBarWrapper}>
          <View style={styles.stickySearchBar}>
            <TextInput
              style={styles.stickySearchInput}
              placeholder="Search..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Icon name="search" type="feather" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Search section with pink background */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>What are you shopping for?</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Icon name="search" type="feather" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          
          {/* Categories horizontal scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <CategoryPill 
                key={category.id} 
                category={category} 
                onPress={handleCategorySelect}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Share feature card */}
        <ShareFeature />
        
        {/* Today's Deals section */}
        <View style={styles.headerContainer} onLayout={onTodaysDealsLayout}>
          <Text style={styles.headerText}>Today's Deals on Vetted Picks</Text>
        </View>
        
        {/* Deals list - horizontal scrolling */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={styles.loadingText}>Loading deals...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDeals}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={productCardWidth + 30}
            contentContainerStyle={styles.dealsScrollContainer}
          >
            {deals.map(deal => (
              <DealCard 
                key={deal.id} 
                item={deal} 
                onSave={handleSaveProduct}
              />
            ))}
          </ScrollView>
        )}
        
        {/* Additional space at bottom for tab navigation */}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5f2',
  },
  avatarTopContainer: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006156',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
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
    backgroundColor: '#FFFFFF',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 8,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  stickySearchBarWrapper: {
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  stickySearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  stickySearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    paddingRight: 5,
  },
  searchSection: {
    backgroundColor: '#FFB6B6',
    paddingTop: 80, // Space for avatar
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  searchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
  },
  categoryPillText: {
    fontWeight: '600',
    fontSize: 16,
  },
  shareContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  shareIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeShareButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f7f5f2', // Match background so it blends in
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 40,
  },
  dealCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    width: productCardWidth,
  },
  dealsScrollContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  discountBadge: {
    position: 'absolute',
    left: 0,
    top: 20,
    backgroundColor: '#8BC34A',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bookmarkButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dealImage: {
    height: 300,
    backgroundColor: '#fff',
  },
  dealContent: {
    padding: 15,
  },
  dealName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  recommendRow: {
    marginVertical: 10,
  },
  recommendText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  recommendBadges: {
    flexDirection: 'row',
  },
  recommendBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recommendIcon: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  moreBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default HomeScreen;