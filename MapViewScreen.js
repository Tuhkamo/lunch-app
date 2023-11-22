import React, { useState, useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

const MapViewScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [parsedSavedRestaurants, setParsedSavedRestaurants] = useState([]);

  const fetchNearbyRestaurants = async () => {
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

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&types=restaurant&key=${apiKey}&fields=name,place_id,photos`
      );

      setRestaurants(response.data.results);

      // Initialize saved markers based on AsyncStorage
      const savedRestaurants = await AsyncStorage.getItem('savedRestaurants');
      const parsedSavedRestaurants = savedRestaurants ? JSON.parse(savedRestaurants) : [];
      setParsedSavedRestaurants(parsedSavedRestaurants.map((restaurant) => restaurant.place_id));

    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
    }
  };

  useEffect(() => {
    // Fetch the nearby restaurants and saved restaurants whenever parsedSavedRestaurants changes
    fetchNearbyRestaurants();
  }, [parsedSavedRestaurants]);

  const handleMarkerPress = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleSaveToFavorite = async () => {
    try {
      if (selectedRestaurant) {
        const savedRestaurants = await AsyncStorage.getItem('savedRestaurants');
        const parsedSavedRestaurants = savedRestaurants ? JSON.parse(savedRestaurants) : [];

        const isAlreadySaved = parsedSavedRestaurants.some(
          (restaurant) => restaurant.place_id === selectedRestaurant.place_id
        );

        if (isAlreadySaved) {
          Alert.alert('Info', 'This restaurant is already in your favorites.');
        } else {
          parsedSavedRestaurants.push(selectedRestaurant);
          await AsyncStorage.setItem('savedRestaurants', JSON.stringify(parsedSavedRestaurants));

          Alert.alert('Success', 'Restaurant added to favorites!');
        }
      } else {
        Alert.alert('Info', 'Please select a restaurant before saving.');
      }
    } catch (error) {
      console.error('Error saving restaurant to favorites:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region}>
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
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.place_id}
            coordinate={{
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            }}
            title={restaurant.name}
            onPress={() => handleMarkerPress(restaurant)}
            pinColor="red"
          />
        ))}
      </MapView>
        <Button
          title="Save Selected Restaurant"
          onPress={handleSaveToFavorite}
          color="#4CAF50"
          style={{ position: 'absolute', top: 10, right: 10 }}
        />
    </View>
  );
};

export default MapViewScreen;