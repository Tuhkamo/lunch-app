import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapViewScreen from './MapViewScreen'; // Your map view component
import ListViewScreen from './ListViewScreen'; // Your list view component
import FavoritesScreen from './FavoritesScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Map"
          component={MapViewScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="List"
          component={ListViewScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
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