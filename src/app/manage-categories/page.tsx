import CategoryManager from "@/components/categories/CategoryManager";

export default function ManageCategoriesPage() {
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <CategoryManager />
    </div>
  );
}
