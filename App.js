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
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import WelcomeScreen from './src/feature/Screens/WelcomeScreen';
import LoginScreen from './src/feature/Screens/LoginScreen';
import HomeScreen from './src/feature/Screens/HomeScreen.jsx';
import RegisterScreen from './src/feature/Screens/RegisterScreen';
import HistoryScreen from './src/feature/Screens/HistoryScreen';
import ComparisonScreen from './src/feature/Screens/ComparisonScreen';

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
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={styles.spinnerText}>Searching...</Text>
      </View>
    </View>
  );
};

// Search Results Screen with Loading State
const SearchResultsWithLoading = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={{ flex: 1 }}>
      <SearchResultScreen query={route.params?.query || ''} />
      <LoadingSpinner visible={isLoading} />
    </View>
  );
};

// Home Screen with Profile Menu Overlay - Updated to use AsyncStorage
const HomeWithProfile = ({ navigation }) => {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
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
  
  const handleSearch = (query) => {
    navigation.navigate('SearchResults', { query });
  };
  
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen 
        navigation={navigation} 
        onProfilePress={() => setProfileMenuVisible(true)}
        onSearch={handleSearch}
        userData={userData}
      />
      <ProfileMenuOverlay 
        visible={profileMenuVisible} 
        onClose={() => setProfileMenuVisible(false)}
        userData={userData}
      />
    </View>
  );
};

// Saved Screen
const SavedScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>Saved Items</Text>
    </View>
  );
};

// Profile Screen - Updated to use AsyncStorage
const ProfileScreen = () => {
  const [profileMenuVisible, setProfileMenuVisible] = useState(true);
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
  
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <ProfileMenuOverlay 
        visible={profileMenuVisible} 
        onClose={() => setProfileMenuVisible(false)}
        userData={userData}
      />
    </View>
  );
};

// Bottom tab navigator component
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FFC107',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
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
        component={SavedScreen} 
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark" color={color} size={size} />
          ),
          title: 'Saved Items'
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
          title: 'Search History'
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
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ComparisonScreen" component={ComparisonScreen} />
          <Stack.Screen 
            name="SearchResults" 
            component={SearchResultsWithLoading} 
            options={{ headerShown: false }} 
          />
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
    backgroundColor: '#2a2a2a',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
});