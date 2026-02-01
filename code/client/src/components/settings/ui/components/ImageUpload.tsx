"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    value?: string | null;
    onChange: (file: File) => void;
    onRemove?: () => void;
    className?: string;
    description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    value,
    onChange,
    onRemove,
    className,
    description
}) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onChange(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        if (onRemove) onRemove();
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1">
                {label}
            </label>

            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer 
                    border-2 border-dashed border-border rounded-3xl 
                    bg-muted/10 hover:bg-muted/30 hover:border-primary/30 
                    transition-all overflow-hidden
                    ${preview ? 'aspect-video' : 'h-40'}
                `}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt={label}
                            className="w-full h-full object-contain p-4 bg-checkerboard"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                            <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Change
                            </span>
                        </div>
                        {onRemove && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/50 group-hover:text-primary/60 transition-colors">
                        <div className="p-4 bg-muted/50 rounded-full group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest">Click to Upload</p>
                            <p className="text-[10px] font-medium mt-1 opacity-70">SVG, PNG, JPG</p>
                        </div>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {description && (
                <p className="text-[10px] text-muted-foreground font-medium px-1">
                    {description}
                </p>
            )}
        </div>
    );
};
