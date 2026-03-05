import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import JournalListScreen from '../screens/journal/JournalListScreen';
import JournalDetailScreen from '../screens/journal/JournalDetailScreen';
import JournalFormScreen from '../screens/journal/JournalFormScreen';

const Stack = createNativeStackNavigator<JournalStackParamList>();

export default function JournalStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Lora_600SemiBold', fontSize: 18 },
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="JournalListe" component={JournalListScreen} options={{ title: 'Mein Journal' }} />
      <Stack.Screen name="JournalDetail" component={JournalDetailScreen} options={{ title: 'Eintrag' }} />
      <Stack.Screen name="JournalFormular" component={JournalFormScreen} options={{ title: 'Neuer Eintrag' }} />
    </Stack.Navigator>
  );
}
