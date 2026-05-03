import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../constants/colors';

import HomeScreen from '../app/screens/HomeScreen';
import FoldersScreen from '../app/screens/FoldersScreen';
import FolderDetailScreen from '../app/screens/FolderDetailScreen';
import StatsScreen from '../app/screens/StatsScreen';
import SettingsScreen from '../app/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const FoldersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FoldersScreenMain" component={FoldersScreen} />
      <Stack.Screen name="FolderDetailScreen" component={FolderDetailScreen} />
    </Stack.Navigator>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color, fontWeight: '600' }}>H</Text>,
        }}
      />
      <Tab.Screen
        name="Folders"
        component={FoldersStack}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color, fontWeight: '600' }}>C</Text>,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color, fontWeight: '600' }}>S</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color, fontWeight: '600' }}>+</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
