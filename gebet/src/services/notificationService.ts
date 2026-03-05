import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const GEBETS_TEXTE = [
  'Nimm dir eine Stille für Gott.',
  'Wie geht es deiner Seele heute?',
  'Bringe deinen Tag vor Gott.',
  'Du bist nicht allein — bete jetzt.',
  'Zeit für dein Gespräch mit Gott.',
  'Gott wartet auf dich.',
  'Bring deine Anliegen vor den Herrn.',
  'Ein Moment der Stille verändert alles.',
];

function getZufaelligenGebetstext(): string {
  const tag = new Date().getDay();
  return GEBETS_TEXTE[tag % GEBETS_TEXTE.length];
}

export async function berechtigungAnfordern(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function erinnerungPlanen(stunde: number, minute: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    identifier: 'gebet_erinnerung',
    content: {
      title: 'Zeit zum Gebet',
      body: getZufaelligenGebetstext(),
      sound: true,
      data: { screen: 'Heute' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: stunde,
      minute: minute,
    },
  });
}

export async function erinnerungAbbrechen(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function notificationHandlerEinrichten(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
