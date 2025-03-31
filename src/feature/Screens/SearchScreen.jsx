import React, { useState } from 'react';
import { 
    View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, 
    Image, ActivityIndicator, Linking 
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SERP_API_KEY = '7adf35f97c008c6ddce7921ee949027b7b8b34fd4fa969bd54d613a413093dc1'; // Replace with your key

const SearchScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            setLoading(true);
            try {
                const response = await axios.get('https://serpapi.com/search.json', {
                    params: {
                        q: searchQuery,
                        api_key: SERP_API_KEY,
                        engine: 'google_shopping',
                        gl: 'ke', 
                        hl: 'en',
                    },
                });

                setSearchResults(response.data.shopping_results || []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            }
            setLoading(false);
        } else {
            setSearchResults([]);
        }
    };

    const openProductLink = (link) => {
        if (link) {
            Linking.openURL(link).catch(err => console.error("Failed to open URL:", err));
        }
    };

    const renderProductItem = ({ item }) => (
        <View style={styles.productItem}>
            <Image source={{ uri: item.thumbnail }} style={styles.productImage} resizeMode="contain" />
            <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
            {item.source && <Text style={styles.productStore}>Store: {item.source}</Text>}
            <Text style={styles.productPrice}>{item.price}</Text>
            {item.link && (
                <TouchableOpacity onPress={() => openProductLink(item.link)} style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Product</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={30} />
                </TouchableOpacity>
                <Text style={styles.title}>ShopCrawl</Text>
                <TouchableOpacity>
                    <Icon name="user" type="font-awesome" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search across multiple stores..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Icon name="close" size={20} color="gray" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    {loading ? <ActivityIndicator color="gray" /> : <Icon name="search" type="font-awesome" size={20} color="gray" />}
                </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Search Results</Text>
                    <FlatList
                        data={searchResults.slice(0, 7)}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.position ? item.position.toString() : Math.random().toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginRight: 10,
    },
    clearButton: {
        marginRight: 5,
    },
    searchButton: {
        padding: 5,
    },
    section: {
        marginBottom: 20,
        flex: 1,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    productItem: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 5,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    productImage: {
        width: 120,
        height: 120,
        marginBottom: 8,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    productStore: {
        fontSize: 12,
        color: 'gray',
        marginTop: 3,
    },
    productPrice: {
        fontSize: 14,
        color: 'green',
        marginTop: 5,
    },
    viewButton: {
        marginTop: 8,
        backgroundColor: '#007bff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    viewButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SearchScreen;
