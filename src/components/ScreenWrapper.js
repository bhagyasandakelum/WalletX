import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';

export default function ScreenWrapper({ children }) {
    const insets = useSafeAreaInsets();
    // Default to false if useWallet is not yet mounted (e.g., outside provider)
    const wallet = useWallet();
    const isDarkMode = wallet ? wallet.isDarkMode : false;

    const bgColors = isDarkMode ? ['#111827', '#1f2937'] : ['#fdfbfb', '#ebedee'];

    return (
        <LinearGradient
            colors={bgColors} // Dynamic background
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                {children}
            </View>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
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
