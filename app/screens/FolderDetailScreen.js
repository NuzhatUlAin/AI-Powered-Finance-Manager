import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import colors from '../../constants/colors';
import { getExpenses, deleteExpense, getProfile, getCategories } from '../../services/storage';
import { generateInsight } from '../../services/groq';
import AddExpenseModal from '../../components/AddExpenseModal';

const FolderDetailScreen = ({ route, navigation }) => {
  const { folder } = route.params || {};
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!folder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Collection not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    loadExpenses();
    const unsubscribe = navigation.addListener('focus', () => {
      loadExpenses();
    });
    return unsubscribe;
  }, [navigation]);

  const loadExpenses = async () => {
    try {
      const allExpenses = await getExpenses();
      const currentMonth = new Date().toISOString().substring(0, 7);
      const filtered = allExpenses.filter(
        exp => exp.categoryId === folder.id && exp.month === currentMonth
      );
      setExpenses(filtered);
    } catch (error) {
      console.error('loadExpenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      'Remove treat?',
      'This will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(expenseId);
            loadExpenses();
          },
        },
      ]
    );
  };

  const handleAddExpense = async (newExpense) => {
    try {
      const { addExpense } = await import('../../services/storage');
      await addExpense(newExpense);
      
      // Generate fresh insight after entry added
      const profile = await getProfile();
      const allExpenses = await getExpenses();
      const allCategories = await getCategories();
      
      if (profile) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const thisMonthExpenses = allExpenses.filter(e => e.month === currentMonth);
        const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        const categoryData = allCategories.map(cat => {
          const spent = thisMonthExpenses
            .filter(e => e.categoryId === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
          return {
            name: cat.name,
            spent,
          };
        });

        const data = {
          name: profile.name || 'Friend',
          month: currentMonth,
          totalBudget: profile.spendingBudget || 0,
          totalSpent,
          categories: categoryData,
        };

        // Generate insight (will use cache or API based on rate limit)
        await generateInsight(data);
        console.log('[INFO] Insight generated after entry added');
      }
      
      setModalVisible(false);
      loadExpenses();
    } catch (error) {
      console.error('handleAddExpense error:', error);
      setModalVisible(false);
      loadExpenses();
    }
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseRow}
      onLongPress={() => handleDeleteExpense(item.id)}
    >
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseName}>{item.name}</Text>
        {item.notes && <Text style={styles.expenseNotes}>{item.notes}</Text>}
        <Text style={styles.expenseDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>Rs {item.amount.toFixed(0)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← </Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.folderName}>{folder.name}</Text>
          <Text style={styles.folderSpend}>
            Rs {totalSpent.toFixed(0)} spent
          </Text>
        </View>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No items yet. Add your first expense</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={item => item.id}
          scrollEnabled
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddExpense}
        categoryId={folder.id}
        categoryName={folder.name}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  folderSpend: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  expenseLeft: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  expenseNotes: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default FolderDetailScreen;
