import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncUserToBackend } from '../api/client';

export default function SignupScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await syncUserToBackend(userCredential.user.uid, userCredential.user.email || '');
            // Navigation is handled by RootNavigator automatically
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join the Challenge</Text>

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

            <Button title="Sign Up" onPress={handleSignup} color="#FFD700" />

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
    title: { fontSize: 28, color: '#FFD700', marginBottom: 40, fontWeight: 'bold' },
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
