import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getStreakStatus, completeChallenge, getActiveFlashChallenge } from '../api/client';
import { registerForPushNotifications, sendTokenToBackend } from '../services/notifications.service';
import FlashChallengeModal from '../components/FlashChallengeModal';
import api from '../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const [streak, setStreak] = useState(0);
    const [coins, setCoins] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [flashSession, setFlashSession] = useState<any>(null);
    const [showFlashModal, setShowFlashModal] = useState(false);
    const [shopActive, setShopActive] = useState(false);
    const [synergyStatus, setSynergyStatus] = useState<any>(null);

    useEffect(() => {
        loadStreakData();
        setupNotifications();
        checkActiveEvents();
    }, []);

    const checkActiveEvents = async () => {
        try {
            const flashData = await getActiveFlashChallenge();
            if (flashData.active) {
                setFlashSession(flashData.session);
            }
            const { getShopStatus, getSynergyStatus } = await import('../api/client');
            const shopData = await getShopStatus();
            setShopActive(shopData.isOpen);
            if (user) {
                const synergy = await getSynergyStatus(user.uid);
                setSynergyStatus(synergy);
            }
        } catch (error) {
            console.log('Error checking events:', error);
        }
    };

    const setupNotifications = async () => {
        if (!user) return;
        const token = await registerForPushNotifications();
        if (token) {
            await sendTokenToBackend(token, user.uid, api);
        }
    };

    const loadStreakData = async () => {
        if (!user) return;
        try {
            const data = await getStreakStatus(user.uid);
            setStreak(data.current_streak || 0);
            setCoins(data.coins || 0);
            setBackendAvailable(true);
        } catch (error: any) {
            if (error.response?.data?.error === 'User not found') {
                try {
                    const { syncUserToBackend } = await import('../api/client');
                    await syncUserToBackend(user.uid, user.email || '', user.displayName || 'User');
                    const data = await getStreakStatus(user.uid);
                    setStreak(data.current_streak || 0);
                    setCoins(data.coins || 0);
                    setBackendAvailable(true);
                    return;
                } catch (syncError) {
                    console.error('Failed to auto-sync user:', syncError);
                }
            }
            setStreak(0);
            setCoins(0);
            setBackendAvailable(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteChallenge = async () => {
        if (!user) return;
        if (!backendAvailable) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Backend Required', 'Please start the backend server to track streaks.');
            return;
        }

        setCompleting(true);
        try {
            const result = await completeChallenge(user.uid);
            setStreak(result.streak);
            setCoins(result.coins);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🔥 Success!', `Streak: ${result.streak} days | Coins earned!`);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (error.response?.data?.error?.includes('already completed')) {
                Alert.alert('Already Done!', 'You\'ve already completed today\'s challenge. Come back tomorrow!');
            } else {
                Alert.alert('Error', error.response?.data?.error || 'Failed to complete challenge');
            }
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
    );

    return (
        <View style={styles.fullContainer}>
            <LinearGradient colors={['#0A0A0A', '#1A1A1A'] as const} style={styles.background} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Sharp Rewards</Text>
                        <Text style={styles.usernameText}>{user?.displayName || 'Adventurer'}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                navigation.navigate('Forge');
                            }}
                            style={styles.headerIcon}
                        >
                            <Ionicons name="hammer" size={24} color="#FFD700" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                navigation.navigate('Social');
                            }}
                            style={styles.headerIcon}
                        >
                            <Ionicons name="people" size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </View>
                </View>

                {synergyStatus && (
                    <View style={styles.synergyBanner}>
                        <LinearGradient colors={['#065F46', '#064E3B'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bannerGradient}>
                            <View style={styles.bannerRow}>
                                <Ionicons name="link" size={20} color="#4ADE80" />
                                <Text style={styles.synergyText}>Linked with {synergyStatus.friend_name}</Text>
                                {synergyStatus.is_boosted && (
                                    <View style={styles.boostBadge}>
                                        <Text style={styles.boostText}>BOOST ACTIVE</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {flashSession && (
                    <TouchableOpacity
                        style={styles.flashBanner}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setShowFlashModal(true);
                        }}
                    >
                        <LinearGradient colors={['#FFD700', '#B8860B'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bannerGradient}>
                            <View style={styles.flashContent}>
                                <Text style={styles.flashTitle}>⚡ SHARP HOUR LIVE</Text>
                                <Text style={styles.flashSub}>Earn +{flashSession.points} coins instantly!</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {!backendAvailable && (
                    <View style={styles.warningBanner}>
                        <Ionicons name="warning" size={18} color="#FBBF24" />
                        <Text style={styles.warningText}>Backend Offline - Tracking Disabled</Text>
                    </View>
                )}

                <View style={styles.mainStats}>
                    <View style={styles.streakOverlay}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.02)'] as const}
                            style={styles.streakCard}
                        >
                            <Text style={styles.statLabel}>CURRENT STREAK</Text>
                            <View style={styles.streakRow}>
                                <Text style={styles.streakNumber}>{streak}</Text>
                                <View style={styles.daysBubble}>
                                    <Text style={styles.daysText}>DAYS</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.metaStats}>
                        <LinearGradient colors={['#1E1E1E', '#121212'] as const} style={styles.coinCard}>
                            <Text style={styles.metaLabel}>TOTAL COINS</Text>
                            <View style={styles.coinRow}>
                                <Text style={styles.coinAmount}>{coins}</Text>
                                <Ionicons name="cash" size={20} color="#FFD700" />
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {shopActive && (
                    <TouchableOpacity
                        style={styles.shopBanner}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.navigate('Shop');
                        }}
                    >
                        <LinearGradient colors={['#7E22CE', '#4C1D95'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bannerGradient}>
                            <Text style={styles.shopText}>👻 VISIT SHADOW SHOP</Text>
                            <Ionicons name="chevron-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.bigButton, completing && styles.buttonDisabled]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        handleCompleteChallenge();
                    }}
                    disabled={completing}
                >
                    <LinearGradient
                        colors={['#FFD700', '#B8860B'] as const}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>
                            {completing ? 'PROCESSING...' : 'COMPLETE DAILY TASK ✓'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={logout}
                    style={styles.logoutBtn}
                >
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {user && (
                <FlashChallengeModal
                    visible={showFlashModal}
                    session={flashSession}
                    userId={user.uid}
                    onClose={(result) => {
                        setShowFlashModal(false);
                        if (result && result.isCorrect) {
                            loadStreakData();
                        }
                        if (result) {
                            setFlashSession(null);
                        }
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#0A0A0A' },
    background: { ...StyleSheet.absoluteFillObject },
    loadingContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#FFD700', marginTop: 15, fontWeight: 'bold' },
    scrollContent: { padding: 25, paddingTop: 60, gap: 25 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    welcomeText: { color: '#666', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
    usernameText: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 2 },
    headerActions: { flexDirection: 'row', gap: 12 },
    headerIcon: { padding: 12, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    synergyBanner: { height: 50, borderRadius: 12, overflow: 'hidden' },
    flashBanner: { height: 60, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    bannerGradient: { flex: 1, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    synergyText: { color: '#4ADE80', fontWeight: '800', fontSize: 14 },
    boostBadge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    boostText: { color: '#000', fontSize: 9, fontWeight: '900' },
    flashContent: { alignItems: 'center', width: '100%' },
    flashTitle: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    flashSub: { color: '#333', fontSize: 11, fontWeight: '700' },
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FBBF24' },
    warningText: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
    mainStats: { gap: 20 },
    streakOverlay: { borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    streakCard: { padding: 40, alignItems: 'center' },
    statLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
    streakRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
    streakNumber: { fontSize: 84, color: '#FFD700', fontWeight: '900', textShadowColor: 'rgba(255, 215, 0, 0.3)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 20 },
    daysBubble: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 10 },
    daysText: { color: '#AAA', fontSize: 12, fontWeight: '900' },
    metaStats: { flexDirection: 'row', gap: 15 },
    coinCard: { flex: 1, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    metaLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    coinRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    coinAmount: { color: '#FFF', fontSize: 24, fontWeight: '900' },
    shopBanner: { height: 50, borderRadius: 12, overflow: 'hidden' },
    shopText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
    bigButton: { height: 70, borderRadius: 20, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
    buttonDisabled: { opacity: 0.5 },
    logoutBtn: { alignSelf: 'center', marginTop: 10, padding: 15 },
    logoutText: { color: '#444', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' }
});
