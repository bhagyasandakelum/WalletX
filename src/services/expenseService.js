import { getDBConnection } from '../database/db';

/* ---------------- ACCOUNTS ---------------- */

export const getAccounts = async () => {
  const db = await getDBConnection();
  return await db.getAllAsync('SELECT * FROM accounts');
};

export const addAccount = async (name, balance) => {
  const db = await getDBConnection();
  const result = await db.runAsync(
    'INSERT INTO accounts (name, balance) VALUES (?, ?)',
    name,
    balance
  );
  return result.lastInsertRowId;
};

export const deleteAccount = async (id) => {
  const db = await getDBConnection();
  // Using execAsync for multiple statements in a transaction-like block isn't quite the same as transaction object,
  // but for simple deletes its often okay. Ideally use:
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM expenses WHERE accountId = ?', id);
    await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
  });
};

/* ---------------- EXPENSES ---------------- */

export const addExpense = async (title, amount, accountId) => {
  const db = await getDBConnection();
  const date = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO expenses (title, amount, date, accountId) VALUES (?, ?, ?, ?)',
      title,
      amount,
      date,
      accountId
    );

    await db.runAsync(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      amount,
      accountId
    );
  });
};

export const getExpensesByAccount = async (accountId) => {
  const db = await getDBConnection();
  return await db.getAllAsync(
    'SELECT * FROM expenses WHERE accountId = ? ORDER BY date DESC',
    accountId
  );
};

export const getAllExpenses = async () => {
  const db = await getDBConnection();
  return await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
};
