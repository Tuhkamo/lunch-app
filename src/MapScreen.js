// MapScreen.js

import React, { useState, useEffect, useMemo } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchNearbyPlaces } from '../utils/api';

const MapScreen = () => {
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedPlace, setselectedPlace] = useState(null);
  const [parsedSavedPlaces, setparsedSavedPlaces] = useState([]);

  const fetchNearbyPointsOfInterest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });

      const searchRadiusMeters = 1000;
      const degreesPerPixel = 110880;
      const radiusInDegrees = searchRadiusMeters / degreesPerPixel;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: radiusInDegrees,
        longitudeDelta: radiusInDegrees,
      };

      setRegion(newRegion);

      const restaurantPlaces = await fetchNearbyPlaces('restaurant');
      const bakeryPlaces = await fetchNearbyPlaces('bakery');

      setPlaces([...restaurantPlaces, ...bakeryPlaces]);

      const savedPlaces = await AsyncStorage.getItem('savedPlaces');
      const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];
      setparsedSavedPlaces(parsedSavedPlaces.map((place) => place.place_id));
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
    }
  };

  useEffect(() => {
    // Fetch the nearby restaurants and saved restaurants whenever parsedSavedPlaces changes
    fetchNearbyPointsOfInterest();
  }, [parsedSavedPlaces]);

  const handleMarkerPress = (place) => {
    setselectedPlace(place);
  };

  const handleSaveToFavorite = async () => {
    try {
      if (selectedPlace) {
        const savedPlaces = await AsyncStorage.getItem('savedPlaces');
        const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];

        const isAlreadySaved = parsedSavedPlaces.some(
          (place) => place.place_id === selectedPlace.place_id
        );

        if (isAlreadySaved) {
          Alert.alert('Info', 'This place is already in your favorites.');
        } else {
          parsedSavedPlaces.push(selectedPlace);
          await AsyncStorage.setItem('savedPlaces', JSON.stringify(parsedSavedPlaces));

          Alert.alert('Success', 'Added to favorites!');
        }
      } else {
        Alert.alert('Info', 'Please select a place before saving.');
      }
    } catch (error) {
      console.error('Error saving place to favorites:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={styles.mapcontainer} region={region}>
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            onPress={() => handleMarkerPress(place)}
            pinColor={place.types.includes('bakery') ? 'yellow' : 'red'}
          />
        ))}
      </MapView>
      <Button
        title="Save Selected Place"
        onPress={handleSaveToFavorite}
        color="#4CAF50"
        style={{ position: 'absolute', top: 10, right: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapcontainer: {
    flex: 1,
  },
});

export default MapScreen;