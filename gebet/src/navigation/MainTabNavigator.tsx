import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/home/HomeScreen';
import AnliegenStackNavigator from './AnliegenStackNavigator';
import JournalStackNavigator from './JournalStackNavigator';
import EinstellungenScreen from '../screens/einstellungen/EinstellungenScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.terrakotta,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_500Medium',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Heute: 'home-outline',
            Anliegen: 'list-outline',
            Journal: 'journal-outline',
            Einstellungen: 'settings-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Heute" component={HomeScreen} options={{ title: 'Heute' }} />
      <Tab.Screen name="Anliegen" component={AnliegenStackNavigator} options={{ title: 'Anliegen', unmountOnBlur: true }} />
      <Tab.Screen name="Journal" component={JournalStackNavigator} options={{ title: 'Journal', unmountOnBlur: true }} />
      <Tab.Screen name="Einstellungen" component={EinstellungenScreen} options={{ title: 'Einstellungen' }} />
    </Tab.Navigator>
  );
}
