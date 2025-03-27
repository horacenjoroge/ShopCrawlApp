/**
 * RegisterScreen component allows users to create a new account.
 * It provides input fields for email, password, confirm password,
 * and options to continue with Google, Apple, or Facebook.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { TextInput, Divider, Button, HelperText } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';

const RegisterScreen = () => {
  const navigation = useNavigation();
  
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  // Email validatio
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
    
    // Check if passwords match when confirm password is already entered
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
    
    setPasswordError('');
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (text) => {
    setConfirmPassword(text);
    
    if (!text) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    
    if (text !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Toggle confirm password visibility
  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  // Handle registration
  const handleRegister = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
  
    try {
      setLoading(true);
      setError("");
    
      const userData = await authService.register({
        username: email.split("@")[0],
        email,
        password,
      });
    
      console.log("User Data:", userData); // ✅ Log API response
    
      if (!userData || !userData.user || !userData.token) {
        throw new Error("Invalid response from server");
      }
    
      await AsyncStorage.setItem("userToken", userData.token);
      await AsyncStorage.setItem("userId", userData.user._id);
      await AsyncStorage.setItem("userEmail", userData.user.email);
    
      navigation.navigate("Home", { userEmail: userData.user.email });
    
    } catch (err) {
      console.error("Registration Error:", err); // ✅ Log errors
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={28} />
        </TouchableOpacity>

        <Text style={styles.title}>ShopCrawl</Text>
        <Text style={styles.subtitle}>Create an account</Text>

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

        {/* Confirm Password Input */}
        <TextInput
          label="Confirm Password"
          mode="outlined"
          secureTextEntry={secureConfirmTextEntry}
          style={styles.input}
          value={confirmPassword}
          onChangeText={validateConfirmPassword}
          error={!!confirmPasswordError}
          right={
            <TextInput.Icon 
              icon={secureConfirmTextEntry ? "eye" : "eye-off"} 
              onPress={toggleSecureConfirmEntry} 
            />
          }
        />
        {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}

        {/* General Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Register Button */}
        <Button 
          mode="contained" 
          buttonColor="black" 
          style={styles.signInButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" size="small" /> : "Register"}
        </Button>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerText}>
            Already have an account? <Text style={{ fontWeight: 'bold' }}>Sign In</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
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
    marginBottom: 10,
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

export default RegisterScreen;
