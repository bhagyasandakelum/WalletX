import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up the foreground notification handler safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldShowBadge: false,
    }),
  });
} catch (error) {
  console.warn('Failed to set notification handler:', error);
}

/**
 * Request notification permissions and send a native system alert
 */
export const triggerSystemNotification = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for local notifications.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 4,
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.error('Failed to trigger native notification', error);
  }
};

/**
 * Offline intelligence engine to generate insights and forecasts from SQLite expense logs
 */
export const generateFinancialInsights = (expenses = [], weeklyBudget = null) => {
  const insights = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  // Helper: get days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 1. Filter current month vs prior month expenses
  const thisMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  // Calculate total spent this month
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalSpentLastMonth = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Helper for currency symbol
  const currency = 'රු';

  // 2. Algorithm A: AI-like spending forecasting
  if (thisMonthExpenses.length > 0) {
    const dailyAverage = totalSpentThisMonth / currentDay;
    const projectedSpend = dailyAverage * daysInMonth;

    insights.push({
      id: `forecast-eom-${currentMonth}-${currentYear}`,
      title: `📈 Monthly Spending Projection: ${currency} ${Math.round(projectedSpend).toLocaleString()}`,
      description: `Based on your average daily outflow of ${currency} ${Math.round(dailyAverage).toLocaleString()} over the first ${currentDay} day(s) of this month, you are projected to spend approximately ${currency} ${Math.round(projectedSpend).toLocaleString()} by the end of this month.\n\n${
        weeklyBudget && projectedSpend > weeklyBudget * 4
          ? `⚠️ This exceeds your target weekly budget limit of ${currency} ${weeklyBudget} multiplied by 4 weeks. Consider trimming discretionary items!`
          : `✅ This is well within your budget! Keep up the smart saving habits.`
      }`,
      date: new Date().toISOString(),
      type: 'forecast',
      read: false,
      icon: 'trending-up',
      badge: 'Forecast',
      color: '#f59e0b',
    });
  }

  // 3. Algorithm B: Daily Average Insight
  if (thisMonthExpenses.length > 0) {
    const dailyAverage = totalSpentThisMonth / currentDay;
    insights.push({
      id: `insight-daily-average-${currentMonth}-${currentYear}`,
      title: `💡 Daily Expense Benchmark: ${currency} ${Math.round(dailyAverage)}`,
      description: `Your average daily expense for this month is currently ${currency} ${Math.round(dailyAverage).toLocaleString()}.\n\nMaintaining a daily average below ${currency} ${Math.round(dailyAverage * 0.85).toLocaleString()} will boost your monthly savings by an extra 15%. Focus on small daily adjustments to watch your wallet grow!`,
      date: new Date().toISOString(),
      type: 'insight',
      read: false,
      icon: 'activity',
      badge: 'AI Insight',
      color: '#3b82f6',
    });
  }

  // 4. Algorithm C: Weekly Budget Alert
  if (weeklyBudget && weeklyBudget > 0) {
    // Filter this week's expenses (last 7 days or matching week)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const thisWeekExpenses = expenses.filter(exp => new Date(exp.date) >= startOfWeek);
    const thisWeekTotal = thisWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const progress = thisWeekTotal / weeklyBudget;

    if (progress >= 1.0) {
      insights.push({
        id: `budget-alert-high-${now.toDateString()}`,
        title: `⚠️ Budget Alert: Used ${Math.round(progress * 100)}% of Weekly Limit`,
        description: `You have spent ${currency} ${thisWeekTotal.toFixed(2)} out of your ${currency} ${weeklyBudget.toFixed(2)} weekly budget.\n\nWith only a small amount left before reaching your cap, we suggest pausing non-essential purchases like dining out or retail shopping for the remainder of this week.`,
        date: new Date().toISOString(),
        type: 'alert',
        read: false,
        icon: 'alert-triangle',
        badge: 'Budget Alert',
        color: '#ef4444',
      });
    }
  }

  // 5. Algorithm D: Category comparison (Current Month vs Last Month)
  if (thisMonthExpenses.length > 2 && lastMonthExpenses.length > 2) {
    // Group by category
    const catThisMonth = {};
    const catLastMonth = {};

    thisMonthExpenses.forEach(exp => {
      if (exp.category) {
        catThisMonth[exp.category] = (catThisMonth[exp.category] || 0) + exp.amount;
      }
    });
    lastMonthExpenses.forEach(exp => {
      if (exp.category) {
        catLastMonth[exp.category] = (catLastMonth[exp.category] || 0) + exp.amount;
      }
    });

    // Check if there is a category that increased
    let maxIncreaseCat = null;
    let maxIncreasePct = 0;
    let maxIncreaseAmt = 0;

    Object.keys(catThisMonth).forEach(cat => {
      const thisAmt = catThisMonth[cat];
      const lastAmt = catLastMonth[cat] || 0;
      if (lastAmt > 500 && thisAmt > lastAmt) {
        const pct = ((thisAmt - lastAmt) / lastAmt) * 100;
        if (pct > maxIncreasePct) {
          maxIncreasePct = pct;
          maxIncreaseCat = cat;
          maxIncreaseAmt = thisAmt - lastAmt;
        }
      }
    });

    if (maxIncreaseCat) {
      insights.push({
        id: `insight-category-compare-${maxIncreaseCat}-${currentMonth}-${currentYear}`,
        title: `💸 Category Spent Surge: ${maxIncreaseCat} increased by ${Math.round(maxIncreasePct)}%`,
        description: `Your spending on "${maxIncreaseCat}" has increased from ${currency} ${Math.round(catLastMonth[maxIncreaseCat]).toLocaleString()} last month to ${currency} ${Math.round(catThisMonth[maxIncreaseCat]).toLocaleString()} this month (+${currency} ${Math.round(maxIncreaseAmt).toLocaleString()}).\n\nTake a closer look at your ${maxIncreaseCat} transactions to see where the leak occurred and restore your budgeting focus.`,
        date: new Date().toISOString(),
        type: 'insight',
        read: false,
        icon: 'pie-chart',
        badge: 'AI Insight',
        color: '#3b82f6',
      });
    }
  }

  // 6. Algorithm E: Day of Week Analysis
  if (thisMonthExpenses.length >= 5) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdaySum = [0, 0, 0, 0, 0, 0, 0];
    const weekdayCount = [0, 0, 0, 0, 0, 0, 0];
    const weekdayCat = [{}, {}, {}, {}, {}, {}, {}];

    thisMonthExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const dayIndex = expDate.getDay();
      weekdaySum[dayIndex] += exp.amount;
      weekdayCount[dayIndex] += 1;
      if (exp.category) {
        const cats = weekdayCat[dayIndex];
        cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
      }
    });

    // Find heaviest day
    let heaviestDayIndex = -1;
    let maxSpent = 0;
    weekdaySum.forEach((sum, idx) => {
      if (sum > maxSpent) {
        maxSpent = sum;
        heaviestDayIndex = idx;
      }
    });

    if (heaviestDayIndex !== -1 && maxSpent > 1000) {
      const heaviestDayName = days[heaviestDayIndex];
      // Find top category on that day
      let topCategory = 'uncategorized';
      let topCatSpent = 0;
      const catsOnDay = weekdayCat[heaviestDayIndex];
      Object.keys(catsOnDay).forEach(cat => {
        if (catsOnDay[cat] > topCatSpent) {
          topCatSpent = catsOnDay[cat];
          topCategory = cat;
        }
      });

      insights.push({
        id: `insight-weekday-peak-${heaviestDayIndex}-${currentMonth}-${currentYear}`,
        title: `🗓️ Peak Outflow Trend: ${heaviestDayName}s`,
        description: `You tend to spend the most amount of money on ${heaviestDayName}s, accumulating a total of ${currency} ${Math.round(maxSpent).toLocaleString()} this month.\n\nThe leading driver is your "${topCategory}" category spending on this day. Being aware of this cycle can help you actively curb impulse purchases when ${heaviestDayName} rolls around!`,
        date: new Date().toISOString(),
        type: 'insight',
        read: false,
        icon: 'calendar',
        badge: 'AI Insight',
        color: '#3b82f6',
      });
    }
  }

  // Sort: Alerts first, then by date descending
  return insights.sort((a, b) => {
    if (a.type === 'alert' && b.type !== 'alert') return -1;
    if (a.type !== 'alert' && b.type === 'alert') return 1;
    return new Date(b.date) - new Date(a.date);
  });
};
