import axios from 'axios';
import { Platform } from 'react-native';

// IMPORTANT: Update this IP to match your computer's IP address
// Run 'ipconfig' in PowerShell and use the IPv4 Address under Wi-Fi
const COMPUTER_IP = '192.168.43.151';

// Use computer's actual IP for physical devices, localhost for web
const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:3000/api/'
    : `http://${COMPUTER_IP}:3000/api/`;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // 5 second timeout to prevent hanging
});

export const syncUserToBackend = async (firebase_uid: string, email: string, username?: string) => {
    try {
        const response = await api.post('auth/sync', { firebase_uid, email, username });
        return response.data;
    } catch (error) {
        console.error('API Sync Error:', error);
        throw error;
    }
};

export const getStreakStatus = async (userId: string) => {
    try {
        const response = await api.post('streak/status', { userId });
        return response.data;
    } catch (error) {
        console.error('API Streak Status Error:', error);
        throw error;
    }
};

export const completeChallenge = async (userId: string) => {
    try {
        const response = await api.post('streak/complete', { userId });
        return response.data;
    } catch (error) {
        console.error('API Complete Challenge Error:', error);
        throw error;
    }
};

export const getActiveFlashChallenge = async () => {
    try {
        const response = await api.get('flash/active');
        return response.data;
    } catch (error) {
        console.error('API Get Flash Error:', error);
        throw error;
    }
};

export const submitFlashAttempt = async (userId: string, sessionId: string, chosenIndex: number, timeTakenMs: number) => {
    try {
        const response = await api.post('flash/submit', { userId, sessionId, chosenIndex, timeTakenMs });
        return response.data;
    } catch (error) {
        console.error('API Submit Flash Error:', error);
        throw error;
    }
};

export const getFlashLeaderboard = async (sessionId: string) => {
    try {
        const response = await api.get(`flash/leaderboard/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('API Leaderboard Error:', error);
        throw error;
    }
};

export const getShopStatus = async () => {
    try {
        const response = await api.get('shop/status');
        return response.data;
    } catch (error) {
        console.error('API Get Shop Error:', error);
        throw error;
    }
};

export const purchaseShopItem = async (userId: string, itemId: string) => {
    try {
        const response = await api.post('shop/buy', { userId, itemId });
        return response.data;
    } catch (error) {
        console.error('API Purchase Error:', error);
        throw error;
    }
};

export const getUserInventory = async (userId: string) => {
    try {
        const response = await api.get(`shop/inventory/${userId}`);
        return response.data;
    } catch (error) {
        console.error('API Inventory Error:', error);
        throw error;
    }
};

// SOCIAL METHODS
export const searchUsers = async (query: string, currentUserId: string) => {
    try {
        const response = await api.get('social/search', { params: { query, currentUserId } });
        return response.data;
    } catch (error) {
        console.error('API Search Error:', error);
        throw error;
    }
};

export const sendFriendRequest = async (fromUid: string, toUid: string) => {
    try {
        const response = await api.post('social/friend-request', { fromUid, toUid });
        return response.data;
    } catch (error) {
        console.error('API Friend Request Error:', error);
        throw error;
    }
};

export const getFriends = async (userId: string) => {
    try {
        const response = await api.get(`social/friends/${userId}`);
        return response.data;
    } catch (error) {
        console.error('API Get Friends Error:', error);
        throw error;
    }
};

export const linkStreak = async (userId: string, friendUid: string) => {
    try {
        const response = await api.post('social/link-streak', { userId, friendUid });
        return response.data;
    } catch (error) {
        console.error('API Link Streak Error:', error);
        throw error;
    }
};

export const getSynergyStatus = async (userId: string) => {
    try {
        const response = await api.get(`social/synergy/${userId}`);
        return response.data;
    } catch (error) {
        console.error('API Synergy Status Error:', error);
        throw error;
    }
};

// FORGE METHODS
export const getForgeStatus = async (userId: string) => {
    try {
        const response = await api.get(`forge/status/${userId}`);
        return response.data;
    } catch (error) {
        console.error('API Forge Status Error:', error);
        throw error;
    }
};

export const startForge = async (userId: string, amount: number) => {
    try {
        const response = await api.post('forge/start', { userId, amount });
        return response.data;
    } catch (error) {
        console.error('API Start Forge Error:', error);
        throw error;
    }
};

export const claimCrystal = async (userId: string) => {
    try {
        const response = await api.post('forge/claim', { userId });
        return response.data;
    } catch (error) {
        console.error('API Claim Crystal Error:', error);
        throw error;
    }
};

export default api;
