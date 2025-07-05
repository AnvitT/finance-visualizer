"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, IndianRupee, PieChart as PieChartIcon, Receipt } from "lucide-react";

export default function DashboardSummary({ refresh }: { refresh: number }) {
  const [summary, setSummary] = useState<any>({ total: 0, byCategory: {}, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const transactions = await res.json();
        let total = 0;
        const byCategory: Record<string, number> = {};
        transactions.forEach((t: any) => {
          total += t.amount;
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });
        const recent = transactions.slice(0, 5);
        setSummary({ total, byCategory, recent });
      } catch (error) {
        setSummary({ total: 0, byCategory: {}, recent: [] });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refresh]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5" />Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
        </CardContent>
      </Card>
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" />Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {Object.entries(summary.byCategory).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([cat, amt]: any) => (
              <li key={cat} className="flex justify-between text-sm"><span>{cat}</span><span>{formatCurrency(amt)}</span></li>
            ))}
            {Object.keys(summary.byCategory).length === 0 && <li className="text-muted-foreground">No categories</li>}
          </ul>
        </CardContent>
      </Card>
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {summary.recent.map((t: any) => (
              <li key={t._id} className="flex justify-between text-xs">
                <span className="truncate max-w-[120px]">{t.description}</span>
                <span>{formatCurrency(t.amount)}</span>
              </li>
            ))}
            {summary.recent.length === 0 && <li className="text-muted-foreground">No recent transactions</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
