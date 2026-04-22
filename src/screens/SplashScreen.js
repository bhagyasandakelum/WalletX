import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = () => {
    const insets = useSafeAreaInsets();
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 1000,
                delay: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.centerContainer, { opacity: fadeAnim, transform: [{ translateY }] }]}>
                <Animated.Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>WalletX</Text>
            </Animated.View>

            {/* Footer */}
            <View style={[styles.bottomContainer, { bottom: insets.bottom + 40 }]}>
                <Text style={styles.versionText}>v1.0.1</Text>
                <Text style={styles.footerFromText}>from</Text>
                <Text style={styles.footerBrandText}>zeroaxill</Text>
            </View>
            <StatusBar style="light" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 2,
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#6b7280',
        letterSpacing: 2,
        marginBottom: 4,
    },
    footerFromText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    footerBrandText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 2,
    }
});

export default SplashScreen;
