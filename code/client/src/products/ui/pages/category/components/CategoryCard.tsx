"use client";

import React from 'react';
import { Category } from '../../../../types';
import { deleteCategoryAction } from '../../../../api/controller';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
        setIsDeleting(true);
        try {
            const result = await deleteCategoryAction(category.id);
            if (result.success) {
                onDelete(category.id);
            } else {
                alert(result.error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative bg-background/50 backdrop-blur-sm border border-border rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                {category.description || 'No description provided.'}
            </p>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Category ID</span>
                <code className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">{category.id.substring(0, 8)}</code>
            </div>
        </div>
    );
};
