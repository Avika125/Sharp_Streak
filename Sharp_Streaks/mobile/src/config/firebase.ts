import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDUk5meGHv_hjbwwfAO20W0Dli1glfQPHA",
    authDomain: "sharp-streaks.firebaseapp.com",
    projectId: "sharp-streaks",
    storageBucket: "sharp-streaks.firebasestorage.app",
    messagingSenderId: "621732187868",
    appId: "1:621732187868:web:b1f8d204bb2d30b18d2e19",
    measurementId: "G-0NKQ9XQ6WE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
