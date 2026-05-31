import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';

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
                <View style={styles.logoContainer}>
                    <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M20 6H4C2.89543 6 2 6.89543 2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6Z"
                            stroke="#00D09C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d="M2 11H22"
                            stroke="#00D09C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d="M16 11H21C21.5523 11 22 11.4477 22 12V14C22 14.5523 21.5523 15 21 15H16C15.4477 15 15 14.5523 15 14V12C15 11.4477 15.4477 11 16 11Z"
                            stroke="#00D09C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d="M18.5 13H18.51"
                            stroke="#00D09C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </View>
            </Animated.View>

            {/* Footer */}
            <View style={[styles.bottomContainer, { bottom: insets.bottom + 40 }]}>
                <Text style={styles.versionText}>V1.2.0</Text>
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
    logoContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
