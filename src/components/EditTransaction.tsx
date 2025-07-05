"use client";

import TransactionForm from "@/components/AddTransaction";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Transaction } from "@/components/TransactionList";

interface EditTransactionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction;
  onSuccess: () => void;
  onCancelEdit: () => void;
}

export default function EditTransactionDialog({
  open,
  onOpenChange,
  editingTransaction,
  onSuccess,
  onCancelEdit,
}: EditTransactionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <TransactionForm
            onSuccess={onSuccess}
            editingTransaction={editingTransaction}
            onCancelEdit={onCancelEdit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
