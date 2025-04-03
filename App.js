import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import WelcomeScreen from './src/feature/Screens/WelcomeScreen';
import LoginScreen from './src/feature/Screens/LoginScreen';
import HomeScreen from './src/feature/Screens/HomeScreen.jsx';
import RegisterScreen from './src/feature/Screens/RegisterScreen';

import SearchScreen from './src/feature/Screens/SearchScreen';
import HistoryScreen from './src/feature/Screens/HistoryScreen';
import SavedProductsScreen from './src/feature/Screens/SavedScreen';

// Import other components/screens
import SearchResultScreen from './src/feature/Screens/SearchResult';
import ProfileMenuOverlay from './src/feature/Screens/ProfileScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Spinner Component
const LoadingSpinner = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.spinnerOverlay}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.spinnerText}>Searching...</Text>
      </View>
    </View>
  );
};

// Search Results Screen with Loading State and Custom Navigation
const SearchResultsWithLoading = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use real loading state from HomeScreen if provided, otherwise simulate
  React.useEffect(() => {
    if (route.params?.isLoading !== undefined) {
      setIsLoading(route.params.isLoading);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [route.params]);
  
  // Add back button functionality
  const handleBack = () => {
    navigation.goBack();
  };

  // Show bottom tabs on this screen
  React.useLayoutEffect(() => {
    navigation.setOptions({
      tabBarVisible: true
    });
  }, [navigation]);
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      {/* Header with back button */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
      </View>
      
      <SearchResultScreen 
        query={route.params?.query || ''} 
        results={route.params?.results || []} 
        navigation={navigation}
      />
      <LoadingSpinner visible={isLoading} />
    </View>
  );
};

const HomeWithProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  
  // Fetch user data from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        
        if (email) {
          const username = email.split('@')[0];
          setUserData({
            name: username,
            email: email
          });
        }
      } catch (error) {
        console.error('Error retrieving user data from AsyncStorage:', error);
      }
    };
    
    getUserData();
  }, []);
  
  const handleSearch = (query) => {
    navigation.navigate('SearchResults', { query });
  };
  
  return (
    <HomeScreen 
      navigation={navigation} 
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onSearch={handleSearch}
      userData={userData}
    />
  );
};

// Profile Screen - Updated to fix visibility issues
const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  
  // Fetch user data from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userId = await AsyncStorage.getItem('userId');
        
        if (email) {
          const username = email.split('@')[0]; // Simple username from email
          setUserData({
            name: username,
            email: email
          });
        }
      } catch (error) {
        console.error('Error retrieving user data from AsyncStorage:', error);
      }
    };
    
    getUserData();
  }, []);

  // Handle back button or close
  const handleClose = () => {
    // Navigate to Home tab instead of just closing the menu
    navigation.navigate('HomeTab');
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      {/* Always show the menu when on profile tab */}
      <ProfileMenuOverlay 
        visible={true} 
        onClose={handleClose}
        userData={userData}
      />
    </View>
  );
};

// This function creates the main tab navigator with SearchResults included
function createMainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e1e1e1',
        },
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTintColor: 'white'
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeWithProfile} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="SavedTab" 
        component={SavedProductsScreen} 
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark" color={color} size={size} />
          ),
          title: 'Saved Products',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="HistoryTab" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" color={color} size={size} />
          ),
          title: 'Search History',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
          title: 'Profile',
          headerShown: false
        }}
      />
      {/* Add SearchResults as a hidden tab to maintain navigation */}
      <Tab.Screen 
        name="SearchResults" 
        component={SearchResultsWithLoading} 
        options={{
          tabBarButton: () => null, // Hide this tab from the tab bar
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple wrapper for standalone HomeScreen that loads user data from AsyncStorage
const HomeScreenWrapper = ({ navigation, route = {} }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: route.params?.userEmail || ''
  });
  
  useEffect(() => {
    if (!userData.email) {
      const getUserData = async () => {
        try {
          const email = await AsyncStorage.getItem('userEmail');
          if (email) {
            const username = email.split('@')[0];
            setUserData({
              name: username,
              email: email
            });
          }
        } catch (error) {
          console.error('Error retrieving user data:', error);
        }
      };
      
      getUserData();
    }
  }, [userData.email]);
  
  return (
    <HomeScreen 
      navigation={navigation}
      userData={userData}
      onProfilePress={() => navigation.navigate('Main')}
    />
  );
};

// Main app component with navigation setup
export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreenWrapper} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={createMainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
          {/* Remove SearchResults from here since it's now in the tab navigator */}
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  spinnerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinnerContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  spinnerText: {
    color: '#333333',
    marginTop: 12,
    fontSize: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 15,
  },
});
