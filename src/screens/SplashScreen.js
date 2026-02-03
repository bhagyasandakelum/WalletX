import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SplashScreen = () => {
    const titleText = "WalletX";
    // Create an array of animated values, one for each character
    const animatedValues = useRef(
        titleText.split('').map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const animations = titleText.split('').map((_, i) => {
            return Animated.timing(animatedValues[i], {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            });
        });

        // Stagger the animations by 150ms per letter
        Animated.stagger(150, animations).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.centerContainer}>
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
                                                outputRange: [20, 0], // Slide up slightly
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
            <View style={styles.bottomContainer}>
                <Text style={styles.footerText}>develop by zeroaxill</Text>
            </View>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        fontStyle: 'italic', // Italic as requested
        color: '#00D09C',
        textShadowColor: 'rgba(0, 208, 156, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        marginHorizontal: 1,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#888',
        letterSpacing: 1,
        fontStyle: 'italic',
    },
});

export default SplashScreen;
