import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, Search, Clock, Bookmark, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const CustomNavbar = ({ state, descriptors, navigation }) => {
  const { currentTheme } = useTheme();

  const tabs = [
    { label: 'Home', icon: Home, route: 'HomeTab' },
    { label: 'Saved', icon: Bookmark, route: 'SavedTab' },
    { label: 'History', icon: Clock, route: 'HistoryTab' },
    { label: 'Profile', icon: User, route: 'ProfileTab' }
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: currentTheme.background,
      borderTopWidth: 1,
      borderTopColor: '#ccc',
      paddingVertical: 12,
      justifyContent: 'space-around',
    }}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isFocused = state.index === index;

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.route);
          }
        };

        return (
          <TouchableOpacity
            key={tab.label}
            onPress={handlePress}
            style={{ alignItems: 'center' }}
          >
            <Icon color={isFocused ? currentTheme.primary : 'gray'} />
            <Text style={{
              fontSize: 12,
              color: isFocused ? currentTheme.primary : 'gray',
              marginTop: 4
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomNavbar;
