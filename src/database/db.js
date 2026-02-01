import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getDBConnection = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync('walletx.db');
  return dbInstance;
};

export const initDB = async () => {
  const db = await getDBConnection();
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      accountId INTEGER,
      FOREIGN KEY(accountId) REFERENCES accounts(id)
    );
  `);
};
