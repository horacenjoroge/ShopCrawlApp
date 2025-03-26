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
  StatusBar
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

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
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // In a real app, you would use your actual API endpoint
        // const response = await axios.get('https://your-api.com/api/history', {
        //   headers: { Authorization: `Bearer ${yourAuthToken}` }
        // });
        
        // For demo purposes, we'll use mock data that matches the screenshot
        const mockResponse = {
          data: {
            today: [
              {
                id: 1,
                query: "Gaming Monitor Suggestions",
                timestamp: new Date(),
                imageUrl: require("../../../assets/gaming-monitor.jpg")
              }
            ],
            pastWeek: [
              {
                id: 2,
                query: "Mindfulness Books for Beginners",
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                imageUrl: require("../../../assets/mindfulness-book.jpg")
              },
              {
                id: 3,
                query: "Hopkins Furniture Options",
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                imageUrl: null
              }
            ],
            pastMonth: [
              {
                id: 4,
                query: "Curved Monitor Options",
                timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                imageUrl: require("../../../assets/curved-monitor.jpg")
              }
            ]
          }
        };

        setHistory(mockResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again.');
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Handle item press - navigate to search results
  const handleItemPress = (query) => {
    // Navigate to search results screen with the query
    navigation.navigate('SearchResults', { query });
  };

  // Render a history item
  const HistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleItemPress(item.query)}
    >
      <Text style={styles.historyItemText}>{item.query}</Text>
      {item.imageUrl && (
        <Image source={item.imageUrl} style={styles.historyItemImage} />
      )}
    </TouchableOpacity>
  );

  // Render a section with title and history items
  const HistorySection = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(item => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Text style={styles.headerTitle}>History</Text>
      <ScrollView style={styles.scrollContainer}>
        <HistorySection title="TODAY" items={history.today} />
        <HistorySection title="PAST 7 DAYS" items={history.pastWeek} />
        <HistorySection title="PAST 30 DAYS" items={history.pastMonth} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  historyItemText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
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
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;