/**
 * LoginScreen component allows users to sign in or create an account.
 * It provides input fields for email and password, a sign-in button,
 * and options to continue with Google, Apple, or Facebook.
 */

import React, { useState } from 'react';
<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput, Divider, Button, HelperText } from 'react-native-paper';
=======
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TextInput, Divider, Button } from 'react-native-paper';
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';

const LoginScreen = () => {
  const navigation = useNavigation();
<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
  
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Email validation
  const validateEmail = (text) => {
    setEmail(text);
    
    if (!text) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (text) => {
    setPassword(text);
    
    if (!text) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Handle sign in
  const handleSignIn = async () => {
    // Validate inputs before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call login API
      const userData = await authService.login(email, password);
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userId', userData.userId);
      await AsyncStorage.setItem('userEmail', userData.email);
      
      // Navigate to main app
      navigation.navigate('Home', { userEmail: userData.email });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
=======
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Here you would typically validate credentials
    // For now, we'll just navigate to the Main screen
    navigation.navigate('Main');
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
  };

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

      {/* Email Input */}
      <TextInput
        label="Email address"
        mode="outlined"
        style={styles.input}
        value={email}
<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
        onChangeText={validateEmail}
        error={!!emailError}
        keyboardType="email-address"
        autoCapitalize="none"
=======
        onChangeText={setEmail}
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
      />
      {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

      {/* Password Input */}
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={password}
<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
        onChangeText={validatePassword}
        error={!!passwordError}
        right={
          <TextInput.Icon 
            icon={secureTextEntry ? "eye" : "eye-off"} 
            onPress={toggleSecureEntry} 
          />
        }
=======
        onChangeText={setPassword}
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
      />
      {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
      {/* General Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Sign In Button */}
=======
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
      <Button 
        mode="contained" 
        buttonColor="black" 
        style={styles.signInButton}
        onPress={handleSignIn}
<<<<<<< HEAD:src/feature/Screens/LoginScreen.jsx
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" size="small" /> : "Sign In"}
=======
      >
        Sign In
>>>>>>> 94b5f09a489b9e27ed15038ac619edcc5ba179f8:src/feature/Screens/LoginScreen.js
      </Button>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register</Text>
        </Text>
      </TouchableOpacity>

      <Divider style={styles.divider} />
      <Text style={styles.orContinueText}>Or continue with</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleSignIn}>
          <Icon name="google" type="font-awesome" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleSignIn}>
          <Icon name="apple" type="font-awesome" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleSignIn}>
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
    marginBottom: 5,
  },
  signInButton: {
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  forgotPasswordText: {
    textAlign: 'center',
    color: 'black',
    marginBottom: 15,
    textDecorationLine: 'underline',
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