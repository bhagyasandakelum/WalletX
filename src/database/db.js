// src/database/db.js
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabase('walletx.db');

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          balance REAL NOT NULL
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          accountId INTEGER NOT NULL,
          category TEXT NOT NULL,
          FOREIGN KEY (accountId) REFERENCES accounts(id)
        );`
      );
    },
    reject,
    resolve);
  });
};
