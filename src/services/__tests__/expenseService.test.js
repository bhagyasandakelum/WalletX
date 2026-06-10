import {
  getAccounts,
  addAccount,
  deleteAccount,
  updateAccount,
  addExpense,
  deleteExpense,
  updateExpense,
  getExpensesByAccount,
  getAllExpenses,
  resetAllData,
  getSetting,
  setSetting,
} from '../expenseService';

describe('expenseService', () => {
  beforeEach(() => {
    global.resetMockDB();
  });

  test('should add and retrieve accounts', async () => {
    const accountId1 = await addAccount('Main Bank', 15000);
    const accountId2 = await addAccount('Cash Wallet', 2500);

    expect(accountId1).toBe(1);
    expect(accountId2).toBe(2);

    const accounts = await getAccounts();
    expect(accounts).toHaveLength(2);
    expect(accounts[0]).toEqual({ id: 1, name: 'Main Bank', balance: 15000 });
    expect(accounts[1]).toEqual({ id: 2, name: 'Cash Wallet', balance: 2500 });
  });

  test('should update account details', async () => {
    const id = await addAccount('Savings', 10000);
    await updateAccount(id, 'Savings Updated', 12000);

    const accounts = await getAccounts();
    expect(accounts[0]).toEqual({ id, name: 'Savings Updated', balance: 12000 });
  });

  test('should delete account and its associated expenses', async () => {
    const accId = await addAccount('Checking', 5000);
    await addExpense('Groceries', 500, 'Food', accId);

    let accounts = await getAccounts();
    let expenses = await getAllExpenses();
    expect(accounts).toHaveLength(1);
    expect(expenses).toHaveLength(1);

    await deleteAccount(accId);

    accounts = await getAccounts();
    expenses = await getAllExpenses();
    expect(accounts).toHaveLength(0);
    expect(expenses).toHaveLength(0);
  });

  test('should add expense and decrease account balance', async () => {
    const accId = await addAccount('Bank', 1000);
    await addExpense('Dinner', 150, 'Food', accId);

    const expenses = await getExpensesByAccount(accId);
    expect(expenses).toHaveLength(1);
    expect(expenses[0].title).toBe('Dinner');
    expect(expenses[0].amount).toBe(150);
    expect(expenses[0].category).toBe('Food');
    expect(expenses[0].accountId).toBe(accId);
    expect(expenses[0].date).toBeDefined();

    const accounts = await getAccounts();
    expect(accounts[0].balance).toBe(850);
  });

  test('should delete expense and refund account balance', async () => {
    const accId = await addAccount('Cash', 1000);
    await addExpense('Cinema', 200, 'Entertainment', accId);

    let accounts = await getAccounts();
    expect(accounts[0].balance).toBe(800);

    const expenses = await getAllExpenses();
    expect(expenses).toHaveLength(1);
    const expenseId = expenses[0].id;

    await deleteExpense(expenseId);

    accounts = await getAccounts();
    expect(accounts[0].balance).toBe(1000);

    const remainingExpenses = await getAllExpenses();
    expect(remainingExpenses).toHaveLength(0);
  });

  test('should reset all accounts and expenses', async () => {
    const accId = await addAccount('Account 1', 100);
    await addExpense('Exp 1', 10, 'Others', accId);

    await resetAllData();

    const accounts = await getAccounts();
    const expenses = await getAllExpenses();
    expect(accounts).toHaveLength(0);
    expect(expenses).toHaveLength(0);
  });

  test('should get and set settings', async () => {
    let budget = await getSetting('weeklyBudget');
    expect(budget).toBeNull();

    await setSetting('weeklyBudget', '5000');
    budget = await getSetting('weeklyBudget');
    expect(budget).toBe('5000');
  });

  test('should update expense and adjust account balance', async () => {
    const accId = await addAccount('Card', 2000);
    await addExpense('Lunch', 200, 'Food', accId);

    let accounts = await getAccounts();
    expect(accounts[0].balance).toBe(1800);

    let expenses = await getAllExpenses();
    expect(expenses).toHaveLength(1);
    const expenseId = expenses[0].id;

    // Update expense with larger amount (from 200 to 350)
    await updateExpense(expenseId, 'Lunch & Drinks', 350, 'Food');

    accounts = await getAccounts();
    expect(accounts[0].balance).toBe(1650); // 2000 - 350

    expenses = await getAllExpenses();
    expect(expenses[0].title).toBe('Lunch & Drinks');
    expect(expenses[0].amount).toBe(350);

    // Update expense with smaller amount (from 350 to 100)
    await updateExpense(expenseId, 'Snack', 100, 'Others');

    accounts = await getAccounts();
    expect(accounts[0].balance).toBe(1900); // 2000 - 100

    expenses = await getAllExpenses();
    expect(expenses[0].title).toBe('Snack');
    expect(expenses[0].amount).toBe(100);
    expect(expenses[0].category).toBe('Others');
  });
});
