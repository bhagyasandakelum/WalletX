import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AppButton({ title, onPress, color = ['#00D09C', '#00dfa8'], style }) {
    return (
        <Pressable onPress={onPress} style={[styles.wrapper, style]}>
            <LinearGradient
                colors={color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.container}
            >
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#00D09C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    container: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
