// api.js

import axios from 'axios';
import * as Location from 'expo-location';
import { PLACES_API_KEY } from '@env';

const apiKey = PLACES_API_KEY;

export const fetchNearbyPlaces = async (type) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted.');
        return [];
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&types=${type}&key=${apiKey}&fields=name,place_id,photos`
      );

      const places = response.data.results;

      // Check if there are more results and fetch them
      if (response.data.next_page_token) {
        const nextPageResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${response.data.next_page_token}&key=${apiKey}`
        );
        return [...places, ...nextPageResponse.data.results];
      }

      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  };