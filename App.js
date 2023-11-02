import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapViewScreen from './MapViewScreen'; // Your map view component
import ListViewScreen from './ListViewScreen'; // Your list view component

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Map" component={MapViewScreen} />
        <Tab.Screen name="List" component={ListViewScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}