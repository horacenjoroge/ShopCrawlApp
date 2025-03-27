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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HistoryScreen = () => {
  const [history, setHistory] = useState({
    today: [],
    pastWeek: [],
    pastMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Fetch history data from API
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token found for history fetch:', !!token);
      
      if (!token) {
        setError('You must be logged in to view history');
        setLoading(false);
        return;
      }
      
      // Make the API request with authorization header
      const response = await axios.get('http://192.168.100.54:3000/api/history', {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      console.log('History response:', response.data);
      console.log('Today items count:', response.data.today ? response.data.today.length : 0);
      console.log('Past week items count:', response.data.pastWeek ? response.data.pastWeek.length : 0);
      console.log('Past month items count:', response.data.pastMonth ? response.data.pastMonth.length : 0);
      
      setHistory(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again.');
      setLoading(false);
    }
  };

  // Load history when component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle item press - navigate to search results
  const handleItemPress = (query) => {
    // Navigate to search results screen with the query
    navigation.navigate('SearchResults', { query });
  };
  
  // Handle delete history item
  const handleDeleteItem = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Confirm deletion
      Alert.alert(
        "Delete History Item",
        "Are you sure you want to delete this item?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
              try {
                console.log('Deleting history item with ID:', id);
                // Call API to delete the item
                await axios.delete(`http://192.168.100.54:3000/api/history/${id}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                  }
                });
                
                console.log('Successfully deleted history item');
                // Refresh the history data
                fetchHistory();
              } catch (deleteErr) {
                console.error('Error in deletion request:', deleteErr);
                Alert.alert('Error', 'Failed to delete history item');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error preparing to delete history item:', err);
      Alert.alert('Error', 'Failed to prepare deletion');
    }
  };

  // Render a history item
  const HistoryItem = ({ item }) => {
    console.log('Rendering history item:', item);
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item.query)}
      >
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemText}>{item.query}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item._id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.historyItemImage} 
            defaultSource={require('../../../assets/ebay.jpg')}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Render a section with title and history items
  const HistorySection = ({ title, items }) => {
    console.log(`${title} section items:`, items);
    
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(item => (
          <HistoryItem key={item._id} item={item} />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchHistory}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasHistory = 
    (history.today && history.today.length > 0) ||
    (history.pastWeek && history.pastWeek.length > 0) || 
    (history.pastMonth && history.pastMonth.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search History</Text>
        {hasHistory && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={async () => {
              Alert.alert(
                "Clear All History",
                "Are you sure you want to clear all history?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Clear All", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const token = await AsyncStorage.getItem('userToken');
                        await axios.delete('http://192.168.100.54:3000/api/history', {
                          headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                          }
                        });
                        console.log('Successfully cleared all history');
                        fetchHistory(); // Refresh
                      } catch (err) {
                        console.error('Error clearing history:', err);
                        Alert.alert('Error', 'Failed to clear history');
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
      
      {!hasHistory ? (
        <View style={styles.noHistoryContainer}>
          <Text style={styles.noHistoryText}>No search history yet</Text>
          <Text style={styles.noHistorySubtext}>Your search history will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <HistorySection title="TODAY" items={history.today} />
          <HistorySection title="PAST 7 DAYS" items={history.pastWeek} />
          <HistorySection title="PAST 30 DAYS" items={history.pastMonth} />
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2a2a2a',
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#888',
    fontWeight: 'bold',
  },
  historyItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
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
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noHistoryText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  noHistorySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  }
});

export default HistoryScreen;