// MapScreen.js

import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchNearbyPlaces } from '../utils/api';

const MapScreen = () => {

  // State variables for places, user location, region, selected place, and saved places
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedPlace, setselectedPlace] = useState(null);
  const [parsedSavedPlaces] = useState([]);

  // Function to fetch nearby points of interest (restaurants and bakeries)
  const fetchNearbyPointsOfInterest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted.');
        return;
      }

      // Gets user location and coordinates for later use
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      // Used for setting initial MapView values
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

      // Gets nearby restaurants and bakeries and combines them into places
      const restaurantPlaces = await fetchNearbyPlaces('restaurant');
      const bakeryPlaces = await fetchNearbyPlaces('bakery');

      setPlaces([...restaurantPlaces, ...bakeryPlaces]);

    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
    }
  };

  // useEffect hook to fetch nearby places and saved places whenever parsedSavedPlaces changes
  useEffect(() => {
    fetchNearbyPointsOfInterest();
  }, [parsedSavedPlaces]);

  // Function to handle marker press and set selected place
  const handleMarkerPress = (place) => {
    setselectedPlace(place);
  };

  // Function to save selected place to favorites
  const handleSaveToFavorite = async () => {
    try {
      // Check if a place is selected
      if (selectedPlace) {
        const savedPlaces = await AsyncStorage.getItem('savedPlaces');
        const parsedSavedPlaces = savedPlaces ? JSON.parse(savedPlaces) : [];

        // Check if the selected place is already in the list of saved places
        const isAlreadySaved = parsedSavedPlaces.some(
          (place) => place.place_id === selectedPlace.place_id
        );

        // If the place is already saved, show an alert
        if (isAlreadySaved) {
          Alert.alert('Info', 'This place is already in your favorites.');
        } else {
          // If the place is not already saved, add it to the list of saved places
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

  // Render the MapScreen component
  return (
    <View style={{ flex: 1 }}>
      {/* Render the MapView with markers for user location, nearby places, and saved places */}
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
        {/* Display markers for nearby places */}
        {places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={
              place.geometry && place.geometry.location
                ? {
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }
                : null
            }
            title={place.name}
            onPress={() => handleMarkerPress(place)}
            pinColor={place.types.includes('bakery') ? 'yellow' : 'red'} // Bakeries are yellow, restaurants are red
          />
        ))}
      </MapView>
      {/* Button to save selected place to favorites */}
      <Button
        title="Save Selected Place"
        onPress={handleSaveToFavorite}
        color="#4CAF50"
        style={{ position: 'absolute', top: 10, right: 10 }}
      />
    </View>
  );
};

// Styles for the MapScreen component
const styles = StyleSheet.create({
  mapcontainer: {
    flex: 1,
  },
});

export default MapScreen;