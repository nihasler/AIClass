import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnliegenStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import AnliegenListScreen from '../screens/anliegen/AnliegenListScreen';
import AnliegenDetailScreen from '../screens/anliegen/AnliegenDetailScreen';
import AnliegenFormScreen from '../screens/anliegen/AnliegenFormScreen';

const Stack = createNativeStackNavigator<AnliegenStackParamList>();

export default function AnliegenStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Lora_600SemiBold', fontSize: 18 },
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="AnliegenListe" component={AnliegenListScreen} options={{ title: 'Meine Anliegen' }} />
      <Stack.Screen name="AnliegenDetail" component={AnliegenDetailScreen} options={{ title: 'Anliegen' }} />
      <Stack.Screen name="AnliegenFormular" component={AnliegenFormScreen} options={{ title: 'Neues Anliegen' }} />
    </Stack.Navigator>
  );
}
