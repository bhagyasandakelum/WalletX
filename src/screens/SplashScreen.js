import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
    const insets = useSafeAreaInsets();
    const titleText = "WalletX";

    // Animations
    const animatedValues = useRef(
        titleText.split('').map(() => new Animated.Value(0))
    ).current;

    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const textAnimations = titleText.split('').map((_, i) => {
            return Animated.spring(animatedValues[i], {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            });
        });

        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                // bouncy spring effect
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.stagger(100, textAnimations)
        ]).start();
    }, []);

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#00d09c']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.centerContainer}>
                {/* Animated Logo Container with Glow effect */}
                <View style={styles.glowContainer}>
                    <Animated.Image
                        source={require('../../assets/icon.png')}
                        style={[
                            styles.logo,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }]
                            }
                        ]}
                    />
                </View>

                {/* Animated Text */}
                <View style={styles.textRow}>
                    {titleText.split('').map((char, index) => (
                        <Animated.Text
                            key={index}
                            style={[
                                styles.title,
                                {
                                    opacity: animatedValues[index],
                                    transform: [
                                        {
                                            translateY: animatedValues[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0],
                                            }),
                                        },
                                        {
                                            scale: animatedValues[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.5, 1],
                                            })
                                        }
                                    ],
                                },
                            ]}
                        >
                            {char}
                        </Animated.Text>
                    ))}
                </View>
                <Text style={styles.subtitle}>Your Premium Finance Manager</Text>
            </View>

            {/* Footer Text - Positioned safely above the bottom */}
            <View style={[styles.bottomContainer, { bottom: insets.bottom + 40 }]}>
                <Text style={styles.footerText}>Designed for the Future</Text>
                <Text style={styles.footerBrand}>by zeroaxill</Text>
            </View>
            <StatusBar style="light" />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowContainer: {
        shadowColor: '#00d09c',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 10,
        marginBottom: 40,
    },
    logo: {
        width: 140,
        height: 140,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 64,
        fontWeight: '900',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 208, 156, 0.8)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 20,
        marginHorizontal: 2,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#a1a1aa',
        marginTop: 10,
        fontWeight: '500',
        letterSpacing: 1.5,
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#cbd5e1',
        letterSpacing: 1,
        opacity: 0.8,
    },
    footerBrand: {
        fontSize: 12,
        color: '#00d09c',
        marginTop: 4,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    }
});

export default SplashScreen;
