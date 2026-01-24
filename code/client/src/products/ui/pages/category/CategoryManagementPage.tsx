"use client";

import React from 'react';
import { Category } from '../../../types';
import { CategoryCard } from './components/CategoryCard';
import { createCategoryAction, updateCategoryAction, getCategoriesAction } from '../../../api/controller';

export const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const result = await getCategoriesAction();
        if (result.success) setCategories(result.data);
        setLoading(false);
    };

    React.useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        if (editingCategory) {
            const result = await updateCategoryAction(editingCategory.id, { name, description });
            if (result.success) {
                setCategories(categories.map(c => c.id === editingCategory.id ? result.data : c));
                setIsFormOpen(false);
                setEditingCategory(null);
            }
        } else {
            const result = await createCategoryAction({ name, description });
            if (result.success) {
                setCategories([result.data, ...categories]);
                setIsFormOpen(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Product Categories</h2>
                    <p className="text-muted-foreground text-sm">Organize your products into logical groups.</p>
                </div>
                <button
                    onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
                    className="h-10 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                </button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6">{editingCategory ? 'Update Category' : 'New Category'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Category Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    defaultValue={editingCategory?.name}
                                    placeholder="Electronics, Fashion, etc."
                                    className="w-full h-11 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingCategory?.description || ''}
                                    placeholder="Briefly describe what goes into this category..."
                                    className="w-full h-24 p-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 h-11 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-11 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/10 hover:bg-neutral-900 transition-all"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={(c) => { setEditingCategory(c); setIsFormOpen(true); }}
                            onDelete={(id) => setCategories(categories.filter(c => c.id !== id))}
                        />
                    ))}
                </div>
            )}

            {!loading && categories.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-3xl">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">No categories found.</p>
                </div>
            )}
        </div>
    );
};
