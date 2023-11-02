import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const apiKey = '';

console.log(apiKey);

const NearbyPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState({
    latitude: 0, // Initialize with 0
    longitude: 0, // Initialize with 0
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Make an API request to fetch nearby places using the user's location
      axios
        .get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=restaurant&key=${apiKey}&fields=name,place_id,photos`
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
      <MapView style={{ flex: 1 }} region={region}>
        {places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
          />
        ))}
      </MapView>
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

export default NearbyPlaces;