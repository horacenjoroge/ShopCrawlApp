import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext'; // Adjust import path as needed

// Color Palette
const COLOR_PALETTE = [
  { name: 'Indigo', primary: '#6366F1', secondary: '#A5B4FC' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#93C5FD' },
  { name: 'Green', primary: '#10B981', secondary: '#6EE7B7' },
  { name: 'Red', primary: '#EF4444', secondary: '#FCA5A5' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#C4B5FD' },
  { name: 'Pink', primary: '#EC4899', secondary: '#F9A8D4' },
  { name: 'Orange', primary: '#F97316', secondary: '#FDBA74' },
];

const ProfileScreen = ({ navigation }) => {
  const { theme, setTheme, currentTheme } = useTheme();
  
  // User state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    userId: null,
    profileImage: null
  });

  // Color selection state
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  // Fetch user data and theme on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userId = await AsyncStorage.getItem('userId');
        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        const savedPrimaryColor = await AsyncStorage.getItem('primaryColor');
        
        if (email) {
          const username = email.split('@')[0];
          setUserData({
            name: username,
            email: email,
            userId: userId,
            profileImage: savedProfileImage
          });
        }

        // Set selected color if saved
        if (savedPrimaryColor) {
          const foundColor = COLOR_PALETTE.find(c => c.primary === savedPrimaryColor);
          setSelectedColor(foundColor);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Theme change handler
  const handleThemeChange = async (newTheme) => {
    try {
      // Save theme to AsyncStorage
      await AsyncStorage.setItem('appTheme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Color selection handler
  const handleColorSelection = async (color) => {
    try {
      // Save selected color to AsyncStorage
      await AsyncStorage.setItem('primaryColor', color.primary);
      setSelectedColor(color);
      setIsColorModalVisible(false);
      
      // Update app theme with new primary color
      // You might want to implement a more sophisticated color management
      // This is a simplified example
      const newTheme = {
        ...currentTheme,
        primary: color.primary
      };
      
      // Here you would update your theme context or global theme
      // This is just a placeholder - implement based on your theme system
      // setAppTheme(newTheme);
    } catch (error) {
      console.error('Error saving color:', error);
    }
  };

  // Profile image picker
  const handlePickProfileImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const image = response.assets?.[0];
        if (image) {
          try {
            // Save image URI to AsyncStorage
            await AsyncStorage.setItem('profileImage', image.uri);
            
            // Update user data state
            setUserData(prev => ({
              ...prev,
              profileImage: image.uri
            }));
          } catch (error) {
            console.error('Error saving profile image:', error);
          }
        }
      }
    });
  };

  // Color Picker Modal
  const ColorPickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isColorModalVisible}
      onRequestClose={() => setIsColorModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Primary Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorButton,
                  { 
                    backgroundColor: color.primary,
                    borderWidth: selectedColor?.primary === color.primary ? 3 : 0,
                    borderColor: '#FFFFFF'
                  }
                ]}
                onPress={() => handleColorSelection(color)}
              >
                <Text style={styles.colorButtonText}>{color.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsColorModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        <View style={[styles.headerContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handlePickProfileImage}
          >
            {userData.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <Icon name="account-circle" size={100} color={currentTheme.primary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: currentTheme.text }]}>{userData.name || 'Guest User'}</Text>
          <Text style={[styles.userEmail, { color: currentTheme.secondaryText }]}>{userData.email || 'user@example.com'}</Text>
        </View>

        {/* Profile Menu Sections */}
        <View style={styles.menuSection}>
          {/* Theme Selection */}
          <View style={[styles.menuSubSection, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Theme</Text>
            <View style={styles.themeContainer}>
              {['Auto', 'Light', 'Dark'].map((themeOption) => (
                <TouchableOpacity 
                  key={themeOption}
                  style={[
                    styles.themeButton, 
                    { 
                      backgroundColor: theme.toLowerCase() === themeOption.toLowerCase() 
                        ? currentTheme.primary 
                        : currentTheme.border 
                    }
                  ]}
                  onPress={() => handleThemeChange(themeOption.toLowerCase())}
                >
                  <Text style={[
                    styles.themeButtonText, 
                    { color: theme.toLowerCase() === themeOption.toLowerCase() ? '#FFFFFF' : currentTheme.text }
                  ]}>{themeOption}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={[styles.menuSubSection, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>App Color</Text>
            <TouchableOpacity 
              style={styles.colorSelectButton}
              onPress={() => setIsColorModalVisible(true)}
            >
              <View 
                style={[
                  styles.selectedColorDisplay, 
                  { 
                    backgroundColor: selectedColor?.primary || currentTheme.primary,
                    borderColor: currentTheme.border
                  }
                ]}
              />
              <Text style={[styles.colorSelectButtonText, { color: currentTheme.text }]}>
                {selectedColor?.name || 'Select Color'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rest of the existing menu items */}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => {/* Logout logic */}}
        >
          <Icon name="logout" size={24} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Color Picker Modal */}
      <ColorPickerModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    borderRadius: 75,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuSubSection: {
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    alignItems: 'center',
  },
  themeButtonText: {
    fontWeight: '500',
  },
  colorSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  selectedColorDisplay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  colorSelectButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.9,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  closeModalButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 20,
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