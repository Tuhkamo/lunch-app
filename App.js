// App.js

// Import necessary modules and components from React Navigation and other files
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './src/MapScreen';
import RestaurantListScreen from './src/RestaurantListScreen';
import FavoriteScreen from './src/FavoriteScreen';
import BakeryListScreen from './src/BakeryListScreen';
import { Ionicons } from '@expo/vector-icons';

// Create a bottom tab navigator using React Navigation
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Define the bottom tab navigator with screens and icons */}
      <Tab.Navigator>
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Restaurants"
          component={RestaurantListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Bakeries"
          component={BakeryListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flame" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoriteScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="star" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}