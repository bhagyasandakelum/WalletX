import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

export default function ExpenseItem({ item, onDelete }) {
    const handleDelete = () => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) }
            ]
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <Text style={styles.icon}>💸</Text>
                </View>
                <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
            </View>
            <View style={styles.right}>
                <Text style={styles.amount}>-${item.amount.toFixed(2)}</Text>
                <Pressable hitSlop={10} onPress={handleDelete} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>✕</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    right: {
        alignItems: 'flex-end',
        gap: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
    deleteBtn: {
        padding: 4,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    deleteText: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: 'bold',
    },
});
