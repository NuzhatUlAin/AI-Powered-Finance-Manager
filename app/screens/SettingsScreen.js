import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import colors from '../../constants/colors';
import { getProfile, saveProfile, getExpenses } from '../../services/storage';

const SettingsScreen = () => {
  const [profile, setProfile] = useState({
    name: '',
    monthlyIncome: 0,
    spendingBudget: 0,
    totalAmount: 0,
    currency: 'Rs',
    appStartMonth: new Date().toISOString().substring(0, 7),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  };

  const updateProfile = (field, value) => {
    let numValue = value;
    if (field !== 'name' && field !== 'currency') {
      numValue = parseFloat(value) || 0;
    }
    const updated = { ...profile, [field]: numValue };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Month?',
      'Remove all this months entries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const expenses = await getExpenses();
            const currentMonth = new Date().toISOString().substring(0, 7);
            const filtered = expenses.filter(exp => exp.month !== currentMonth);
            const { saveExpenses } = await import('../../services/storage');
            await saveExpenses(filtered);
            Alert.alert('Done!', 'This month has been cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Your Profile</Text>

      {/* Name Field */}
      <View style={styles.section}>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={colors.textLight}
          value={profile.name}
          onChangeText={(val) => updateProfile('name', val)}
        />
      </View>

      {/* Monthly Income */}
      <View style={styles.section}>
        <Text style={styles.label}>Monthly income</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter monthly income"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          value={profile.monthlyIncome.toString()}
          onChangeText={(val) => updateProfile('monthlyIncome', val)}
        />
      </View>

      {/* Spending Budget */}
      <View style={styles.section}>
        <Text style={styles.label}>Monthly spending budget</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter budget"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          value={profile.spendingBudget.toString()}
          onChangeText={(val) => updateProfile('spendingBudget', val)}
        />
      </View>

      {/* Total Amount Right Now */}
      <View style={styles.section}>
        <Text style={styles.label}>Total amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter total amount you have"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          value={profile.totalAmount?.toString()}
          onChangeText={(val) => updateProfile('totalAmount', val)}
        />
      </View>

      {/* Currency */}
      <View style={styles.section}>
        <Text style={styles.label}>Currency symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="Currency (e.g., Rs)"
          placeholderTextColor={colors.textLight}
          value={profile.currency}
          onChangeText={(val) => updateProfile('currency', val)}
          maxLength={3}
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetBtnText}>reset this month's entries</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  resetBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.over,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  spacer: {
    height: 40,
  },
});

export default SettingsScreen;
