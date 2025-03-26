import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchResultScreen = ({ query = '', navigation }) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');

  // Sample stores 
  const stores = ['All', 'Aliexpress', 'Shopify', 'Walmart', 'Amazon', 'eBay'];

  useEffect(() => {
    // Fetch products when component mounts or query changes
    fetchProducts(query || searchQuery);
  }, [query]);

  const fetchProducts = async (searchTerm) => {
    // This would be replaced with your actual API call
    // Simulating API response with mock data
    
    const mockData = [
      {
        id: '1',
        store: 'Aliexpress',
        title: 'Samsung Galaxy A56 5G (128GB)',
        price: '$399.99',
        image: 'https://via.placeholder.com/150',
        specs: '6.6" FHD+ Display, 50MP Camera, 5000mAh Battery',
        rating: 4.5,
        reviews: '(3.8k reviews)'
      },
      {
        id: '2',
        store: 'JD.com',
        title: 'Samsung Galaxy A56 5G (256GB)',
        price: '$459.99',
        image: 'https://via.placeholder.com/150',
        specs: '8GB RAM, Dual SIM, Factory Unlocked',
        rating: 4,
        reviews: '(2.4k reviews)'
      },
      {
        id: '3',
        store: 'Walmart',
        title: 'Samsung Galaxy A56 5G (512GB)',
        price: '$479.99',
        image: 'https://via.placeholder.com/150',
        specs: '12GB RAM, International Version, Dual SIM',
        rating: 5,
        reviews: '(1.9k reviews)'
      },
      {
        id: '4',
        store: 'Amazon',
        title: 'Dell S3222DGM Gaming Monitor',
        price: '$300',
        image: 'https://via.placeholder.com/150',
        specs: '32-inch QHD monitor with 165Hz refresh rate',
        rating: 4.5,
        reviews: '(108 reviews)'
      },
      {
        id: '5',
        store: 'Bestbuy',
        title: 'Nike Dunk Low Retro',
        price: '$115.00',
        image: 'https://via.placeholder.com/150',
        specs: 'White/White/Black, Men\'s Casual Shoes',
        rating: 4.9,
        reviews: '(39 reviews)'
      },
    ];
    
    setProducts(mockData);
  };

  const handleSearch = () => {
    fetchProducts(searchQuery);
  };

  const handleStoreFilter = (store) => {
    setSelectedStore(store);
    // In a real implementation, you would filter products by store
  };

  // Render horizontal product card (swipeable)
  const renderProductCard = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
        resizeMode="cover"
      />
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
  );

  // Star rating component
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="star" size={16} color="#FFC107" />
        ))}
        {halfStar && <Icon name="star-half" size={16} color="#FFC107" />}
        {[...Array(emptyStars)].map((_, i) => (
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
      
      {/* Products list - horizontal swipeable cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsContainer}>
        {products.map(item => renderProductCard({ item }))}
      </ScrollView>
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
});

export default SearchResultScreen;