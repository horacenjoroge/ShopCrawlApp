// ComparisonScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ComparisonScreen = ({ route }) => {
  const { compareItems } = route.params || { compareItems: [] };

  if (!compareItems || compareItems.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not enough items to compare!</Text>
      </View>
    );
  }

  // You can display them in columns or a horizontal scroll
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compare Products</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Item</Text>
        <Text style={styles.headerCell}>Price</Text>
        <Text style={styles.headerCell}>Shipping</Text>
        <Text style={styles.headerCell}>MB</Text>
        <Text style={styles.headerCell}>CB</Text>
      </View>

      {compareItems.map((item, index) => (
        <View key={index} style={styles.row}>
          {/* Product Name + thumbnail */}
          <View style={[styles.cell, { flex: 2 }]}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <Text style={styles.productName} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {/* Price */}
          <Text style={styles.cell}>${item.price}</Text>
          {/* Shipping */}
          <Text style={styles.cell}>${item.shipping}</Text>
          {/* MB */}
          <Text style={styles.cell}>{item.mbScore?.toFixed(2)}</Text>
          {/* CB */}
          <Text style={styles.cell}>{item.cbScore?.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default ComparisonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  cell: {
    flex: 1,
    color: '#fff',
  },
  thumb: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
  },
  productName: {
    color: '#fff',
    width: 120,
  },
});
