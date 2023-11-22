import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const FavoriteScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const savedRestaurants = await AsyncStorage.getItem('savedRestaurants');
        const parsedSavedRestaurants = savedRestaurants ? JSON.parse(savedRestaurants) : [];
        setFavoriteRestaurants(parsedSavedRestaurants);
      } catch (error) {
        console.error('Error fetching favorite restaurants:', error);
      }
    };

    // Fetch favorites every time the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });

    return unsubscribe; // Cleanup the subscription when the component unmounts
  }, [navigation]); // Include navigation as a dependency to re-run the effect when navigation changes

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteRestaurants}
        keyExtractor={(item, index) => item.place_id + index.toString()} // Include index to make keys unique
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            <View style={styles.textContainer}>
              <Text style={styles.placeName}>Name: {item.name}</Text>
              <Text style={styles.placeId}>Place ID: {item.place_id}</Text>
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
                color="#FF5733" // Orange color for the button
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
    fontWeight: 'bold',
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
  },
});

export default FavoriteScreen;