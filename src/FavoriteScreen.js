//FavoriteScree.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const FavoriteScreen = ({ navigation }) => {
  const [favoritePlaces, setFavoritePlaces] = useState([]);

  const fetchFavorites = async () => {
    try {
      const savedPlaces = await AsyncStorage.getItem('savedPlaces');
      const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];
      setFavoritePlaces(parsedSavedPlaces);
    } catch (error) {
      console.error('Error fetching favorite places:', error);
    }
  };

  useEffect(() => {
    // Fetch favorites every time the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });

    return unsubscribe; // Cleanup the subscription when the component unmounts
  }, [navigation]); // Include navigation as a dependency to re-run the effect when navigation changes

  const removeFavorite = async (placeId) => {
    try {
      // Fetch the current list of favorite places from AsyncStorage
      const savedPlaces = await AsyncStorage.getItem('savedPlaces');
      const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];

      // Find the index of the place with the specified placeId
      const indexToRemove = parsedSavedPlaces.findIndex(
        (place) => place.place_id === placeId
      );

      // If the place is found, remove it from the array
      if (indexToRemove !== -1) {
        parsedSavedPlaces.splice(indexToRemove, 1);

        // Update AsyncStorage with the new list of favorite places
        await AsyncStorage.setItem('savedPlaces', JSON.stringify(parsedSavedPlaces));

        // Fetch the updated list of favorites
        fetchFavorites();
      } else {
        console.warn('place not found in favorites.');
      }
    } catch (error) {
      console.error('Error removing place from favorites:', error);
    }
  };

  const getPriceSymbols = (priceLevel) => {
    return '€'.repeat(priceLevel);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritePlaces}
        keyExtractor={(item, index) => item.place_id + index.toString()}
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            <View style={styles.textContainer}>
              <Text style={styles.placeName}>Name: <Text style={styles.bold}>{item.name}</Text></Text>
              <Text style={styles.vicinity}>Address: <Text style={styles.bold}>{item.vicinity}</Text></Text>
              <Text style={styles.priceLevel}>Price Level: <Text style={styles.bold}>{getPriceSymbols(item.price_level)}</Text></Text>
              <Text style={styles.rating}>Rating: <Text style={styles.bold}>{item.rating}</Text></Text>
              <Text style={[styles.openNow, { color: item.opening_hours?.open_now ? '#008000' : '#FF0000' }]}>
                Open Now: <Text style={styles.bold}>{item.opening_hours?.open_now ? 'Yes' : 'No'}</Text>
              </Text>
            </View>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${item.photos[0].photo_reference}&key=${apiKey}`,
              }}
              style={styles.placeImage}
            />
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
  placeId: {
    color: '#777',
  },
  imageButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  textItem: {
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 16,
  },
  
});

export default FavoriteScreen;