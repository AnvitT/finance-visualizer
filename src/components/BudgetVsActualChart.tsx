"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Target, IndianRupee } from "lucide-react";

interface Budget {
  _id: string;
  category: string;
  month: string;
  amount: number;
}

interface Transaction {
  _id: string;
  category: string;
  amount: number;
  date: string;
}

interface ComparisonData {
  category: string;
  budget: number;
  actual: number;
  difference: number;
  percentage: number;
  color: string;
}

interface Category {
  name: string;
  color: string;
}

export default function BudgetVsActualChart({ refresh }: { refresh: number }) {
  const [data, setData] = useState<ComparisonData[]>([]);
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
      fetchData();
    }
  }, [selectedMonth, refresh]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch budgets for the selected month
      const budgetsRes = await fetch(`/api/budgets?month=${selectedMonth}`);
      const budgets: Budget[] = await budgetsRes.json();

      // Fetch transactions for the selected month
      const transactionsRes = await fetch(`/api/transactions`);
      const allTransactions: Transaction[] = await transactionsRes.json();


      // Filter transactions for the selected month
      const monthTransactions = allTransactions.filter(transaction => {
        const date = new Date(transaction.date);
        const [year, month] = selectedMonth.split('-');
        return (
          date.getFullYear() === parseInt(year) &&
          date.getMonth() + 1 === parseInt(month)
        );
      });

      // Fetch categories for colors
      const categoriesRes = await fetch('/api/categories');
      const categories: Category[] = await categoriesRes.json();

      // Calculate actual spending by category
      const actualSpending: { [key: string]: number } = {};
      monthTransactions.forEach(transaction => {
        if (actualSpending[transaction.category]) {
          actualSpending[transaction.category] += transaction.amount;
        } else {
          actualSpending[transaction.category] = transaction.amount;
        }
      });

      // Combine budget and actual data
      const comparisonData: ComparisonData[] = [];
      budgets.forEach(budget => {
        const actual = actualSpending[budget.category] || 0;
        const difference = actual - budget.amount;
        const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
        const category = categories.find((c: Category) => c.name === budget.category);
        comparisonData.push({
          category: budget.category,
          budget: budget.amount,
          actual,
          difference,
          percentage,
          color: category?.color || "#8884d8"
        });
      });

      // Add categories that have spending but no budget
      Object.keys(actualSpending).forEach(categoryName => {
        if (!budgets.find(b => b.category === categoryName)) {
          const category = categories.find((c: Category) => c.name === categoryName);
          comparisonData.push({
            category: categoryName,
            budget: 0,
            actual: actualSpending[categoryName],
            difference: actualSpending[categoryName],
            percentage: 0,
            color: category?.color || "#ff6b6b"
          });
        }
      });

      setData(comparisonData.sort((a, b) => b.budget - a.budget));
    } catch (error) {
      console.error("Error fetching budget comparison data:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ComparisonData }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Budget: {formatCurrency(data.budget)}
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Actual: {formatCurrency(data.actual)}
            </p>
            <p className="flex items-center gap-2">
              {data.difference >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              Difference: {formatCurrency(Math.abs(data.difference))} 
              {data.difference >= 0 ? " over" : " under"}
            </p>
            {data.budget > 0 && (
              <p className="text-muted-foreground">
                {data.percentage.toFixed(1)}% of budget used
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalDifference = totalActual - totalBudget;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget vs Actual
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
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-lg font-semibold text-blue-600 flex items-center justify-center gap-1">
              <IndianRupee className="h-4 w-4" />
              {totalBudget.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
              <IndianRupee className="h-4 w-4" />
              {totalActual.toLocaleString('en-IN')}
            </div>
          </div>
          <div className={`text-center p-3 rounded-lg ${totalDifference >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="text-sm text-muted-foreground">Difference</div>
            <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${totalDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalDifference >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <IndianRupee className="h-4 w-4" />
              {Math.abs(totalDifference).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No budget data</h4>
            <p className="text-muted-foreground text-center">
              Set some budgets to see the comparison chart
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="budget" 
                fill="#3b82f6" 
                name="Budget"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                fill="#10b981" 
                name="Actual Spending"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
