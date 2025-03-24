/**
 * SplashScreen component serves as the welcome screen for the ShopCrawl app.
 * It provides options for users to register/login or continue as a guest.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <Text variant="displayMedium" style={styles.title}>Welcome to</Text>
      <Text variant="displayMedium" style={styles.brand}>ShopCrawl</Text>

      {/* Buttons */}
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
    fontSize: 28,
    marginBottom: 0,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loginButton: {
    width: 250,
    marginBottom: 20,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  guestButton: {
    width: 250,
    borderColor: 'black',
    borderRadius: 5,
  },
  guestButtonText: {
    color: 'black',
  },
});

export default WelcomeScreen;
