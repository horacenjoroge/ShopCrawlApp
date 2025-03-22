import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@rneui/themed';
import HomeScreen from './screens/homescreen'; // Make sure the path is correct

export default function App() {
  return (
    <PaperProvider>
      <ThemeProvider>
        <View style={styles.container}>
          <HomeScreen />
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});