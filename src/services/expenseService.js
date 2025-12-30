// src/services/expenseService.js
import { db } from '../database/db';

/* ---------- ACCOUNTS ---------- */

export const getAccounts = () =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM accounts',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });

export const addAccount = (name, balance) =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO accounts (name, balance) VALUES (?, ?)',
        [name, balance],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });

export const deleteAccount = id =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM accounts WHERE id = ?', [id]);
      tx.executeSql('DELETE FROM expenses WHERE accountId = ?', [id]);
    },
    reject,
    resolve);
  });

export const updateAccountBalance = (id, balance) =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [balance, id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });

/* ---------- EXPENSES ---------- */

export const getExpensesByAccount = accountId =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE accountId = ? ORDER BY date DESC',
        [accountId],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });

export const addExpense = (title, amount, accountId) =>
  new Promise((resolve, reject) => {
    const date = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO expenses (title, amount, date, accountId) VALUES (?, ?, ?, ?)',
        [title, amount, date, accountId]
      );

      tx.executeSql(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [amount, accountId]
      );
    },
    reject,
    resolve);
  });
