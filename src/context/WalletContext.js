import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAccounts, getExpensesByAccount, getSetting, setSetting } from '../services/expenseService';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [weeklyBudget, setWeeklyBudget] = useState(null);

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
        const budget = await getSetting('weeklyBudget');
        setWeeklyBudget(budget ? Number(budget) : null);
    };

    const updateWeeklyBudget = async (amount) => {
        await setSetting('weeklyBudget', amount.toString());
        setWeeklyBudget(Number(amount));
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
        setSelectedAccount,
        setIsDarkMode,
        updateWeeklyBudget,
        reloadData,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
