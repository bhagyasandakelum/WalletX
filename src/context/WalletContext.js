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

            const loadedNotifications = await getSetting('notifications');
            if (loadedNotifications) {
                setNotifications(JSON.parse(loadedNotifications));
            } else {
                const initial = generateFinancialInsights([], budget ? Number(budget) : null);
                setNotifications(initial);
                await setSetting('notifications', JSON.stringify(initial));
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

            setNotifications(generated);
            await setSetting('notifications', JSON.stringify(generated));

            const alertNotification = generated.find(n => !n.read) || generated[0];
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
