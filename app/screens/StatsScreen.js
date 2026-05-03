import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import colors from '../../constants/colors';
import { getProfile, getExpenses, getCategories } from '../../services/storage';
import { getCachedInsight } from '../../services/aiRateLimiter';

const StatsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [trendNote, setTrendNote] = useState('');
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, currentMonth]);

  const loadData = async () => {
    try {
      const prof = await getProfile();
      const exps = await getExpenses();
      const cats = await getCategories();

      setProfile(prof);
      setExpenses(exps);
      setCategories(cats);

      if (prof) {
        generateTrendNote(prof, exps, cats);
      }
    } catch (error) {
      console.error('loadData error:', error);
    }
  };

  const generateTrendNote = async (prof, exps, cats) => {
    setTrendLoading(true);
    try {
      const monthExpenses = exps.filter(e => e.month === currentMonth);
      const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      const categoryData = cats.map(cat => {
        const spent = monthExpenses
          .filter(e => e.categoryId === cat.id)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          name: cat.name,
          spent,
        };
      });

      const data = {
        name: prof.name || 'Friend',
        month: currentMonth,
        totalBudget: prof.spendingBudget || 0,
        totalSpent,
        categories: categoryData,
      };

      // Load from cache only (no generation)
      const note = await getCachedInsight(data);
      setTrendNote(note || '');
      setTrendLoading(false);
    } catch (error) {
      console.error('generateTrendNote error:', error);
      setTrendNote('');
      setTrendLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };

  const goToNextMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };

  const getMonthStats = () => {
    const monthExpenses = expenses.filter(e => e.month === currentMonth);
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = profile?.spendingBudget || 0;
    const totalAmount = profile?.totalAmount || 0;
    const saved = Math.max(totalBudget - totalSpent, 0);
    const totalLeft = Math.max(totalAmount - totalSpent, 0);

    return {
      income: profile?.monthlyIncome || 0,
      budget: totalBudget, 
      spent: totalSpent,
      saved,
      total: totalLeft || 0
    };
  };

  const getCategoryStatus = (cat) => {
    const monthExpenses = expenses.filter(
      e => e.categoryId === cat.id && e.month === currentMonth
    );
    const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { spent };
  };

  
  const stats = getMonthStats();

  const renderCategoryRow = ({ item }) => {
    const { spent} = getCategoryStatus(item);
    
    return (
      <View style={styles.categoryRow}>
        <View style={styles.categoryLeft}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryStats}>
              {profile?.currency || 'Rs'} {spent.toFixed(0)} / {profile?.currency || 'Rs'}{' '}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Text style={styles.navBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={styles.navBtn}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid2x2}>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Total balance</Text>
            <Text style={styles.gridValue}>
              {profile?.currency || 'Rs'} {stats.total.toFixed(0)}
            </Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Budget</Text>
            <Text style={styles.gridValue}>
              {profile?.currency || 'Rs'} {stats.budget.toFixed(0)}
            </Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Spent</Text>
            <Text style={styles.gridValue}>
              {profile?.currency || 'Rs'} {stats.spent.toFixed(0)}
            </Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Budget remaining</Text>
            <Text style={styles.gridValue}>
              {profile?.currency || 'Rs'} {stats.saved.toFixed(0)}
            </Text>
          </View>
        </View>

        <Text style={styles.categoryTitle}>Category breakdown:</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryRow}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <View style={styles.trendBox}>
          <Text style={styles.trendLabel}>this month</Text>
          {trendLoading ? (
            <Text style={styles.trendText}>generating insight...</Text>
          ) : (
            <Text style={styles.trendText}>{trendNote || 'No insight yet'}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryRow: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryStats: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  trendBox: {
    backgroundColor: colors.insightBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  trendText: {
    fontSize: 13,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default StatsScreen;
