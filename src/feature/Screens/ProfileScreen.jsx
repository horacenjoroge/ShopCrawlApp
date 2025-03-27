import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Pressable,
  SafeAreaView
} from 'react-native';

const ProfileMenuOverlay = ({ visible, onClose, userData }) => {
  // Theme options
  const [theme, setTheme] = useState('dark'); // 'auto', 'light', or 'dark'
  
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // In a real app, you would apply the theme change throughout the app
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackground} onPress={onClose}>
        {/* Stop propagation for the menu itself */}
        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
          
          {/* User info section */}
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>{userData?.name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'user@example.com'}</Text>
          </View>
          
          {/* Theme selection */}
          <View style={styles.themeSelectionContainer}>
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'auto' && styles.selectedTheme]} 
              onPress={() => handleThemeChange('auto')}
            >
              <Text style={styles.themeIcon}>⚫</Text>
              <Text style={styles.optionText}>Auto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'light' && styles.selectedTheme]} 
              onPress={() => handleThemeChange('light')}
            >
              <Text style={styles.themeIcon}>☀️</Text>
              <Text style={styles.optionText}>Light</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'dark' && styles.selectedTheme]} 
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={styles.themeIcon}>🌙</Text>
              <Text style={styles.optionText}>Dark</Text>
            </TouchableOpacity>
          </View>
          
          {/* Location */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌐</Text>
            <Text style={styles.menuText}>Location: United States</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Privacy Policy */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          {/* Terms */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuText}>Terms</Text>
          </TouchableOpacity>
          
          {/* Send Feedback */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>✉️</Text>
            <Text style={styles.menuText}>Send Feedback</Text>
          </TouchableOpacity>
          
          {/* Delete Account */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={styles.menuText}>Delete Account</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Log Out */}
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>Log Out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  userInfoSection: {
    padding: 16,
    paddingBottom: 20,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  themeSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3D3D3D',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  selectedTheme: {
    backgroundColor: '#444444',
  },
  themeIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  optionText: {
    color: 'white',
    fontSize: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
    fontSize: 18,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
  },
});

// Example of how to use the component in a parent screen
const HomeScreen = () => {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  
  const userData = {
    name: 'horace njoroge',
    email: 'horacenjorge@gmail.com'
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your regular screen content here */}
      <View style={{ flex: 1 }}>
        {/* Header with profile button */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'flex-end', 
          padding: 16, 
          backgroundColor: '#1A1A1A' 
        }}>
          <TouchableOpacity 
            onPress={() => setProfileMenuVisible(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#333',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>
        
        {/* Rest of your screen content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Home Screen Content</Text>
        </View>
      </View>
      
      {/* Profile menu overlay */}
      <ProfileMenuOverlay 
        visible={profileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        userData={userData}
      />
    </SafeAreaView>
  );
};

export default ProfileMenuOverlay;