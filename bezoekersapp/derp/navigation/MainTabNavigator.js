import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';

export default TabNavigator(
  {
    "My hotel": {
      screen: HomeScreen,
    },
    "Scan event": {
      screen: SettingsScreen,
    },
    "Event ratings": {
      screen: LinksScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'My hotel':
            iconName =
              Platform.OS === 'ios'
                ? `ios-map${focused ? '' : '-outline'}`
                : 'md-map';
            break;
          case 'Event ratings':
            iconName = Platform.OS === 'ios' ? `ios-list${focused ? '' : '-outline'}` : 'md-list';
            break;
          case 'Scan event':
            iconName =
              Platform.OS === 'ios' ? `ios-camera${focused ? '' : '-outline'}` : 'md-camera';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);
