import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
let firebaseAdminInitialized = false;

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
            projectId: 'sharp-streaks'
        });
        console.log('✅ Firebase Admin initialized successfully');
        firebaseAdminInitialized = true;
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
    }
} else {
    console.warn('⚠️ serviceAccountKey.json not found. Push notifications will be disabled.');
    console.warn('To enable: Download project key from Firebase Console and save as serviceAccountKey.json in backend root.');
}

export const messaging = firebaseAdminInitialized ? admin.messaging() : null;
export default admin;
