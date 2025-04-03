import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
    if (!validateEmail(email) || !validatePassword(password)) return;

    try {
      setLoading(true);
      setError('');
      console.log('Attempting login with:', { email, password: '***' });

      // Call login API
      const userData = await authService.login(email, password);
      console.log('Login Response:', userData);

      if (userData.error) throw new Error(userData.error);

      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userId', userData.userId);
      await AsyncStorage.setItem('userEmail', email);

      // Navigate to Main screen
      navigation.replace('Main');
    } catch (err) {
      console.log('Login Error:', err.message);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="white" />
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
          right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={toggleSecureEntry} />}
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
          textColor="white"
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
            <Icon name="google" type="font-awesome" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Icon name="apple" type="font-awesome" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Icon name="facebook" type="font-awesome" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#4F46E5', // Purple background
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 60,
    backgroundColor: '#4F46E5', // Match background color
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
    color: 'white',
  },
  subtitle: {
    textAlign: 'center',
    color: '#D1D5DB',
    marginBottom: 30,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  signInButton: {
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  registerText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'white',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: 'white',
  },
  orContinueText: {
    textAlign: 'center',
    marginBottom: 15,
    color: 'white',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    width: 90,
    alignItems: 'center',
  },
});

export default LoginScreen;
