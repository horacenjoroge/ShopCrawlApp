import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Bounce effect for buttons
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const [fontsLoaded] = useFonts({
    Boldonose: require('../../../assets/fonts/Boldonse-Regular.ttf'),
    RobotoBold: require('../../../assets/fonts/Roboto_Condensed-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.title, { fontFamily: 'Boldonose' }]}>Welcome to</Text>
          <Text style={[styles.brand, { fontFamily: 'RobotoBold' }]}>ShopCrawl</Text>
        </Animated.View>

        {/* Animated button */}
        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: bounceAnim }] }]}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
            labelStyle={styles.buttonText}
          >
            Register / Login
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            style={styles.guestButton}
            labelStyle={styles.guestButtonText}
          >
            Continue as Guest
          </Button>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: 250,
    marginBottom: 15,
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    width: 250,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 12,
    elevation: 3,
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;