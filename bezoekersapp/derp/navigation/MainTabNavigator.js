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
    Thuis: {
      screen: HomeScreen,
    },
    Linkjes: {
      screen: LinksScreen,
    },
    Instellingen: {
      screen: SettingsScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Thuis':
            iconName =
              Platform.OS === 'ios'
                ? `ios-map${focused ? '' : '-outline'}`
                : 'md-map';
            break;
          case 'Linkjes':
            iconName = Platform.OS === 'ios' ? `ios-list${focused ? '' : '-outline'}` : 'md-list';
            break;
          case 'Instellingen':
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
