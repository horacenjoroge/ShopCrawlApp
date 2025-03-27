/**
 * LoginScreen component allows users to sign in or create an account.
 * It provides input fields for email and password, a sign-in button,
 * and options to continue with Google, Apple
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput, Divider, Button, HelperText } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';

const LoginScreen = () => {
  const navigation = useNavigation();
  
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
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
  
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
  
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting login with:', { email, password: '***' });
  
      // Call login API
      const userData = await authService.login(email, password);
  
      console.log('Login Response:', userData);
  
      if (userData.error) {
        throw new Error(userData.error);
      }
  
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userId', userData.userId);
      // Store the email that was used for login, not from response
      await AsyncStorage.setItem('userEmail', email);
  
      const storedEmail = await AsyncStorage.getItem('userEmail');
      console.log('Stored Email:', storedEmail);
  
      // Navigate to home with the email used for login
      navigation.replace('Home', { userEmail: email });
    } catch (err) {
      console.log('Login Error:', err.message);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
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
        onChangeText={validateEmail}
        error={!!emailError}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

      {/* Password Input */}
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={password}
        onChangeText={validatePassword}
        error={!!passwordError}
        right={
          <TextInput.Icon 
            icon={secureTextEntry ? "eye" : "eye-off"} 
            onPress={toggleSecureEntry} 
          />
        }
      />
      {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

      {/* General Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Sign In Button */}
      <Button 
        mode="contained" 
        buttonColor="black" 
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" size="small" /> : "Sign In"}
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