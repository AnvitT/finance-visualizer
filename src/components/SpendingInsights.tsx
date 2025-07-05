"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar, BarChart3 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Transaction {
  _id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Budget {
  _id: string;
  category: string;
  month: string;
  amount: number;
}

interface SpendingInsight {
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  description: string;
  value?: string;
  icon: LucideIcon;
}

export default function SpendingInsights({ refresh }: { refresh: number }) {
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate month options
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = -6; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    // Set default to current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      generateInsights();
    }
  }, [selectedMonth, refresh]);

  async function generateInsights() {
    setLoading(true);
    try {
      // Fetch data
      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch(`/api/budgets?month=${selectedMonth}`)
      ]);

      const allTransactions: Transaction[] = await transactionsRes.json();
      const budgets: Budget[] = await budgetsRes.json();

      // Filter transactions for selected month
      const monthTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        return transactionMonth === selectedMonth;
      });

      // Filter transactions for previous month (for comparison)
      const prevDate = new Date(selectedMonth + '-01');
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      
      const prevMonthTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        return transactionMonth === prevMonth;
      });

      const newInsights: SpendingInsight[] = [];

      // Calculate spending by category
      const categorySpending: { [key: string]: number } = {};
      const prevCategorySpending: { [key: string]: number } = {};

      monthTransactions.forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

      prevMonthTransactions.forEach(t => {
        prevCategorySpending[t.category] = (prevCategorySpending[t.category] || 0) + t.amount;
      });

      // Total spending insights
      const totalSpending = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const prevTotalSpending = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

      // 1. Budget vs Actual insights
      if (totalBudget > 0) {
        const budgetUsage = (totalSpending / totalBudget) * 100;
        if (budgetUsage > 100) {
          newInsights.push({
            type: 'danger',
            title: 'Budget Exceeded',
            description: `You've spent ${budgetUsage.toFixed(1)}% of your total budget this month`,
            value: `₹${(totalSpending - totalBudget).toLocaleString('en-IN')} over budget`,
            icon: AlertTriangle
          });
        } else if (budgetUsage > 80) {
          newInsights.push({
            type: 'warning',
            title: 'Approaching Budget Limit',
            description: `You've used ${budgetUsage.toFixed(1)}% of your total budget`,
            value: `₹${(totalBudget - totalSpending).toLocaleString('en-IN')} remaining`,
            icon: Target
          });
        } else {
          newInsights.push({
            type: 'success',
            title: 'Budget on Track',
            description: `You've used ${budgetUsage.toFixed(1)}% of your total budget`,
            value: `₹${(totalBudget - totalSpending).toLocaleString('en-IN')} remaining`,
            icon: CheckCircle
          });
        }
      }

      // 2. Month-over-month comparison
      if (prevTotalSpending > 0) {
        const spendingChange = ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
        if (Math.abs(spendingChange) > 5) {
          newInsights.push({
            type: spendingChange > 0 ? 'warning' : 'success',
            title: `Spending ${spendingChange > 0 ? 'Increased' : 'Decreased'}`,
            description: `${Math.abs(spendingChange).toFixed(1)}% ${spendingChange > 0 ? 'increase' : 'decrease'} from last month`,
            value: `₹${Math.abs(totalSpending - prevTotalSpending).toLocaleString('en-IN')} difference`,
            icon: spendingChange > 0 ? TrendingUp : TrendingDown
          });
        }
      }

      // 3. Category-specific insights
      budgets.forEach(budget => {
        const spent = categorySpending[budget.category] || 0;
        const usage = (spent / budget.amount) * 100;

        if (usage > 100) {
          newInsights.push({
            type: 'danger',
            title: `${budget.category} Over Budget`,
            description: `${usage.toFixed(1)}% of budget used`,
            value: `₹${(spent - budget.amount).toLocaleString('en-IN')} over`,
            icon: AlertTriangle
          });
        } else if (usage > 90) {
          newInsights.push({
            type: 'warning',
            title: `${budget.category} Nearly Exhausted`,
            description: `${usage.toFixed(1)}% of budget used`,
            value: `₹${(budget.amount - spent).toLocaleString('en-IN')} left`,
            icon: Target
          });
        }
      });

      // 4. Highest spending category
      const highestCategory = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (highestCategory && totalSpending > 0) {
        const percentage = (highestCategory[1] / totalSpending) * 100;
        if (percentage > 40) {
          newInsights.push({
            type: 'info',
            title: 'Top Spending Category',
            description: `${highestCategory[0]} accounts for ${percentage.toFixed(1)}% of your spending`,
            value: `₹${highestCategory[1].toLocaleString('en-IN')}`,
            icon: BarChart3
          });
        }
      }

      // 5. Spending frequency insight
      const daysWithTransactions = new Set(
        monthTransactions.map(t => new Date(t.date).toDateString())
      ).size;
      
      const daysInMonth = new Date(
        parseInt(selectedMonth.split('-')[0]), 
        parseInt(selectedMonth.split('-')[1]), 
        0
      ).getDate();

      if (daysWithTransactions / daysInMonth > 0.8) {
        newInsights.push({
          type: 'info',
          title: 'Frequent Spending',
          description: `You made transactions on ${daysWithTransactions} out of ${daysInMonth} days`,
          value: `${((daysWithTransactions / daysInMonth) * 100).toFixed(1)}% of days`,
          icon: Calendar
        });
      }

      // 6. Average transaction size
      if (monthTransactions.length > 0) {
        const avgTransaction = totalSpending / monthTransactions.length;
        const prevAvgTransaction = prevTotalSpending / (prevMonthTransactions.length || 1);
        
        if (avgTransaction > prevAvgTransaction * 1.2) {
          newInsights.push({
            type: 'warning',
            title: 'Higher Average Spending',
            description: `Average transaction increased by ${(((avgTransaction - prevAvgTransaction) / prevAvgTransaction) * 100).toFixed(1)}%`,
            value: `₹${avgTransaction.toLocaleString('en-IN')} avg`,
            icon: TrendingUp
          });
        }
      }

      setInsights(newInsights);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Insights
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Analyzing your spending...</div>
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No insights available</h4>
            <p className="text-muted-foreground text-center">
              Add some transactions and budgets to get personalized spending insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <insight.icon className={`h-5 w-5 mt-0.5 ${getIconColor(insight.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      {insight.value && (
                        <Badge variant="secondary" className="ml-2">
                          {insight.value}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
