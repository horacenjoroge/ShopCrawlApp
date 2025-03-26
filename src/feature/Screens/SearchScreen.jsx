import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStores, setSelectedStores] = useState(['All']); //
  const [recentSearches, setRecentSearches] = useState(['Wireless Earbuds', 'Smart Watch', 'Headphones']);
  const popularCategories = ['Electronics', 'Fashion', 'Home', 'Beauty'];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, you'd call your search API here
      console.log('Searching for:', searchQuery, 'in stores:', selectedStores);
      // Placeholder for search results
      const results = [`Result 1 for "${searchQuery}"`, `Result 2 for "${searchQuery}"`];
      setSearchResults(results);

      // Update recent searches (avoid duplicates and limit length)
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]); // Keep max 5 recent searches
      }
    } else {
      setSearchResults();
    }
  };

  const handleStoreFilter = (store) => {
    if (store === 'All') {
      setSelectedStores(['All']);
    } else {
      if (selectedStores.includes(store)) {
        setSelectedStores(selectedStores.filter((s) => s !== store && s !== 'All'));
      } else {
        const newSelectedStores = selectedStores.filter((s) => s !== 'All');
        setSelectedStores([...newSelectedStores, store]);
      }
    }
  };

  const clearSearchInput = () => {
    setSearchQuery('');
    setSearchResults();
  };

  const handleRecentSearchPress = (item) => {
    setSearchQuery(item);
    handleSearch();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };
  

  const handleCategoryPress = (category) => {
    setSearchQuery(category);
    handleSearch();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} />
        </TouchableOpacity>
        <Text style={styles.title}>ShopCrawl</Text>
        <TouchableOpacity>
          <Icon name="user" type="font-awesome" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search across multiple stores..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} // Trigger search on pressing Enter
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearchInput} style={styles.clearButton}>
            <Icon name="close" size={20} color="gray" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Icon name="search" type="font-awesome" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Store Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeFilters}>
        {['All', 'Amazon', 'eBay', 'Shopify', 'Alibaba'].map((store, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedStores.includes(store) || (selectedStores.includes('All') && store === 'All')
                ? styles.filterButtonActive
                : null,
            ]}
            onPress={() => handleStoreFilter(store)}
          >
            <Text style={styles.filterText}>{store}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((result, index) => (
            <Text key={index} style={styles.searchResultItem}>{result}</Text>
          ))}
        </View>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((item, index) => (
            <TouchableOpacity key={index} style={styles.recentSearchItem} onPress={() => handleRecentSearchPress(item)}>
              <Text>{item}</Text>
              <Icon name="history" size={18} color="gray" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Popular Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoriesContainer}>
          {popularCategories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton} onPress={() => handleCategoryPress(category)}>
              <Text>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
  },
  clearButton: {
    marginRight: 5,
  },
  searchButton: {
    padding: 5,
  },
  storeFilters: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#000',
  },
  filterText: {
    color: 'white',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    width: '48%', // Adjust width for better layout
  },
  searchResultItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  clearAll: {
    color: 'blue',
    fontSize: 14,
  },
});

export default SearchScreen;