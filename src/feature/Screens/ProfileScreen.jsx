import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Pressable,
  Alert,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  // User state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    userId: null
  });

  // Theme state
  const [theme, setTheme] = useState('light');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userId = await AsyncStorage.getItem('userId');
        
        if (email) {
          const username = email.split('@')[0];
          setUserData({
            name: username,
            email: email,
            userId: userId
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Theme change handler
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // TODO: Implement app-wide theme change logic
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userToken');

      // Navigate to Welcome screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }]
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
    }
  };

  // Delete account handler
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call backend API to delete account
              // For now, just clear local storage and navigate
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }]
              });
            } catch (error) {
              console.error('Account deletion error:', error);
              Alert.alert('Delete Failed', 'Unable to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Open external link handler (placeholder)
  const openExternalLink = (type) => {
    // TODO: Implement actual link opening
    Alert.alert('Coming Soon', `${type} will be available soon.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* User Info Header */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={80} color="#6366F1" />
        </View>
        <Text style={styles.userName}>{userData.name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{userData.email || 'user@example.com'}</Text>
      </View>

      {/* Profile Menu Sections */}
      <View style={styles.menuSection}>
        {/* Theme Selection */}
        <View style={styles.menuSubSection}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeContainer}>
            {['Auto', 'Light', 'Dark'].map((themeOption) => (
              <TouchableOpacity 
                key={themeOption}
                style={[
                  styles.themeButton, 
                  theme.toLowerCase() === themeOption.toLowerCase() && styles.selectedTheme
                ]}
                onPress={() => handleThemeChange(themeOption.toLowerCase())}
              >
                <Text style={styles.themeButtonText}>{themeOption}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.menuSubSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openExternalLink('Privacy Policy')}
          >
            <Icon name="privacy-tip" size={24} color="#6366F1" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openExternalLink('Terms of Service')}
          >
            <Icon name="description" size={24} color="#6366F1" />
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openExternalLink('Send Feedback')}
          >
            <Icon name="feedback" size={24} color="#6366F1" />
            <Text style={styles.menuItemText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Dangerous Actions */}
        <View style={styles.menuSubSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity 
            style={[styles.menuItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete-forever" size={24} color="#FF0000" />
            <Text style={[styles.menuItemText, styles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  avatarContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 60,
    padding: 10,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuSubSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  selectedTheme: {
    backgroundColor: '#6366F1',
  },
  themeButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  dangerItem: {
    marginTop: 10,
  },
  dangerText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;