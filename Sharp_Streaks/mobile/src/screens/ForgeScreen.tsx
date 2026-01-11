import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getForgeStatus, startForge, claimCrystal } from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ForgeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [crystal, setCrystal] = useState<any>(null);
    const [stakeAmount, setStakeAmount] = useState('100');

    useEffect(() => {
        loadForgeStatus();
    }, []);

    const loadForgeStatus = async () => {
        if (!user) return;
        try {
            const data = await getForgeStatus(user.uid);
            setCrystal(data.message ? null : data);
        } catch (error) {
            console.error('Load Forge Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartForge = async () => {
        const amount = parseInt(stakeAmount);
        if (isNaN(amount) || amount < 10) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Minimum stake is 10 coins');
            return;
        }

        try {
            setLoading(true);
            const data = await startForge(user!.uid, amount);
            setCrystal(data);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', `Crystal Forge started with ${amount} coins! 💎`);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Forge Error', error.response?.data?.error || 'Failed to start Forge');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        try {
            setLoading(true);
            const data = await claimCrystal(user!.uid);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Profit! 💰', `You earned ${data.payout} coins from your matured crystal!`);
            setCrystal(null);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to claim');
        } finally {
            setLoading(false);
        }
    };

    const getRarityStyles = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return { colors: ['#FBBF24', '#D97706'] as const, shadow: '#F59E0B' };
            case 'epic': return { colors: ['#A855F7', '#7C3AED'] as const, shadow: '#8B5CF6' };
            case 'rare': return { colors: ['#3B82F6', '#2563EB'] as const, shadow: '#60A5FA' };
            default: return { colors: ['#9CA3AF', '#4B5563'] as const, shadow: '#D1D5DB' };
        }
    };

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Stoking the Forge...</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>The Crystal Forge</Text>
            </View>

            {crystal ? (
                <View style={styles.content}>
                    <LinearGradient
                        colors={['#1E1E1E', '#121212'] as const}
                        style={styles.crystalCard}
                    >
                        <View style={styles.rarityBadge}>
                            <LinearGradient
                                colors={getRarityStyles(crystal.rarity).colors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.badgeGradient}
                            >
                                <Text style={styles.badgeText}>{crystal.rarity.toUpperCase()}</Text>
                            </LinearGradient>
                        </View>

                        <View style={[styles.crystalWrapper, { shadowColor: getRarityStyles(crystal.rarity).shadow }]}>
                            {crystal.rarity === 'legendary' ? (
                                <Image
                                    source={require('../../assets/legendary.png')}
                                    style={styles.crystalImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <LinearGradient
                                    colors={getRarityStyles(crystal.rarity).colors as any}
                                    style={styles.crystalOrbit}
                                >
                                    <Text style={styles.crystalEmoji}>
                                        {crystal.rarity === 'epic' ? '🔮' : crystal.rarity === 'rare' ? '🌀' : '🪨'}
                                    </Text>
                                </LinearGradient>
                            )}
                        </View>

                        <Text style={styles.stageTitle}>Stage {crystal.stage} Evolution</Text>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBg}>
                                <LinearGradient
                                    colors={['#4ADE80', '#22C55E'] as const}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${crystal.evolution_progress}%` }]}
                                />
                            </View>
                            <Text style={styles.progressText}>{crystal.evolution_progress}% Charged</Text>
                        </View>

                        {crystal.status === 'matured' ? (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    handleClaim();
                                }}
                            >
                                <LinearGradient
                                    colors={['#4ADE80', '#16A34A'] as const}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>CLAIM HARVEST 💰</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.infoBox}>
                                <Ionicons name="flame" size={20} color="#FBBF24" />
                                <Text style={styles.infoText}>Complete daily tasks to stoke the fire and evolve your crystal.</Text>
                            </View>
                        )}
                    </LinearGradient>

                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Multiplier</Text>
                            <Text style={styles.statValue}>x{(1 + (crystal.stage * 0.5)).toFixed(1)}</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Est. Profit</Text>
                            <Text style={styles.statValue}>{Math.floor(crystal.stake * (1 + (crystal.stage * 0.5)))}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.startSection}>
                    <Text style={styles.subtitle}>
                        Forge your visual legacy. Stake your coins to grow a mythical crystal and earn massive multipliers.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>STAKE AMOUNT</Text>
                        <TextInput
                            style={styles.input}
                            value={stakeAmount}
                            onChangeText={setStakeAmount}
                            placeholder="Enter amount"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            handleStartForge();
                        }}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#B8860B'] as const}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>BEGIN FORGING</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.guideContainer}>
                        <Text style={styles.guideTitle}>FORGE GUIDELINES</Text>
                        <View style={styles.guideItem}>
                            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                            <Text style={styles.guideText}>100+ for RARE Crystals</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <View style={[styles.dot, { backgroundColor: '#A855F7' }]} />
                            <Text style={styles.guideText}>250+ for EPIC Crystals</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                            <Text style={styles.guideText}>500+ for LEGENDARY Crystals</Text>
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A', padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
    loadingText: { color: '#FFD700', marginTop: 15, fontSize: 16, fontWeight: '600' },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 30 },
    backButton: { padding: 10, backgroundColor: '#1A1A1A', borderRadius: 12 },
    title: { fontSize: 26, color: '#FFF', fontWeight: 'bold', marginLeft: 15, letterSpacing: 0.5 },
    content: { gap: 20 },
    crystalCard: { borderRadius: 24, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    rarityBadge: { marginBottom: 20 },
    badgeGradient: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
    badgeText: { color: '#000', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    crystalWrapper: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 25, elevation: 15 },
    crystalImage: { width: '100%', height: '100%' },
    crystalOrbit: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
    crystalEmoji: { fontSize: 50 },
    stageTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
    progressContainer: { width: '100%', marginTop: 20, alignItems: 'center' },
    progressBg: { width: '100%', height: 12, backgroundColor: '#222', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%' },
    progressText: { color: '#666', fontSize: 13, marginTop: 8, fontWeight: '500' },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: 15, borderRadius: 16, marginTop: 30, gap: 10 },
    infoText: { color: '#FBBF24', fontSize: 13, flex: 1, lineHeight: 18 },
    statsCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
    statValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    statsDivider: { width: 1, height: 30, backgroundColor: '#333' },
    startSection: { marginTop: 10, gap: 30 },
    subtitle: { color: '#999', fontSize: 16, textAlign: 'center', lineHeight: 24 },
    inputContainer: { gap: 10 },
    inputLabel: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
    input: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 18, color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', borderWidth: 1, borderColor: '#333' },
    actionButton: { width: '100%', height: 60, borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    guideContainer: { backgroundColor: '#111', borderRadius: 24, padding: 25, borderStyle: 'dashed', borderWidth: 1, borderColor: '#444' },
    guideTitle: { color: '#555', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
    guideItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 12 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    guideText: { color: '#AAA', fontSize: 14, fontWeight: '500' }
});
