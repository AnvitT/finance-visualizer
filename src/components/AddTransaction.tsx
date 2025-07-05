"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface AddTransactionProps {
  onSuccess: () => void;
  editingTransaction?: {
    _id: string;
    amount: number;
    date: string;
    description: string;
    category: string;
  };
  onCancelEdit?: () => void;
}


export default function AddTransaction({
  onSuccess,
  editingTransaction,
  onCancelEdit,
}: AddTransactionProps) {
  const [categories, setCategories] = useState<{_id: string, name: string, color: string}[]>([]);
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || "");
  const [date, setDate] = useState(editingTransaction?.date ? new Date(editingTransaction.date) : undefined);
  const [description, setDescription] = useState(editingTransaction?.description || "");
  const [category, setCategory] = useState(editingTransaction?.category || 'Other');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories from API
  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => {
      setCategories(data);
      // If editing, keep the category, else default to 'Other' or first
      if (!editingTransaction) {
        const other = data.find((c: { _id: string, name: string, color: string }) => c.name === 'Other');
        setCategory(other ? other.name : (data[0]?.name || 'Other'));
      }
    });
  }, [editingTransaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 3) {
      newErrors.description = "Description must be at least 3 characters";
    }
    if (!category || !categories.some(c => c.name === category)) {
      newErrors.category = "Category is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction._id}` 
        : "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: JSON.stringify({ 
          amount: Number(amount), 
          date: date ? format(date, "yyyy-MM-dd") : "", 
          description: description.trim(),
          category
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save transaction");
      }
      // Reset form
      setAmount("");
      setDate(undefined);
      setDescription("");
      setCategory('Other');
      setErrors({});
      toast.success(
        editingTransaction
          ? "Transaction updated successfully"
          : "Transaction added successfully"
      );
      onSuccess();
      if (onCancelEdit) onCancelEdit();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-2 md:px-6 md:py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""} ${errors.date ? "border-red-500" : ""}`}
              >
                {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date}</p>
          )}
        </div>
      </div>
      <div className="space-y-2 mb-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="Enter transaction description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      <div className="space-y-2 mb-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`} id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(opt => (
              <SelectItem key={opt._id} value={opt.name}>
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: opt.color }}></span>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingTransaction ? "Update" : "Add"} Transaction
        </Button>
        {editingTransaction && onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}