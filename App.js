
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
  Platform,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Theme Provider
import { ThemeProvider, useTheme } from './src/context/ThemeContext.js';

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

// Themed Screen Wrapper
const ThemedScreen = ({ component: Component, ...rest }) => {
  const { currentTheme, isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.background}
      />
      <Component 
        {...rest} 
        screenProps={{ 
          theme: currentTheme,
          isDarkMode 
        }} 
      />
    </View>
  );
};

// Existing components (LoadingSpinner, SearchResultsWithLoading, etc.) remain the same

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

function createMainTabNavigator() {
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: currentTheme.cardBackground,
          borderTopColor: currentTheme.border,
        },
        headerStyle: {
          backgroundColor: currentTheme.primary,
        },
        headerTintColor: 'white'
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={(props) => <ThemedScreen component={HomeWithProfile} {...props} />}
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
        component={(props) => <ThemedScreen component={SavedProductsScreen} {...props} />}
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
        component={(props) => <ThemedScreen component={HistoryScreen} {...props} />}
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
        component={(props) => <ThemedScreen component={ProfileMenuOverlay} {...props} />}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
          title: 'Profile',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="SearchResults" 
        component={(props) => <ThemedScreen component={SearchResultScreen} {...props} />}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

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
    <ThemeProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen 
              name="Welcome" 
              component={(props) => <ThemedScreen component={WelcomeScreen} {...props} />} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Login" 
              component={(props) => <ThemedScreen component={LoginScreen} {...props} />} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={(props) => <ThemedScreen component={RegisterScreen} {...props} />} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Home" 
              component={(props) => <ThemedScreen component={HomeScreenWrapper} {...props} />} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Main" 
              component={createMainTabNavigator} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Search" 
              component={(props) => <ThemedScreen component={SearchScreen} {...props} />} 
              options={{ headerShown: false }} 
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
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