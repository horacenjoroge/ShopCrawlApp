/**
 * LoginScreen component allows users to sign in or create an account.
 * It provides input fields for email and password, a sign-in button,
 * and options to continue with Google, Apple, or Facebook.
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TextInput, Divider, Button } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} />
      </TouchableOpacity>

      <Text style={styles.title}>ShopCrawl</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>

      <TextInput
        label="Email address"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" buttonColor="black" style={styles.signInButton}>
        Sign In
      </Button>

      {/* Register Button */}
      <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register</Text>
        </Text>
      </TouchableOpacity>

      <Divider style={styles.divider} />
      <Text style={styles.orContinueText}>Or continue with</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="google" type="font-awesome" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="apple" type="font-awesome" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="facebook" type="font-awesome" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 60,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 30,
  },
  input: {
    marginBottom: 20,
  },
  signInButton: {
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  registerText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  divider: {
    marginVertical: 20,
  },
  orContinueText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    width: 90,
    alignItems: 'center',
  },
});

export default LoginScreen;
