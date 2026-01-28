import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Sale } from '@/dashboard/types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ChartLine } from 'lucide-react';

interface SalesPerformanceChartProps {
  sales: Sale[];
  formatCurrency: (value: number) => string;
  dateFilter?: string;
  dateRange?: { from: Date | undefined; to: Date | undefined; };
  isCustomRange?: boolean;
  expensesData?: Array<{date: string, amount: number}>; 
}

interface DataPoint {
  date: string;
  displayDate: string;
  amount: number;
  expenses: number;
  rawDate: Date;
}

// Custom tooltip component for the chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
        <p className="font-medium text-sm">{dataPoint.displayDate}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} className="text-sm">
            <span className="font-medium">{entry.name}: </span>
            <span>{formatCurrency ? formatCurrency(entry.value) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({ 
  sales, 
  formatCurrency,
  dateFilter = 'this-month',
  dateRange = { from: undefined, to: undefined },
  isCustomRange = false,
  expensesData = [] 
}) => {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  
  // Calculate current year and available years for filtering
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    new Set(
      sales.map(sale => new Date(sale.date).getFullYear())
    )
  ).sort((a, b) => b - a); 

  // If no years found (no sales), add current year
  if (years.length === 0) {
    years.push(currentYear);
  }
  
  // Filter sales based on the date filter
  const getFilteredSales = () => {
    // First filter sales to exclude quotes
    const nonQuoteSales = sales.filter(sale => sale.paymentStatus !== 'Quote');
    
    // For performance chart, show full year by default unless specific filters are applied
    if (isCustomRange && dateRange.from && dateRange.to) {
      return nonQuoteSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startOfDay(dateRange.from!) && saleDate <= endOfDay(dateRange.to!);
      });
    } else if (dateFilter && dateFilter !== 'all' && dateFilter !== 'this-month') {
      // Only apply specific date filters (not the default 'this-month')
      const today = new Date();
      
      return nonQuoteSales.filter(sale => {
        const saleDate = new Date(sale.date);
        
        switch (dateFilter) {
          case 'today':
            return saleDate >= startOfDay(today) && saleDate <= endOfDay(today);
          case 'yesterday':
            const yesterday = subDays(today, 1);
            return saleDate >= startOfDay(yesterday) && saleDate <= endOfDay(yesterday);
          case 'this-week':
            return saleDate >= startOfWeek(today, { weekStartsOn: 1 }) && 
                   saleDate <= endOfWeek(today, { weekStartsOn: 1 });
          case 'last-week':
            const lastWeekStart = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
            const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
            return saleDate >= lastWeekStart && saleDate <= lastWeekEnd;
          case 'last-month':
            const lastMonth = subMonths(today, 1);
            return saleDate >= startOfMonth(lastMonth) && saleDate <= endOfMonth(lastMonth);
          case 'this-year':
            return saleDate >= startOfYear(today) && saleDate <= endOfYear(today);
          default:
            return true;
        }
      });
    }
    
    // Default: Filter by selected year for the chart (show full year)
    return nonQuoteSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === parseInt(yearFilter);
    });
  };
  
  // Prepare data for the chart based on the selected time frame
  const prepareChartData = () => {
    const filteredSales = getFilteredSales();
    
    if (timeFrame === 'weekly') {
      // Get the start and end of the current week
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      
      // Group by day of the week
      const dailyData: DataPoint[] = [];
      
      // Create an array of all days in the week
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        
        // Filter sales for this day
        const salesOnDay = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.toDateString() === day.toDateString();
        });
        
        // Calculate total sales amount for this day
        const totalAmount = salesOnDay.reduce((sum, sale) => {
          const saleTotalAmount = sale.items && Array.isArray(sale.items)
            ? sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
            : 0;
          return sum + saleTotalAmount;
        }, 0);
        
        // Filter expenses for this day
        const expensesOnDay = expensesData.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.toDateString() === day.toDateString();
        });
        
        // Calculate total expenses for this day
        const totalExpenses = expensesOnDay.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        // Format date for display and as key
        const displayDate = format(day, 'EEE');
        const dateStr = format(day, 'yyyy-MM-dd');
        
        dailyData.push({
          date: dateStr,
          displayDate: displayDate,
          amount: totalAmount,
          expenses: totalExpenses,
          rawDate: new Date(day)
        });
      }
      
      return dailyData;
    } 
    else if (timeFrame === 'monthly') {
      // Group by month
      const monthlyData: DataPoint[] = [];
      const selectedYear = parseInt(yearFilter);
      
      // Create array for all 12 months
      for (let month = 0; month < 12; month++) {
        const date = new Date(selectedYear, month, 1);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        // Filter sales for this month
        const salesInMonth = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthStart && saleDate <= monthEnd;
        });
        
        // Calculate total sales amount for this month
        const totalAmount = salesInMonth.reduce((sum, sale) => {
          const saleTotalAmount = sale.items && Array.isArray(sale.items)
            ? sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
            : 0;
          return sum + saleTotalAmount;
        }, 0);
        
        // Filter expenses for this month
        const expensesInMonth = expensesData.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        });
        
        // Calculate total expenses for this month
        const totalExpenses = expensesInMonth.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        // Format date for display and as key
        const displayDate = format(date, 'MMM');
        const dateStr = format(date, 'yyyy-MM');
        
        monthlyData.push({
          date: dateStr,
          displayDate: displayDate,
          amount: totalAmount,
          expenses: totalExpenses,
          rawDate: new Date(date)
        });
      }
      
      return monthlyData;
    } 
    else if (timeFrame === 'yearly') {
      // Group by year
      const yearlyData: DataPoint[] = [];
      
      // Use the available years from sales data
      for (const year of years) {
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(new Date(year, 0, 1));
        
        // Filter sales for this year
        const salesInThisYear = filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= yearStart && saleDate <= yearEnd;
        });
        
        // Calculate total sales amount for this year
        const totalAmount = salesInThisYear.reduce((sum, sale) => {
          const saleTotalAmount = sale.items && Array.isArray(sale.items)
            ? sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
            : 0;
          return sum + saleTotalAmount;
        }, 0);
        
        // Filter expenses for this year
        const expensesInYear = expensesData.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= yearStart && expenseDate <= yearEnd;
        });
        
        // Calculate total expenses for this year
        const totalExpenses = expensesInYear.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        // Format date for display and as key
        yearlyData.push({
          date: year.toString(),
          displayDate: year.toString(),
          amount: totalAmount,
          expenses: totalExpenses,
          rawDate: new Date(year, 0, 1)
        });
      }
      
      return yearlyData;
    }
    
    // Default: if no valid timeframe is selected
    return [];
  };
  
  const chartData = prepareChartData();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="h-5 w-5" /> Performance Analysis
            </CardTitle>
            <CardDescription>Visualize your sales and expenses over time</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="monthly" value={timeFrame} onValueChange={setTimeFrame} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          
          <div className="h-[300px] w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 20, right: 20, left: 30, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e0e0e0' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Sales" 
                    stroke="#9b87f5" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses" 
                    stroke="#E76F51" 
                    activeDot={{ r: 6 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for this time period
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SalesPerformanceChart;
