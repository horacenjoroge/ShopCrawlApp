import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://192.168.100.54:3000/api';

const SavedProductsScreen = () => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [localSavedProducts, setLocalSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocalFallback, setShowLocalFallback] = useState(false);
  const navigation = useNavigation();

  // Fetch saved products from API
  const fetchSavedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token found for saved products fetch:', !!token);
      
      if (!token) {
        setError('You must be logged in to view saved products');
        setLoading(false);
        return;
      }

      // Also get the local saved products as fallback
      try {
        const localSaved = await AsyncStorage.getItem('savedProducts');
        if (localSaved) {
          const localItems = JSON.parse(localSaved);
          console.log('Found local saved products:', localItems.length);
          setLocalSavedProducts(localItems);
        }
      } catch (err) {
        console.error('Error reading local saved products:', err);
      }
      
      // Make the API request with authorization header
      console.log('Fetching from:', `${API_BASE_URL}/products/saved`);
      const response = await axios.get(`${API_BASE_URL}/products/saved`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      console.log('Saved products full response:', JSON.stringify(response.data, null, 2));
      console.log('Items count:', response.data ? response.data.length : 0);
      
      if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          // We got products from the API
          setSavedProducts(response.data);
          setShowLocalFallback(false);
        } else {
          // API returned empty array, show local fallback
          console.log('API returned empty array, using local fallback');
          setShowLocalFallback(true);
        }
      } else {
        console.error('Response data is not an array:', typeof response.data);
        setError('Invalid data format received from server');
        setShowLocalFallback(true);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved products:', err);
      setError('Failed to load saved products. Showing local storage as fallback.');
      setShowLocalFallback(true);
      setLoading(false);
    }
  };

  // This function will save all locally saved products to the backend
  const syncLocalToBackend = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token || localSavedProducts.length === 0) {
        setLoading(false);
        return;
      }

      console.log(`Syncing ${localSavedProducts.length} products to backend`);
      
      // For each locally saved product, save it to the backend
      const savePromises = localSavedProducts.map(async (product) => {
        try {
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
          
          // Make API call to save the product
          await axios.post(
            `${API_BASE_URL}/products/save`, 
            productData,
            { headers: { 'x-auth-token': token } }
          );
          
          return true;
        } catch (err) {
          console.error(`Error syncing product ${product.id}:`, err);
          return false;
        }
      });
      
      await Promise.all(savePromises);
      
      Alert.alert(
        "Sync Complete", 
        "Your locally saved products have been synced to the server."
      );
      
      // Refresh the saved products
      fetchSavedProducts();
    } catch (err) {
      console.error('Error in sync process:', err);
      Alert.alert("Sync Failed", "There was an error syncing your products.");
      setLoading(false);
    }
  };

  // Load saved products when component mounts
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh data when screen comes into focus
      fetchSavedProducts();
    });

    // Fetch on mount as well
    fetchSavedProducts();

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  // Handle product press - open product URL
  const handleProductPress = (productUrl) => {
    if (productUrl) {
      console.log('Opening URL:', productUrl);
      Linking.openURL(productUrl).catch(err => {
        console.error('Error opening URL:', err);
        Alert.alert('Error', 'Could not open product link');
      });
    } else {
      console.log('No product URL available');
      Alert.alert('Error', 'No product link available');
    }
  };
  
  // Handle delete saved product
  const handleDeleteProduct = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Confirm deletion
      Alert.alert(
        "Remove Saved Product",
        "Are you sure you want to remove this product?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Remove", 
            style: "destructive",
            onPress: async () => {
              try {
                console.log('Removing saved product with ID:', productId);
                // Call API to delete the item
                await axios.delete(`${API_BASE_URL}/products/saved/${productId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                  }
                });
                
                console.log('Successfully removed saved product');
                // Refresh the saved products data
                fetchSavedProducts();
                
                // Also remove from local storage if present
                const localSaved = await AsyncStorage.getItem('savedProducts');
                if (localSaved) {
                  const localItems = JSON.parse(localSaved);
                  const updatedItems = localItems.filter(item => item.id !== productId);
                  await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedItems));
                  setLocalSavedProducts(updatedItems);
                }
              } catch (deleteErr) {
                console.error('Error in removal request:', deleteErr);
                Alert.alert('Error', 'Failed to remove saved product');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error preparing to remove saved product:', err);
      Alert.alert('Error', 'Failed to prepare removal');
    }
  };

  // Handle local delete
  const handleLocalDeleteProduct = async (productId) => {
    try {
      // Confirm deletion
      Alert.alert(
        "Remove Local Saved Product",
        "Are you sure you want to remove this product from your local saved items?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Remove", 
            style: "destructive",
            onPress: async () => {
              try {
                // Remove from local storage
                const localSaved = await AsyncStorage.getItem('savedProducts');
                if (localSaved) {
                  const localItems = JSON.parse(localSaved);
                  const updatedItems = localItems.filter(item => item.id !== productId);
                  await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedItems));
                  setLocalSavedProducts(updatedItems);
                  console.log('Successfully removed local saved product');
                }
              } catch (deleteErr) {
                console.error('Error removing local product:', deleteErr);
                Alert.alert('Error', 'Failed to remove saved product');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error preparing to remove local product:', err);
      Alert.alert('Error', 'Failed to prepare removal');
    }
  };

  // Render a saved product item from the API
  const SavedProductItem = ({ item }) => {
    console.log('Rendering saved product item:', JSON.stringify(item, null, 2));
    
    const getProductUrl = () => {
      if (item.productUrl) return item.productUrl;
      if (item.productData && item.productData.productUrl) return item.productData.productUrl;
      if (item.productId && item.productId.startsWith('B0')) {
        return `https://www.amazon.com/dp/${item.productId}`;
      }
      return undefined;
    };
    
    const productUrl = getProductUrl();
    const productId = item._id || item.productId;
    
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => productUrl ? handleProductPress(productUrl) : Alert.alert('Error', 'No product link available')}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage} 
          defaultSource={require('../../../assets/amazon.jpg')}
        />
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productDetails}>
            <View style={styles.storeAndPrice}>
              <Text style={styles.storeText}>{item.store || 'Amazon'}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            {productId && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleDeleteProduct(productId)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a locally saved product item
  const LocalSavedProductItem = ({ item }) => {
    const productUrl = item.productUrl;
    const productId = item.id;
    
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => productUrl ? handleProductPress(productUrl) : Alert.alert('Error', 'No product link available')}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage} 
          defaultSource={require('../../../assets/amazon.jpg')}
        />
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productDetails}>
            <View style={styles.storeAndPrice}>
              <Text style={styles.storeText}>{item.store || 'Amazon'}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            {productId && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleLocalDeleteProduct(productId)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={styles.loadingText}>Loading saved products...</Text>
      </View>
    );
  }

  if (error && !showLocalFallback) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchSavedProducts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasApiSavedProducts = savedProducts && savedProducts.length > 0;
  const hasLocalSavedProducts = localSavedProducts && localSavedProducts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Products</Text>
        {(hasApiSavedProducts || (showLocalFallback && hasLocalSavedProducts)) && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={async () => {
              Alert.alert(
                "Clear All Saved Products",
                "Are you sure you want to remove all saved products?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Clear All", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        // Clear from API
                        const token = await AsyncStorage.getItem('userToken');
                        if (token) {
                          await axios.delete(`${API_BASE_URL}/products/saved`, {
                            headers: {
                              'Content-Type': 'application/json',
                              'x-auth-token': token
                            }
                          });
                        }
                        
                        // Clear from local storage
                        await AsyncStorage.setItem('savedProducts', JSON.stringify([]));
                        setLocalSavedProducts([]);
                        
                        console.log('Successfully cleared all saved products');
                        fetchSavedProducts(); // Refresh
                      } catch (err) {
                        console.error('Error clearing saved products:', err);
                        Alert.alert('Error', 'Failed to clear saved products');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Show API products if available */}
      {hasApiSavedProducts && !showLocalFallback ? (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.productsGrid}>
            {savedProducts.map((item, index) => (
              <SavedProductItem key={item._id || item.productId || `product-${index}`} item={item} />
            ))}
          </View>
        </ScrollView>
      ) : showLocalFallback && hasLocalSavedProducts ? (
        // Show local products as fallback
        <View style={styles.container}>
          <View style={styles.fallbackBanner}>
            <Text style={styles.fallbackText}>Showing locally saved products</Text>
            <TouchableOpacity 
              style={styles.syncButton}
              onPress={syncLocalToBackend}
            >
              <Text style={styles.syncButtonText}>Sync to Server</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.productsGrid}>
              {localSavedProducts.map((item, index) => (
                <LocalSavedProductItem key={item.id || `local-product-${index}`} item={item} />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        // No products at all
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No saved products yet</Text>
          <Text style={styles.noProductsSubtext}>Your saved products will appear here</Text>
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={async () => {
              try {
                // Fetch the most recently saved product from the database to diagnose
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                  const response = await axios.get(`${API_BASE_URL}/products/debug`, {
                    headers: {
                      'Content-Type': 'application/json',
                      'x-auth-token': token
                    }
                  });
                  console.log('Debug response:', JSON.stringify(response.data, null, 2));
                  
                  if (response.data && response.data.message) {
                    Alert.alert('Debug Info', response.data.message);
                  } else {
                    Alert.alert('Debug Info', 'No additional debug info available');
                  }
                }
              } catch (err) {
                console.error('Error fetching debug info:', err);
                Alert.alert('Error', 'Failed to fetch debug info');
              }
            }}
          >
            <Text style={styles.debugButtonText}>Check Server Status</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clearAllButton: {
    padding: 8,
  },
  clearAllText: {
    fontSize: 16,
    color: '#FFC107',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  productsGrid: {
    padding: 15,
  },
  productItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#333',
  },
  productContent: {
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 10,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeAndPrice: {
    flex: 1,
  },
  storeText: {
    fontSize: 14,
    color: '#FFC107',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  removeButton: {
    backgroundColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noProductsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  noProductsSubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  debugButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  debugButtonText: {
    color: '#FFC107',
    fontSize: 14,
  },
  fallbackBanner: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFC107',
    fontSize: 14,
  },
  syncButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  syncButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default SavedProductsScreen;