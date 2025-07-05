"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Palette, Tag } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  color: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#8884d8");
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAddOrEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/categories/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify({ name, color }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error((await res.json()).error);
        toast.success("Category updated");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          body: JSON.stringify({ name, color }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error((await res.json()).error);
        toast.success("Category added");
      }
      setName("");
      setColor("#8884d8");
      setEditing(null);
      setAddEditDialogOpen(false);
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Category deleted");
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Category Dialog */}
      <Dialog open={addEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {editing ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrEdit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="category-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Food, Transportation, Entertainment"
                disabled={loading}
                required
                minLength={2}
                maxLength={20}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category-color" className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Category Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="category-color"
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-12 h-12 p-1 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">
                    Choose a color to identify this category
                  </div>
                  <div className="text-sm font-mono">{color}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={loading || !name.trim()} 
                className="flex-1"
              >
                {loading ? "Saving..." : editing ? "Update Category" : "Add Category"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { 
                  setEditing(null); 
                  setName(""); 
                  setColor("#8884d8"); 
                  setAddEditDialogOpen(false); 
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Category
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this category? This action cannot be undone and may affect existing transactions.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Manage your expense categories ({categories.length} total)
          </p>
        </div>
        <Button 
          onClick={() => { 
            setEditing(null); 
            setName(""); 
            setColor("#8884d8"); 
            setAddEditDialogOpen(true); 
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-3">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No categories yet</h4>
              <p className="text-muted-foreground text-center mb-4">
                Create your first category to start organizing your expenses
              </p>
              <Button 
                onClick={() => { 
                  setEditing(null); 
                  setName(""); 
                  setColor("#8884d8"); 
                  setAddEditDialogOpen(true); 
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map(cat => (
            <Card key={cat._id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: cat.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{cat.name}</h4>
                  <p className="text-sm text-muted-foreground">{cat.color}</p>
                </div>
                {cat.name !== "Other" && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => { 
                        setEditing(cat); 
                        setName(cat.name); 
                        setColor(cat.color); 
                        setAddEditDialogOpen(true); 
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => { 
                        setPendingDeleteId(cat._id); 
                        setDeleteDialogOpen(true); 
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {cat.name === "Other" && (
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Default
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
