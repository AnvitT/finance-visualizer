"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f87171",
  Transport: "#60a5fa",
  Shopping: "#fbbf24",
  Bills: "#a78bfa",
  Entertainment: "#34d399",
  Health: "#f472b6",
  Other: "#a3a3a3"
};

interface PieChartData {
  category: string;
  total: number;
}

export default function CategoryPieChart({ refresh }: { refresh: number }) {
  const [data, setData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const transactions = await res.json();
        const grouped: Record<string, number> = {};
        transactions.forEach((t: { category: string; amount: number }) => {
          grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });
        const chartData = Object.entries(grouped).map(([category, total]) => ({
          category,
          total
        }));
        setData(chartData);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred");
        }
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

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: PieChartData; value: number }>;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.category}</p>
          <p className="text-sm text-primary">
            Total: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading chart...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available for chart.</p>
            <p className="text-sm">Add some transactions to see your category breakdown.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category }) => category}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[entry.category] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
