import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { searchUsers, sendFriendRequest, getFriends, linkStreak } from '../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function SocialScreen({ navigation }: any) {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        if (!user) return;
        try {
            const data = await getFriends(user.uid);
            setFriends(data);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || !user) return;
        setSearching(true);
        try {
            const results = await searchUsers(searchQuery, user.uid);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddFriend = async (friendUid: string) => {
        if (!user) return;
        try {
            await sendFriendRequest(user.uid, friendUid);
            Alert.alert('Request Sent!', 'Your friend request is on its way.');
            setSearchResults([]);
            setSearchQuery('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send request');
        }
    };

    const handleLinkStreak = async (friendUid: string) => {
        if (!user) return;
        try {
            await linkStreak(user.uid, friendUid);
            Alert.alert('🔥 Synergy Activated!', 'Your streaks are linked for today. Both complete your tasks to win +50% coins!');
            loadFriends();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to link streak');
        }
    };

    const renderFriend = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.username}</Text>
                <Text style={styles.streakText}>🔥 {item.current_streak} Day Streak</Text>
            </View>
            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleLinkStreak(item.firebase_uid)}
            >
                <Text style={styles.linkText}>Link up</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearch = ({ item }: any) => (
        <View style={styles.card}>
            <Text style={styles.friendName}>{item.username}</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddFriend(item.firebase_uid)}
            >
                <Ionicons name="person-add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Social synergy 🤝</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchBox}>
                <TextInput
                    style={styles.input}
                    placeholder="Search by username or email..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Search Results</Text>
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearch}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Friends</Text>
                {loading ? (
                    <ActivityIndicator color="#FFD700" />
                ) : (
                    <FlatList
                        data={friends.filter(f => f.status === 'accepted' || f.status === 'pending')}
                        renderItem={renderFriend}
                        keyExtractor={(item) => item.friendship_id}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No friends yet. Search above to find your squad!</Text>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333'
    },
    input: {
        flex: 1,
        height: 50,
        color: '#FFFFFF'
    },
    searchButton: {
        padding: 5
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        marginRight: 10,
        minWidth: 150
    },
    friendInfo: {
        flex: 1
    },
    friendName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    streakText: {
        color: '#FFD700',
        fontSize: 12,
        marginTop: 4
    },
    linkButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10
    },
    linkText: {
        color: '#121212',
        fontWeight: 'bold',
        fontSize: 12
    },
    addButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 50
    }
});
