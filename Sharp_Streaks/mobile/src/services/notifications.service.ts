import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications should be displayed
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permission not granted for notifications');
            return null;
        }

        // Get the Expo project ID from app config
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
            Constants.easConfig?.projectId;

        if (!projectId) {
            console.log('⚠️ No Expo project ID found. Notifications won\'t work in Expo Go.');
            console.log('To enable notifications, create a development build or use EAS.');
            return null;
        }

        // Get the FCM token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId
        });

        console.log('FCM Token:', tokenData.data);

        // Configure Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FFD700',
            });
        }

        return tokenData.data;
    } catch (error) {
        console.log('⚠️ Push notifications are not available in Expo Go.');
        console.log('To use notifications, you need to create a development build.');
        console.log('Error:', error);
        return null;
    }
};

export const sendTokenToBackend = async (token: string, userId: string, apiClient: any) => {
    try {
        await apiClient.post('/auth/update-fcm-token', { userId, fcmToken: token });
        console.log('FCM token sent to backend');
    } catch (error) {
        console.error('Failed to send FCM token to backend:', error);
    }
};
