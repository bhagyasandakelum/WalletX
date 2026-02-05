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
  // Executing sequentially
  await db.runAsync('DELETE FROM expenses WHERE accountId = ?', id);
  await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
};

export const updateAccount = async (id, name, balance) => {
  const db = await getDBConnection();
  await db.runAsync(
    'UPDATE accounts SET name = ?, balance = ? WHERE id = ?',
    name,
    balance,
    id
  );
};

export const deleteExpense = async (id) => {
  const db = await getDBConnection();
  await db.withTransactionAsync(async () => {
    // Get expense details first
    const expense = await db.getFirstAsync('SELECT * FROM expenses WHERE id = ?', id);
    if (!expense) return;

    // Refund the balance
    await db.runAsync(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      expense.amount,
      expense.accountId
    );

    // Delete the expense
    await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  });
};

/* ---------------- EXPENSES ---------------- */

export const addExpense = async (title, amount, category, accountId) => {
  const db = await getDBConnection();
  const date = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO expenses (title, amount, date, category, accountId) VALUES (?, ?, ?, ?, ?)',
      title,
      amount,
      date,
      category,
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
