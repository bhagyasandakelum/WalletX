import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenWrapper({ children }) {
    const insets = useSafeAreaInsets();
    return (
        <LinearGradient
            colors={['#fdfbfb', '#ebedee']} // Soft gray gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                {children}
            </View>
            <StatusBar style="dark" />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    }
});
