import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const ListViewScreen = () => {
  const [places, setPlaces] = useState([]);
  

  useEffect(() => {
    // Request permission to access the user's location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted.');
        return;
      }

      // Get the user's location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Make an API request to fetch nearby places using the user's location
      axios
        .get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&types=restaurant&key=${apiKey}&fields=name,place_id,photos`
        )
        .then((response) => {
          setPlaces(response.data.results);
        })
        .catch((error) => {
          console.error('Error fetching nearby places:', error);
        });
    })();
  }, []); // Run this effect only once when the component mounts

  return (
      <View style={{ flex: 1 }}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>Name: {item.name}</Text>
            <Text>Place ID: {item.place_id}</Text>
            {item.photos && (
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${item.photos[0].photo_reference}&key=${apiKey}`,
                }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </View>
        )}
      />
      </View>
  );
};

export default ListViewScreen;