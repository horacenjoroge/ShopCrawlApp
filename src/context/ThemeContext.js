import React, { 
  createContext,    
  useState,    
  useContext,    
  useEffect  
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme Colors
export const THEMES = {
  light: {
    background: '#f4f4f4',
    cardBackground: '#ffffff',
    text: '#333',
    secondaryText: '#666',
    primary: '#6366F1',
    border: '#e1e1e1',
    statusBar: 'dark-content'
  },
  dark: {
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    secondaryText: '#B0B0B0',
    primary: '#7C7CFF',
    border: '#333333',
    statusBar: 'light-content'
  }
};

// Create Theme Context
const ThemeContext = createContext({
  theme: 'light',
  isDarkMode: false,
  setTheme: () => {},
  setPrimaryColor: () => {},
  currentTheme: THEMES.light
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const systemColorScheme = useColorScheme();

  // Determine current theme
  const getCurrentTheme = (selectedTheme) => {
    let baseTheme;
    
    // Determine base theme
    if (selectedTheme === 'auto') {
      baseTheme = systemColorScheme || 'light';
    } else {
      baseTheme = selectedTheme;
    }

    // Create theme with custom primary color
    return {
      ...THEMES[baseTheme],
      primary: primaryColor
    };
  };

  // Effect to load saved theme and primary color
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        // Load theme
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        }

        // Load primary color
        const savedPrimaryColor = await AsyncStorage.getItem('primaryColor');
        if (savedPrimaryColor) {
          setPrimaryColor(savedPrimaryColor);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, []);

  // Update theme handler
  const updateTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Update primary color handler
  const updatePrimaryColor = async (color) => {
    try {
      await AsyncStorage.setItem('primaryColor', color);
      setPrimaryColor(color);
    } catch (error) {
      console.error('Error saving primary color:', error);
    }
  };

  // Determine current theme colors and mode
  const currentThemeName = getCurrentTheme(theme);
  const currentTheme = {
    ...THEMES[currentThemeName],
    primary: primaryColor
  };
  const isDarkMode = currentThemeName === 'dark';

  return (
    <ThemeContext.Provider 
      value={{
        theme,
        isDarkMode,
        setTheme: updateTheme,
        setPrimaryColor: updatePrimaryColor,
        currentTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;