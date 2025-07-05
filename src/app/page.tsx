"use client";


import { useState } from "react";
import TransactionForm from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import DashboardSummary from "@/components/DashboardSummary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CategoryManager from "@/components/categories/CategoryManager";
import BudgetManager from "@/components/BudgetManager";
import BudgetVsActualChart from "@/components/BudgetVsActualChart";
import SpendingInsights from "@/components/SpendingInsights";
import { Settings, Plus, Target, TrendingUp } from "lucide-react";



export default function HomePage() {
  const [refresh, setRefresh] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);

  const handleSuccess = () => {
    setRefresh(prev => prev + 1);
    setOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Personal Finance Visualizer</h1>
            <p className="text-muted-foreground">Track your expenses and visualize your spending patterns in rupees (₹)</p>
          </div>

          {/* Dashboard Summary Cards */}
          <DashboardSummary refresh={refresh} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { setEditingTransaction(null); setOpen(true); }} 
                  className="flex items-center gap-2 px-6"
                  size="lg"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-md w-full">
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-0">
                  <TransactionForm
                    onSuccess={handleSuccess}
                    editingTransaction={editingTransaction}
                    onCancelEdit={handleCancelEdit}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={() => setCategoryDialogOpen(true)}
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              <Settings className="h-4 w-4" />
              Manage Categories
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setBudgetDialogOpen(true)}
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              <Target className="h-4 w-4" />
              Manage Budgets
            </Button>
          </div>

          {/* Manage Categories Dialog */}
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Categories
                </DialogTitle>
              </DialogHeader>
              <CategoryManager />
            </DialogContent>
          </Dialog>

          {/* Manage Budgets Dialog */}
          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Manage Budgets
                </DialogTitle>
              </DialogHeader>
              <BudgetManager />
            </DialogContent>
          </Dialog>

          {/* Budget vs Actual and Spending Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetVsActualChart refresh={refresh} />
            <SpendingInsights refresh={refresh} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonthlyExpensesChart refresh={refresh} />
            <CategoryPieChart refresh={refresh} />
          </div>

          {/* Transaction List */}
          <TransactionList
            refresh={refresh}
            onEditTransaction={handleEditTransaction}
            onTransactionChange={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
