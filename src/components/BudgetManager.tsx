"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Target, Plus, Edit2, Trash2, TrendingUp, IndianRupee } from "lucide-react";

interface Budget {
  _id: string;
  category: string;
  month: string;
  amount: number;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Generate month options for the current year and next few months
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = -3; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    // Set default month to current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  async function fetchBudgets() {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (error) {
      toast.error("Failed to fetch budgets");
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory || !selectedMonth || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          month: selectedMonth,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success(editing ? "Budget updated" : "Budget set");
      resetForm();
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
      toast.success("Budget deleted");
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelectedCategory("");
    setAmount("");
    setEditing(null);
    setDialogOpen(false);
  }

  function startEdit(budget: Budget) {
    setEditing(budget);
    setSelectedCategory(budget.category);
    setSelectedMonth(budget.month);
    setAmount(budget.amount.toString());
    setDialogOpen(true);
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || "#8884d8";
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Set monthly budgets for your expense categories
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Set Budget
        </Button>
      </div>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {editing ? "Edit Budget" : "Set New Budget"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : editing ? "Update Budget" : "Set Budget"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budgets List */}
      <div className="grid gap-3">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No budgets set</h4>
              <p className="text-muted-foreground text-center mb-4">
                Set your first budget to start tracking your spending goals
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Set Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map(budget => (
            <Card key={budget._id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: getCategoryColor(budget.category) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{budget.category}</h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {formatMonth(budget.month)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {budget.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => startEdit(budget)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(budget._id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
