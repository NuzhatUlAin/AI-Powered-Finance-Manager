import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: 'petals_profile',
  CATEGORIES: 'petals_categories',
  EXPENSES: 'petals_expenses',
  SNAPSHOTS: 'petals_snapshots',
};

// Profile
export const getProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('getProfile error:', error);
    return null;
  }
};

export const saveProfile = async (data) => {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(data));
    console.log('Profile saved:', data);
  } catch (error) {
    console.error('saveProfile error:', error);
  }
};

// Categories
export const getCategories = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
};

export const saveCategories = async (data) => {
  try {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(data));
    console.log('Categories saved:', data);
  } catch (error) {
    console.error('saveCategories error:', error);
  }
};

export const addCategory = async (category) => {
  try {
    const categories = await getCategories();
    categories.push(category);
    await saveCategories(categories);
    console.log('Category added:', category);
    return category;
  } catch (error) {
    console.error('addCategory error:', error);
  }
};

export const deleteCategory = async (id) => {
  try {
    const categories = await getCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    await saveCategories(filtered);
    console.log('Category deleted:', id);
  } catch (error) {
    console.error('deleteCategory error:', error);
  }
};

// Expenses
export const getExpenses = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getExpenses error:', error);
    return [];
  }
};

export const saveExpenses = async (data) => {
  try {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(data));
    console.log('Expenses saved:', data);
  } catch (error) {
    console.error('saveExpenses error:', error);
  }
};

export const addExpense = async (expense) => {
  try {
    const expenses = await getExpenses();
    expenses.push(expense);
    await saveExpenses(expenses);
    console.log('Expense added:', expense);
    return expense;
  } catch (error) {
    console.error('addExpense error:', error);
  }
};

export const deleteExpense = async (id) => {
  try {
    const expenses = await getExpenses();
    const filtered = expenses.filter(exp => exp.id !== id);
    await saveExpenses(filtered);
    console.log('Expense deleted:', id);
  } catch (error) {
    console.error('deleteExpense error:', error);
  }
};

// Snapshots
export const getSnapshots = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SNAPSHOTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getSnapshots error:', error);
    return [];
  }
};

export const saveSnapshots = async (data) => {
  try {
    await AsyncStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(data));
    console.log('Snapshots saved:', data);
  } catch (error) {
    console.error('saveSnapshots error:', error);
  }
};
