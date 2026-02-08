import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = () => {
    const insets = useSafeAreaInsets();
    const titleText = "WalletX";

    // Animations
    const animatedValues = useRef(
        titleText.split('').map(() => new Animated.Value(0))
    ).current;

    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const textAnimations = titleText.split('').map((_, i) => {
            return Animated.timing(animatedValues[i], {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            });
        });

        Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 1000,
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
        <View style={styles.container}>
            <View style={styles.centerContainer}>
                {/* Animated Logo */}
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
                                                outputRange: [20, 0],
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
            </View>

            {/* Footer Text - Positioned safely above the bottom */}
            <View style={[styles.bottomContainer, { bottom: insets.bottom + 80 }]}>
                <Text style={styles.footerText}>Developed by zeroaxill</Text>
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
        width: 120,
        height: 120,
        borderRadius: 24,
        marginBottom: 30,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#00D09C',
        textShadowColor: 'rgba(0, 208, 156, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        marginHorizontal: 1,
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#ffffff',
        letterSpacing: 1.2,
        fontStyle: 'italic',
        opacity: 0.8,
    },
});

export default SplashScreen;
