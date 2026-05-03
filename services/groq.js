import { canMakeAICall, recordAICall, getCachedInsight, cacheInsight } from './aiRateLimiter';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleep for a given duration
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate insight with rate limiting, caching, and retry logic
 */
export const generateInsight = async (data, retryCount = 0) => {
  if (!GROQ_API_KEY) {
    console.error('[ERROR] GROQ API key not found in environment');
    return null;
  }

  try {
    // Check cache first
    const cached = await getCachedInsight(data);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const canCall = await canMakeAICall();
    if (!canCall) {
      console.warn('[WARNING] Daily AI limit reached. Using placeholder.');
      await recordAICall(data, false);
      return null;
    }

    const { name, month, totalBudget, totalSpent, categories = [] } = data;

    // Format categories safely - handle both with and without limit field
    const categoryDetails = categories
      .filter(cat => cat && cat.spent > 0) // Only include categories with spending
      .map(cat => cat.limit 
        ? `${cat.name}: ${cat.spent}/${cat.limit}` 
        : `${cat.name}: ${cat.spent}`)
      .join(', ') || 'No category breakdown available';

    const userMessage = `
Hello! Here's my budget snapshot for ${month}:
Name: ${name}
Total budget set aside: PKR ${totalBudget}
Total spent: ${totalSpent}
Categories: ${categoryDetails}

Give me a warm, supportive one-liner about my spending.
    `.trim();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a financial assistant. Speak in second person. In 2 concise sentences: first, highlight your top spending categories (if given); second, warn softly if 60%+ of your budget is spent and state the remainder, or praise if under 40% is spent. No emojis. Use exact numbers.`,          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] Groq API error:', response.status, errorText);

      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        console.log(`[RETRY] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return generateInsight(data, retryCount + 1);
      }

      await recordAICall(data, false);
      return null;
    }

    const json = await response.json();
    const insight = json.choices?.[0]?.message?.content?.trim();

    if (insight) {
      // Cache successful insight
      await cacheInsight(data, insight);
      await recordAICall(data, true);
      console.log('[SUCCESS] AI insight generated:', insight);
      return insight;
    }

    await recordAICall(data, false);
    return null;
  } catch (error) {
    console.error('[ERROR] generateInsight error:', error.message);

    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.message.includes('Network') || error.message.includes('fetch'))) {
      console.log(`[RETRY] Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return generateInsight(data, retryCount + 1);
    }

    await recordAICall(data, false);
    return null;
  }
};