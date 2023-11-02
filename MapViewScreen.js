import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const MapViewScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
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

      // Calculate new region based on the search radius (1000 meters)
      const searchRadiusMeters = 500;
      const degreesPerPixel = 110880; // Approximate value for latitude
      const radiusInDegrees = searchRadiusMeters / degreesPerPixel;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: radiusInDegrees,
        longitudeDelta: radiusInDegrees,
      };

      setRegion(newRegion);

      // Make an API request to fetch nearby places using the user's location
      axios
        .get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&types=restaurant&key=${apiKey}&fields=name,place_id,photos`
        )
        .then((response) => {
          setRestaurants(response.data.results);
        })
        .catch((error) => {
          console.error('Error fetching nearby restaurants:', error);
        });

    })();
  }, []); // Run this effect only once when the component mounts

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region}>
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.place_id}
            coordinate={{
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            }}
            title={restaurant.name}
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapViewScreen;