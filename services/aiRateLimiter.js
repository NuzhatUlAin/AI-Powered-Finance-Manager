import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AI_USAGE: 'petals_ai_usage',
  AI_CACHE: 'petals_ai_cache',
};

const DAILY_LIMIT = 40;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get today's date as YYYY-MM-DD
 */
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Generate cache key from data hash
 */
const generateCacheKey = (data) => {
  return `${data.month}_${data.totalBudget}_${data.totalSpent}`;
};

/**
 * Get today's AI call count
 */
export const getTodayAICallCount = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.AI_USAGE);
    if (!data) return { date: getTodayDate(), count: 0, calls: [] };

    const usage = JSON.parse(data);
    const today = getTodayDate();

    if (usage.date !== today) {
      // Reset for new day
      return { date: today, count: 0, calls: [] };
    }

    return usage;
  } catch (error) {
    console.error('getTodayAICallCount error:', error);
    return { date: getTodayDate(), count: 0, calls: [] };
  }
};

/**
 * Check if AI call is allowed (within daily limit)
 */
export const canMakeAICall = async () => {
  try {
    const usage = await getTodayAICallCount();
    const allowed = usage.count < DAILY_LIMIT;

    if (!allowed) {
      console.warn(`[WARNING] AI Daily limit reached (${DAILY_LIMIT}/day)`);
    }

    return allowed;
  } catch (error) {
    console.error('canMakeAICall error:', error);
    return false;
  }
};

/**
 * Record an AI call
 */
export const recordAICall = async (data, success = true) => {
  try {
    const usage = await getTodayAICallCount();
    const today = getTodayDate();

    if (usage.date !== today) {
      usage.date = today;
      usage.count = 0;
      usage.calls = [];
    }

    usage.count += 1;
    usage.calls.push({
      timestamp: new Date().toISOString(),
      success,
      month: data?.month || 'unknown',
      retries: data?.retries || 0,
    });

    await AsyncStorage.setItem(KEYS.AI_USAGE, JSON.stringify(usage));
    console.log(`[INFO] AI Call recorded (${usage.count}/${DAILY_LIMIT})`);
  } catch (error) {
    console.error('recordAICall error:', error);
  }
};

/**
 * Get cached insight
 */
export const getCachedInsight = async (data) => {
  try {
    const cacheKey = generateCacheKey(data);
    const cacheData = await AsyncStorage.getItem(KEYS.AI_CACHE);

    if (!cacheData) return null;

    const cache = JSON.parse(cacheData);
    const cached = cache[cacheKey];

    if (!cached) return null;

    // Check if cache is still valid (within 24 hours)
    const ageInMs = Date.now() - cached.timestamp;
    if (ageInMs > CACHE_DURATION) {
      // Remove expired cache
      delete cache[cacheKey];
      await AsyncStorage.setItem(KEYS.AI_CACHE, JSON.stringify(cache));
      return null;
    }

    console.log('[INFO] Using cached AI insight');
    return cached.insight;
  } catch (error) {
    console.error('getCachedInsight error:', error);
    return null;
  }
};

/**
 * Save insight to cache
 */
export const cacheInsight = async (data, insight) => {
  try {
    const cacheKey = generateCacheKey(data);
    const cacheData = await AsyncStorage.getItem(KEYS.AI_CACHE);

    let cache = cacheData ? JSON.parse(cacheData) : {};

    cache[cacheKey] = {
      insight,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(KEYS.AI_CACHE, JSON.stringify(cache));
    console.log('[INFO] Insight cached');
  } catch (error) {
    console.error('cacheInsight error:', error);
  }
};

/**
 * Get AI usage report for today
 */
export const getAIUsageReport = async () => {
  try {
    const usage = await getTodayAICallCount();
    const successful = usage.calls.filter(c => c.success).length;
    const failed = usage.calls.filter(c => !c.success).length;

    return {
      date: usage.date,
      totalCalls: usage.count,
      dailyLimit: DAILY_LIMIT,
      remaining: Math.max(DAILY_LIMIT - usage.count, 0),
      successful,
      failed,
      calls: usage.calls,
    };
  } catch (error) {
    console.error('getAIUsageReport error:', error);
    return null;
  }
};

/**
 * Reset usage for testing
 */
export const resetAIUsage = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.AI_USAGE);
    console.log('[INFO] AI usage reset');
  } catch (error) {
    console.error('resetAIUsage error:', error);
  }
};
