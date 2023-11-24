// FavoriteScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLACES_API_KEY } from '@env';

// Extract API key from environment variables
const apiKey = PLACES_API_KEY;

// Define the FavoriteScreen component
const FavoriteScreen = ({ navigation }) => {
  // State to store the list of favorite places
  const [favoritePlaces, setFavoritePlaces] = useState([]);

  // Function to fetch and parse favorite places from AsyncStorage
  const fetchFavorites = async () => {
    try {
      const savedPlaces = await AsyncStorage.getItem('savedPlaces');
      const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];
      setFavoritePlaces(parsedSavedPlaces);
    } catch (error) {
      console.error('Error fetching favorite places:', error);
    }
  };

  // useEffect hook to fetch favorites when the screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });
    return unsubscribe; // Cleanup the subscription when the component unmounts
  }, [navigation]);

  // Function to remove a place from favorites
const removeFavorite = async (placeId) => {
  try {
    // Retrieve the current list of saved places from AsyncStorage
    const savedPlaces = await AsyncStorage.getItem('savedPlaces');
    const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];

    // Find the index of the place with the specified placeId in the list of saved places
    const indexToRemove = parsedSavedPlaces.findIndex(
      (place) => place.place_id === placeId
    );

    // If the place is found in the list, remove it
    if (indexToRemove !== -1) {
      parsedSavedPlaces.splice(indexToRemove, 1);
      await AsyncStorage.setItem('savedPlaces', JSON.stringify(parsedSavedPlaces));
      fetchFavorites();
    } else {
      console.warn('Place not found in favorites.');
    }
  } catch (error) {
    console.error('Error removing place from favorites:', error);
  }
};

  // Function to get price symbols based on the price level
  const getPriceSymbols = (priceLevel) => {
    return '€'.repeat(priceLevel);
  };

  // Render the FavoriteScreen component
  return (
    <View style={styles.container}>
      {/* Render the list of favorite places using FlatList */}
      <FlatList
        data={favoritePlaces}
        keyExtractor={(item, index) => item.place_id + index.toString()}
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            {/* Display place information */}
            <View style={styles.textContainer}>
              <Text style={styles.placeName}>Name: <Text style={styles.bold}>{item.name}</Text></Text>
              <Text style={styles.vicinity}>Address: <Text style={styles.bold}>{item.vicinity}</Text></Text>
              <Text style={styles.priceLevel}>Price Level: <Text style={styles.bold}>{getPriceSymbols(item.price_level)}</Text></Text>
              <Text style={styles.rating}>Rating: <Text style={styles.bold}>{item.rating}</Text></Text>
              {/* Changes text colour from green/red depending on if the place is open */}
              <Text style={[styles.openNow, { color: item.opening_hours?.open_now ? 'green' : 'red' }]}>
                Open Now: <Text style={styles.bold}>{item.opening_hours?.open_now ? 'Yes' : 'No'}</Text>
              </Text>
            </View>
            {/* Display place image */}
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${item.photos[0].photo_reference}&key=${apiKey}`,
              }}
              style={styles.placeImage}
            />
            {/* Button to remove place from favorites */}
            <View style={styles.button}>
              <Button
                title="Remove"
                onPress={() => removeFavorite(item.place_id)}
                color="#FF5733"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

// Styles for the FavoriteScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  favoriteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  textContainer: {
    marginBottom: 10,
  },
  placeName: {
    fontSize: 16,
  },
  vicinity: {
    color: '#777',
  },
  placeImage: {
    width: "auto",
    height: 200,
    marginRight: 10,
  },
  button: {
    width: "auto",
    marginRight: 10,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  openNow: {
    marginBottom: 10,
  },
});

export default FavoriteScreen;