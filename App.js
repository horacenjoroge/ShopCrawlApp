import React, { useState, useEffect } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  SafeAreaView, 
  View, 
  StatusBar, 
  StyleSheet, 
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme and Context
import { ThemeProvider, useTheme } from './src/context/ThemeContext.js';

// Screens
import WelcomeScreen from './src/feature/Screens/WelcomeScreen';
import LoginScreen from './src/feature/Screens/LoginScreen';
import HomeScreen from './src/feature/Screens/HomeScreen.jsx';
import RegisterScreen from './src/feature/Screens/RegisterScreen';
import SearchScreen from './src/feature/Screens/SearchScreen';
import HistoryScreen from './src/feature/Screens/HistoryScreen';
import SavedProductsScreen from './src/feature/Screens/SavedScreen';
import SearchResultScreen from './src/feature/Screens/SearchResult';
import ProfileMenuOverlay from './src/feature/Screens/ProfileScreen';

// Custom Navbar
import CustomNavbar from './src/context/CustomBottomNavbar.jsx'; // adjust this path if needed

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Themed wrapper
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
        screenProps={{ theme: currentTheme, isDarkMode }} 
      />
    </View>
  );
};

const HomeWithProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({ name: '', email: '' });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          const username = email.split('@')[0];
          setUserData({ name: username, email });
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
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomNavbar {...props} />}
      screenOptions={{
        headerShown: false, // hide headers globally in tabs
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeWithProfile} />
      <Tab.Screen name="SavedTab" component={SavedProductsScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileMenuOverlay} />
      <Tab.Screen 
        name="SearchResults" 
        component={SearchResultScreen} 
        options={{ tabBarButton: () => null }} // hide from navbar
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
            setUserData({ name: username, email });
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
    left: 0, right: 0, top: 0, bottom: 0,
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
});
