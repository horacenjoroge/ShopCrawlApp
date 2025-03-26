import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const SavedScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved Items</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5f2',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SavedScreen; 