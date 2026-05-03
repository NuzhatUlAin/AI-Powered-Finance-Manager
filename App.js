import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { getProfile, saveProfile, getSnapshots, saveSnapshots } from './services/storage';
import { TabNavigator } from './navigation/TabNavigator';
import SettingsScreen from './app/screens/SettingsScreen';
import colors from './constants/colors';
import HomeScreen from './app/screens/HomeScreen';

const Stack = createStackNavigator();

const checkMonthlyIncrement = async () => {
  try {
    const profile = await getProfile();
    if (!profile) return;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const lastMonth = profile.appStartMonth;

    if (lastMonth !== currentMonth) {
      // Get current month stats and save snapshot
      const { getExpenses, getCategories } = await import('./services/storage');
      const expenses = await getExpenses();
      const categories = await getCategories();

      const lastMonthExpenses = expenses.filter(e => e.month === lastMonth);
      const totalSpent = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalBudget = profile.spendingBudget;
      const saved = Math.max(totalBudget - totalSpent, 0);

      const snapshots = await getSnapshots();
      snapshots.push({
        month: lastMonth,
        totalSpent,
        totalBudget,
        saved,
      });

      await saveSnapshots(snapshots);

      // Add monthly income to total amount on new month
      const newTotalAmount = profile.totalAmount + profile.monthlyIncome;

      // Update profile with new month
      const updatedProfile = {
        ...profile,
        totalAmount: newTotalAmount,
        appStartMonth: currentMonth,
      };

      await saveProfile(updatedProfile);
      console.log('New month: Added', profile.monthlyIncome, 'to total amount');
    }
  } catch (error) {
    console.error('checkMonthlyIncrement error:', error);
  }
};

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await checkMonthlyIncrement();
      const savedProfile = await getProfile();
      setProfile(savedProfile);
      setLoading(false);
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.text, fontSize: 16 }}>Loading app...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          {/* {profile ? ( */}
            <Stack.Screen name="MainApp" component={TabNavigator} />
          {/* ) : (
            <Stack.Screen
              name="Setup"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Setup Your Profile',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { color: colors.text, fontSize: 18 },
              }}
            />
          )} */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}