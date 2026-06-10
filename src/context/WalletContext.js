import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAccounts, getExpensesByAccount, getSetting, setSetting } from '../services/expenseService';
import { generateFinancialInsights, triggerSystemNotification } from '../services/insightService';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [weeklyBudget, setWeeklyBudget] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Load all accounts
    const loadAccounts = useCallback(async () => {
        try {
            const data = await getAccounts();
            setAccounts(data);

            // If we have accounts but none selected (or selected one was deleted), select the first one
            if (data.length > 0) {
                if (selectedAccount) {
                    const exists = data.find(a => a.id === selectedAccount.id);
                    if (exists) {
                        setSelectedAccount(exists); // Update reference to get new balance
                    } else {
                        setSelectedAccount(data[0]);
                    }
                } else {
                    setSelectedAccount(data[0]);
                }
            } else {
                setSelectedAccount(null);
            }
        } catch (error) {
            console.error('Context: Failed to load accounts', error);
        }
    }, [selectedAccount]);

    // Load expenses when selectedAccount changes
    const loadExpenses = useCallback(async () => {
        if (!selectedAccount) {
            setExpenses([]);
            return;
        }

        setLoading(true);
        try {
            const data = await getExpensesByAccount(selectedAccount.id);
            // Parse dates if stored as strings
            const parsed = data.map(e => ({
                ...e,
                date: new Date(e.date)
            }));
            setExpenses(parsed);
        } catch (error) {
            console.error('Context: Failed to load expenses', error);
        } finally {
            setLoading(false);
        }
    }, [selectedAccount]);

    const loadSettings = async () => {
        try {
            const budget = await getSetting('weeklyBudget');
            setWeeklyBudget(budget ? Number(budget) : null);

            const clearedStr = await getSetting('clearedNotificationIds');
            const clearedIds = clearedStr ? JSON.parse(clearedStr) : [];

            const loadedNotifications = await getSetting('notifications');
            if (loadedNotifications) {
                const parsed = JSON.parse(loadedNotifications);
                const filtered = parsed.filter(n => !clearedIds.includes(n.id));
                setNotifications(filtered);
            } else {
                const initial = generateFinancialInsights([], budget ? Number(budget) : null);
                const filtered = initial.filter(n => !clearedIds.includes(n.id));
                setNotifications(filtered);
                await setSetting('notifications', JSON.stringify(filtered));
            }
        } catch (error) {
            console.error('Context: Failed to load settings', error);
        }
    };

    const updateWeeklyBudget = async (amount) => {
        try {
            await setSetting('weeklyBudget', amount.toString());
            setWeeklyBudget(Number(amount));
        } catch (error) {
            console.error('Context: Failed to update weekly budget', error);
        }
    };

    const triggerInsightGeneration = async () => {
        try {
            const currentBudget = weeklyBudget;
            const generated = generateFinancialInsights(expenses, currentBudget);

            const clearedStr = await getSetting('clearedNotificationIds');
            const clearedIds = clearedStr ? JSON.parse(clearedStr) : [];

            const filtered = generated.filter(n => !clearedIds.includes(n.id));

            setNotifications(filtered);
            await setSetting('notifications', JSON.stringify(filtered));

            const alertNotification = filtered.find(n => !n.read) || filtered[0];
            if (alertNotification) {
                await triggerSystemNotification(
                    alertNotification.title,
                    alertNotification.description.split('\n')[0]
                );
            }
        } catch (error) {
            console.error('Context: Failed to generate insights', error);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            setNotifications(prev => {
                const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
                setSetting('notifications', JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            console.error('Context: Failed to mark notification as read', error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            const currentIds = notifications.map(n => n.id);
            const clearedStr = await getSetting('clearedNotificationIds');
            const clearedIds = clearedStr ? JSON.parse(clearedStr) : [];
            const updatedClearedIds = Array.from(new Set([...clearedIds, ...currentIds]));

            await setSetting('clearedNotificationIds', JSON.stringify(updatedClearedIds));

            setNotifications([]);
            await setSetting('notifications', JSON.stringify([]));
        } catch (error) {
            console.error('Context: Failed to clear notifications', error);
        }
    };

    // Trigger loadAccounts on mount
    useEffect(() => {
        loadAccounts();
        loadSettings();
    }, []);

    // Trigger loadExpenses when selectedAccount changes (or balance updates via loadAccounts which updates selectedAccount obj)
    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    // Automatically trigger insight generation when expenses or weekly budget changes
    useEffect(() => {
        if (selectedAccount) {
            triggerInsightGeneration();
        }
    }, [expenses, weeklyBudget]);

    // Exposed method to force refresh (e.g. after adding expense)
    const reloadData = async () => {
        await loadAccounts();
        await loadSettings();
        // loadExpenses will trigger automatically via useEffect when selectedAccount updates
    };

    const value = {
        accounts,
        selectedAccount,
        expenses,
        loading,
        isDarkMode,
        weeklyBudget,
        notifications,
        setSelectedAccount,
        setIsDarkMode,
        updateWeeklyBudget,
        reloadData,
        triggerInsightGeneration,
        markNotificationAsRead,
        clearAllNotifications,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
