// PlaceListScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { PLACES_API_KEY } from '@env';
import { fetchNearbyPlaces } from '../utils/api';

const apiKey = PLACES_API_KEY;

/*
  Template ListScreen to be used in displaying information about nearby API-results (bakeries, restaurants).
  Easy to expand if needed for other types of establishements.
*/
const PlaceListScreen = ({ placeType }) => {
  const [places, setPlaces] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('rating');

  // useEffect hook to fetch nearby places when the component mounts or placeType changes
  useEffect(() => {
    (async () => {
      const places = await fetchNearbyPlaces(placeType);
      setPlaces(places);
    })();
  }, [placeType]);

  // Function to change price level integer into € symbols
  const getPriceSymbols = (priceLevel) => {
    return '€'.repeat(priceLevel);
  };

  // Logic for sorting criteria used by RNPickerSelect
  // Sorts based on rating, if open, and price level
  const sortPlaces = (criteria) => {
    let sortedPlaces = [...places];

    switch (criteria) {
      case 'rating':
        sortedPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'openNow':
        sortedPlaces.sort((a, b) => ((b.opening_hours?.open_now || false) ? 1 : -1));
        break;
      case 'priceLevel':
        sortedPlaces.sort((a, b) => ((b.price_level || 0) - (a.price_level || 0)));
        break;
      default:
        break;
    }

    setPlaces(sortedPlaces);
    setSortCriteria(criteria);
  };

  // Render the PlaceListScreen component
  return (
    <View style={styles.container}>
      {/* Dropdown to select sorting criteria */}
      <RNPickerSelect
        placeholder={{ label: 'Sort by', value: null }}
        items={[
          { label: 'Rating', value: 'rating' },
          { label: 'Open Now', value: 'openNow' },
          { label: 'Price Level', value: 'priceLevel' },
        ]}
        onValueChange={(value) => sortPlaces(value)}
        value={sortCriteria}
      />

      {/* FlatList to display the list of places */}
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <View style={styles.placeItem}>
            <View style={styles.textContainer}>
              <Text style={styles.placeName}>Name: <Text style={styles.bold}>{item.name}</Text></Text>
              <Text style={styles.vicinity}>Address: <Text style={styles.bold}>{item.vicinity}</Text></Text>
              <Text style={styles.priceLevel}>Price Level: <Text style={styles.bold}>{getPriceSymbols(item.price_level)}</Text></Text>
              <Text style={styles.rating}>Rating: <Text style={styles.bold}>{item.rating}</Text></Text>
              {/* Changes text color from green/red depending on if the place is open */}
              <Text style={[styles.openNow, { color: item.opening_hours?.open_now ? 'green' : 'red' }]}>
                Open Now: <Text style={styles.bold}>{item.opening_hours?.open_now ? 'Yes' : 'No'}</Text>
              </Text>
            </View>
            {/* Display images of the places */}
            {item.photos && (
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${item.photos[0].photo_reference}&key=${apiKey}`,
                }}
                style={styles.placeImage}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

// Styles for the PlaceListScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  placeItem: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeImage: {
    width: 'auto',
    height: 200,
    marginTop: 10,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PlaceListScreen;