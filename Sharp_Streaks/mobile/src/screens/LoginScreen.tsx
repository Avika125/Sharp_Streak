import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation is handled by RootNavigator automatically
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sharp Streaks</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title="Login" onPress={handleLogin} color="#FFD700" />

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 20 }}>
                <Text style={styles.link}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
    title: { fontSize: 32, color: '#FFD700', marginBottom: 40, fontWeight: 'bold' },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        paddingHorizontal: 15,
        color: '#FFF',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333'
    },
    link: { color: '#FFD700', fontSize: 16 }
});
