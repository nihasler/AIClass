import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from '../types/navigation';
import LoadingScreen from '../screens/LoadingScreen';
import MainTabNavigator from './MainTabNavigator';
import PrayerSessionScreen from '../screens/home/PrayerSessionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

export default function RootNavigator({ navigationRef }: Props) {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'Heute') {
        navigationRef.current?.navigate('Haupt', { screen: 'Heute' } as any);
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Laden" component={LoadingScreen} />
      <Stack.Screen name="Haupt" component={MainTabNavigator} />
      <Stack.Screen
        name="Gebetssitzung"
        component={PrayerSessionScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
