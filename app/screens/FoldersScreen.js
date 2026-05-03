import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import colors from '../../constants/colors';
import { getCategories, getExpenses, addCategory, getProfile } from '../../services/storage';
import FolderCard from '../../components/FolderCard';
import AddFolderModal from '../../components/AddFolderModal';

const FoldersScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const cats = await getCategories();
      const exps = await getExpenses();
      setCategories(cats);
      setExpenses(exps);
    } catch (error) {
      console.error('loadData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpentForCategory = (categoryId) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return expenses
      .filter(exp => exp.categoryId === categoryId && exp.month === currentMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleAddFolder = async (folder) => {
    try {
      await addCategory(folder);
      
      // Generate fresh insight after category added
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

        // no insight generate on folder.Generate insight (will use cache or API based on rate limit)
        // await generateInsight(data);
        // console.log('[INFO] Insight generated after category created');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('handleAddFolder error:', error);
      setModalVisible(false);
      loadData();
    }
  };

  const handleFolderPress = (folder) => {
    navigation.navigate('FolderDetailScreen', { folder });
  };

  const renderFolder = ({ item }) => (
    <FolderCard
      folder={item}
      spent={getSpentForCategory(item.id)}
      onPress={() => handleFolderPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No categories yet. Add your first one</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderFolder}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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

      <AddFolderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddFolder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
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

export default FoldersScreen;
