import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getShopStatus, purchaseShopItem } from '../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function ShopScreen({ navigation }: any) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [shopData, setShopData] = useState<any>(null);
    const [buying, setBuying] = useState<string | null>(null);

    useEffect(() => {
        loadShop();
    }, []);

    const loadShop = async () => {
        try {
            const data = await getShopStatus();
            setShopData(data);
        } catch (error) {
            console.error('Failed to load shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: any) => {
        if (!user) return;

        Alert.alert(
            'Confirm Purchase',
            `Buy ${item.name} for ${item.price} coins?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Buy',
                    onPress: async () => {
                        setBuying(item.id);
                        try {
                            await purchaseShopItem(user.uid, item.id);
                            Alert.alert('✅ Success!', `Purchased ${item.name}! Check your inventory.`);
                            loadShop(); // Refresh balance/status
                        } catch (error: any) {
                            Alert.alert('Purchase Failed', error.response?.data?.error || 'Unknown error');
                        } finally {
                            setBuying(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.itemCard}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any || 'cube'} size={32} color="#A855F7" />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuy(item)}
                disabled={buying === item.id}
            >
                {buying === item.id ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.buyText}>{item.price} 💰</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#A855F7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Shadow Shop 👻</Text>
                <View style={{ width: 24 }} />
            </View>

            {shopData?.isOpen ? (
                <>
                    <View style={styles.statusBanner}>
                        <Text style={styles.statusText}>⚡ THE SHADOW IS HERE</Text>
                        <Text style={styles.timerText}>Closes soon...</Text>
                    </View>
                    <FlatList
                        data={shopData.items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                    />
                </>
            ) : (
                <View style={styles.closedContainer}>
                    <Ionicons name="moon" size={80} color="#333" />
                    <Text style={styles.closedTitle}>The Shop is Vanished</Text>
                    <Text style={styles.closedText}>Check back later. The shadow only appears at random hours.</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={loadShop}>
                        <Text style={styles.refreshText}>Check Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    statusBanner: {
        backgroundColor: '#A855F7',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center'
    },
    statusText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 16
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8
    },
    list: {
        paddingBottom: 20
    },
    itemCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333'
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#2A1B3D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    itemDesc: {
        color: '#888',
        fontSize: 12,
        marginTop: 4
    },
    buyButton: {
        backgroundColor: '#A855F7',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center'
    },
    buyText: {
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    closedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8
    },
    closedTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20
    },
    closedText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40
    },
    refreshButton: {
        marginTop: 30,
        padding: 15,
        borderWidth: 1,
        borderColor: '#A855F7',
        borderRadius: 10
    },
    refreshText: {
        color: '#A855F7',
        fontWeight: 'bold'
    }
});
