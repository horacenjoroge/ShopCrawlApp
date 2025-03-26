import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useFonts } from 'expo-font';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
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
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, { fontFamily: 'Boldonose' }]}>Welcome to</Text>
        <Text style={[styles.brand, { fontFamily: 'RobotoBold' }]}>ShopCrawl</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>  
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
          onPress={() => navigation.navigate('Search')}
          style={styles.guestButton}
          labelStyle={styles.guestButtonText}
        >
          Continue as Guest
        </Button>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 5,
    color: 'black',
  },
  brand: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: 250,
    marginBottom: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  guestButton: {
    width: 250,
    borderColor: 'black',
    borderRadius: 10,
    elevation: 2,
  },
  guestButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default WelcomeScreen;
