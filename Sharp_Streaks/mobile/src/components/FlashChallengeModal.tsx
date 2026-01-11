import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { submitFlashAttempt } from '../api/client';

interface FlashChallengeModalProps {
    visible: boolean;
    onClose: (result?: any) => void;
    session: any;
    userId: string;
}

export default function FlashChallengeModal({ visible, onClose, session, userId }: FlashChallengeModalProps) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [startTime] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [visible]);

    const handleTimeout = () => {
        Alert.alert('Time Up!', 'The 60 seconds are over. Better luck next time!', [{ text: 'OK', onPress: () => onClose() }]);
    };

    const handleSelectOption = async (index: number) => {
        if (submitting) return;
        setSubmitting(true);

        const timeTakenMs = Date.now() - startTime;
        try {
            const result = await submitFlashAttempt(userId, session.id, index, timeTakenMs);
            if (result.isCorrect) {
                Alert.alert('💰 SHARP!', `Correct! You earned ${result.points} coins!`, [{ text: 'Awesome', onPress: () => onClose(result) }]);
            } else {
                Alert.alert('❌ Not quite', 'That was the wrong answer. Keep growing!', [{ text: 'OK', onPress: () => onClose(result) }]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit answer');
            setSubmitting(false);
        }
    };

    if (!session) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.timerText}>⏳ {timeLeft}s</Text>
                        <Text style={styles.pointsText}>+{session.points} Coins</Text>
                    </View>

                    <Text style={styles.question}>{session.question}</Text>

                    <View style={styles.optionsContainer}>
                        {(typeof session.options === 'string' ? JSON.parse(session.options) : session.options).map((option: string, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.optionButton}
                                onPress={() => handleSelectOption(index)}
                                disabled={submitting}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={() => onClose()}>
                        <Text style={styles.closeText}>Give up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        borderWidth: 2,
        borderColor: '#FFD700'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    timerText: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold'
    },
    pointsText: {
        fontSize: 18,
        color: '#FFD700',
        fontWeight: 'bold'
    },
    question: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30
    },
    optionsContainer: {
        gap: 15
    },
    optionButton: {
        backgroundColor: '#333333',
        padding: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#444'
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center'
    },
    closeButton: {
        marginTop: 25,
        alignSelf: 'center'
    },
    closeText: {
        color: '#666',
        fontSize: 14
    }
});
