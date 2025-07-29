/**
 * Client-side utilities for portfolio chart data filtering and performance calculation
 */

export type ChartDataPoint = {
  period: string;
  date: string;
  total: number;
};

export type PortfolioSummary = {
  currentValue: number;
  periodChange: number;
  periodChangePercent: number;
  isPositive: boolean;
};

export type PortfolioData = {
  data: ChartDataPoint[];
  summary: PortfolioSummary;
};

/**
 * Helper function to convert period strings to date ranges (client-side version)
 */
export function getPeriodDateRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);
  
  // Set time to beginning of day for startDate to ensure we include the full day
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case '1D':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'WTD': {
      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(now.getDate() - daysToMonday);
      break;
    }
    case '7D':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'MTD':
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '30D':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90D':
      startDate.setDate(now.getDate() - 90);
      break;
    case 'YTD':
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '365D':
      startDate.setDate(now.getDate() - 365);
      break;
    case '5Y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'MAX':
      // Get the earliest transaction date or 5 years ago, whichever is more recent
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      // Default to 7 days
      startDate.setDate(now.getDate() - 7);
  }

  // Ensure we don't go before 1970 for date compatibility
  if (startDate.getFullYear() < 1970) {
    startDate = new Date(1970, 0, 1);
  }

  return { startDate, endDate };
}

/**
 * Filter full year data to a specific period and recalculate performance metrics
 */
export function filterDataByPeriod(
  fullYearData: PortfolioData,
  period: string
): PortfolioData {
  const { startDate } = getPeriodDateRange(period);
  
  // Filter data points to the requested period
  const filteredData = fullYearData.data.filter(item => {
    const itemDate = new Date(item.date);
    // Set time to beginning of day for fair comparison
    itemDate.setHours(0, 0, 0, 0);
    
    return itemDate >= startDate;
  });

  // If no data points match the period, return empty data
  if (filteredData.length === 0) {
    return {
      data: [],
      summary: {
        currentValue: 0,
        periodChange: 0,
        periodChangePercent: 0,
        isPositive: false,
      },
    };
  }

  // Recalculate performance metrics for the filtered period
  const startValue = filteredData[0]?.total || 0;
  const endValue = filteredData[filteredData.length - 1]?.total || 0;
  const periodChange = endValue - startValue;
  const periodChangePercent = startValue !== 0 ? (periodChange / startValue) * 100 : 0;

  return {
    data: filteredData,
    summary: {
      currentValue: endValue,
      periodChange,
      periodChangePercent,
      isPositive: periodChange >= 0,
    },
  };
}

/**
 * Check if a period requires server-side data (longer than 365D)
 */
export function requiresServerData(period: string): boolean {
  return period === '5Y' || period === 'MAX';
}

/**
 * Check if a period is longer than 30D (needs 365D data)
 */
export function needsYearData(period: string): boolean {
  return !['1D', 'WTD', '7D', 'MTD', '30D'].includes(period) && !requiresServerData(period);
}

/**
 * More accurate date parsing for chart data points
 * Handles the "Dec 23" format used in chart data
 */
export function parseChartDate(periodString: string): Date {
  try {
    const currentYear = new Date().getFullYear();
    const now = new Date();
    
    // Parse the date with current year first
    let date = new Date(`${periodString} ${currentYear}`);
    
    // If the parsed date is invalid, try with different format
    if (Number.isNaN(date.getTime())) {
      // Try alternative parsing
      date = new Date(`${periodString}, ${currentYear}`);
    }
    
    // If still invalid, return current date as fallback
    if (Number.isNaN(date.getTime())) {
      console.warn(`Failed to parse chart date: ${periodString}`);
      return now;
    }
    
    // Handle year boundary - if parsed date is more than a few days in the future, it's from last year
    const daysDiff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 1) {
      date.setFullYear(currentYear - 1);
    }
    
    return date;
  } catch (error) {
    console.warn(`Failed to parse chart date: ${periodString}`, error);
    return new Date(); // Fallback to current date
  }
}