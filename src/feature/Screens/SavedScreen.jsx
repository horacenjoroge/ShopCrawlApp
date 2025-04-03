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

const SavedProductsScreen = () => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      
      // Make the API request with authorization header
      console.log('Fetching from:', 'http://192.168.100.54:3000/api/products/saved');
      const response = await axios.get('http://192.168.100.54:3000/api/products/saved', {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      console.log('Saved products response:', response.data);
      console.log('Items count:', response.data ? response.data.length : 0);
      
      setSavedProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved products:', err);
      setError('Failed to load saved products. Please try again.');
      setLoading(false);
    }
  };

  // Load saved products when component mounts
  useEffect(() => {
    fetchSavedProducts();
  }, []);

  // Handle product press - open product URL
  const handleProductPress = (productUrl) => {
    if (productUrl) {
      Linking.openURL(productUrl).catch(err => {
        console.error('Error opening URL:', err);
        Alert.alert('Error', 'Could not open product link');
      });
    } else {
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
                await axios.delete(`http://192.168.100.54:3000/api/products/saved/${productId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                  }
                });
                
                console.log('Successfully removed saved product');
                // Refresh the saved products data
                fetchSavedProducts();
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

  // Render a saved product item
  const SavedProductItem = ({ item }) => {
    console.log('Rendering saved product item:', item);
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item.productUrl)}
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
              <Text style={styles.storeText}>{item.store}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleDeleteProduct(item.productId)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
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

  if (error) {
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

  const hasSavedProducts = savedProducts && savedProducts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Products</Text>
        {hasSavedProducts && (
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
                        const token = await AsyncStorage.getItem('userToken');
                        await axios.delete('http://192.168.100.54:3000/api/products/saved', {
                          headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                          }
                        });
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
      
      {!hasSavedProducts ? (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No saved products yet</Text>
          <Text style={styles.noProductsSubtext}>Your saved products will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.productsGrid}>
            {savedProducts.map(item => (
              <SavedProductItem key={item._id} item={item} />
            ))}
          </View>
        </ScrollView>
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
  }
});

export default SavedProductsScreen;