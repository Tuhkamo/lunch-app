import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const PlaceItem = ({ name, placeId, photos }) => (
  <View style={styles.placeItem}>
    <Text style={styles.placeName}>Name: {name}</Text>
    <Text style={styles.placeId}>Place ID: {placeId}</Text>
    {photos && (
      <Image
        source={{
          uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${photos[0].photo_reference}&key=${apiKey}`,
        }}
        style={styles.placeImage}
      />
    )}
  </View>
);

const ListViewScreen = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      axios
        .get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&types=restaurant&key=${apiKey}&fields=name,place_id,photos`
        )
        .then((response) => {
          setPlaces(response.data.results);
        })
        .catch((error) => {
          console.error('Error fetching nearby places:', error);
        });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <PlaceItem name={item.name} placeId={item.place_id} photos={item.photos} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeId: {
    color: '#777',
  },
  placeImage: {
    width: "auto",
    height: 200,
    marginTop: 10,
  },
});

export default ListViewScreen;