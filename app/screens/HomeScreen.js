import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import colors from '../../constants/colors';
import InsightPanel from '../../components/InsightPanel';
import { getProfile, getExpenses, getCategories, getSnapshots } from '../../services/storage';
import { getCachedInsight, getAIUsageReport } from '../../services/aiRateLimiter';

const HomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(null);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const prof = await getProfile();
      const exps = await getExpenses();
      const cats = await getCategories();
      const snaps = await getSnapshots();

      setProfile(prof);
      setExpenses(exps);
      setCategories(cats);
      setSnapshots(snaps);

      if (prof) {
        loadCachedInsight(prof, exps, cats);
      }
    } catch (error) {
      console.error('loadData error:', error);
    }
  };

  const loadCachedInsight = async (prof, exps, cats) => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const thisMonthExpenses = exps.filter(e => e.month === currentMonth);
      const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

      const categoryData = cats.map(cat => {
        const spent = thisMonthExpenses
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

      // Load from cache, don't generate
      const cachedInsight = await getCachedInsight(data);
      setInsight(cachedInsight);
      setInsightError(null);
      setInsightLoading(false);
    } catch (error) {
      console.error('loadCachedInsight error:', error);
      setInsightError('Failed to load insight');
    }
  };

  const handleRetryInsight = async () => {
    // This would need the generateInsight function passed from parent or context
    Alert.alert('Retry Insight', 'Generate a new insight? (uses daily quota)', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Generate',
        onPress: async () => {
          setInsightLoading(true);
          const report = await getAIUsageReport();
          if (report.remaining === 0) {
            setInsightError('Daily AI limit reached (10/day). Try again tomorrow!');
            setInsightLoading(false);
            return;
          }
          // Will be triggered from AddExpenseModal instead
          setInsightError(null);
        },
      },
    ]);
  };

  const getCurrentMonthSpent = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return expenses
      .filter(e => e.month === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getLastMonthSnapshot = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      .toISOString()
      .substring(0, 7);
    return snapshots.find(s => s.month === lastMonth);
  };

  const currentSpent = getCurrentMonthSpent();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const leftToSpend = Math.max((profile?.spendingBudget || 0) - currentSpent, 0);
  const leftFromTotal = Math.max((profile?.totalAmount || 0) - currentSpent, 0);
  const percentRemaining = profile?.spendingBudget ? (leftToSpend / profile.spendingBudget) * 100 : 100;

  const getStatusColor = () => {
    if (percentRemaining > 30) return colors.under;
    if (percentRemaining > 10) return colors.warning;
    return colors.over;
  };

  const lastMonthSnapshot = getLastMonthSnapshot();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {insightError ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>[WARNING] {insightError}</Text>
            <TouchableOpacity 
              style={styles.retryBtn}
              onPress={handleRetryInsight}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <InsightPanel
            insight={insight}
            loading={insightLoading}
            onDismiss={() => setInsight(null)}
          />
        )}

        <Text style={styles.greeting}>
          Hi, {profile?.name || 'friend'} 
        </Text>
        <Text style={styles.monthText}>{currentMonth}</Text>

        <View style={[styles.leftCard, { backgroundColor: colors.under }]}>
          <Text style={styles.leftLabel}>Total amount</Text>
          <Text style={styles.leftAmount}>
            {profile?.currency || 'Rs'} {leftFromTotal.toFixed(0)}
          </Text>
        </View>

        <View style={[styles.leftCard, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.leftLabel}>Left from budget</Text>
          <Text style={styles.leftAmount}>
            {profile?.currency || 'Rs'} {leftToSpend.toFixed(0)}
          </Text>
        </View>

        <View style={styles.statsRow}>
        
         <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>
              {profile?.currency || 'Rs'} {(profile?.totalAmount || 0).toFixed(0)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={styles.statValue}>
              {profile?.currency || 'Rs'} {(profile?.spendingBudget || 0).toFixed(0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>
              {profile?.currency || 'Rs'} {currentSpent.toFixed(0)}
            </Text>
          </View>
          

           <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Income</Text>
            <Text style={styles.statValue}>
              {profile?.currency || 'Rs'} {(profile?.monthlyIncome || 0).toFixed(0)}
            </Text>
          </View>
        </View>

        {lastMonthSnapshot && (
          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotText}>
              In {lastMonthSnapshot.month} you saved {profile?.currency || 'Rs'}{' '}
              {lastMonthSnapshot.saved.toFixed(0)} 
            </Text>
          </View>
        )}
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
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  monthText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 16,
  },
  leftCard: {
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftLabel: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  },
  leftAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  snapshotCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  snapshotText: {
    fontSize: 13,
    color: colors.text,
    fontStyle: 'italic',
  },
  errorPanel: {
    backgroundColor: colors.over,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.surface,
    marginBottom: 8,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.over,
  },
});

export default HomeScreen;
