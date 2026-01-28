import React from 'react';
import { Search, Package, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Product } from '@/products/types';
import { SaleItem } from './types';

interface ProductSectionProps {
    productSearch: string;
    onSearch: (query: string) => void;
    results: Product[];
    onAddProduct: (product: Product) => void;
    onAddCustom: (name: string, price: number) => void;
    items: SaleItem[];
    onUpdateItem: (id: string, field: string, value: string | number | boolean) => void;
    onRemoveItem: (id: string) => void;
    onToggleCost: (id: string) => void;
    onToggleDiscountType: (id: string) => void;
    currency: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    productSearch,
    onSearch,
    results,
    onAddProduct,
    onAddCustom,
    items,
    onUpdateItem,
    onRemoveItem,
    onToggleCost,
    onToggleDiscountType,
    currency
}) => {
    return (
        <div className="bg-card border border-border rounded-4xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Package className="w-4 h-4" /> Add Products
                </h3>
            </div>

            <div className="flex gap-2 relative">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => onSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                document.getElementById('customItemPrice')?.focus();
                            }
                        }}
                        placeholder="Search product or enter custom item name..."
                        className="w-full h-12 px-4 pl-11 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                    {results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto z-10">
                            {results.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => onAddProduct(product)}
                                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.sku} • Stock: {product.stock}
                                        </p>
                                    </div>
                                    <p className="font-black text-primary">{currency} {product.sellingPrice.toLocaleString()}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <div className="w-32 relative">
                        <label className="absolute -top-2 left-2 text-[8px] font-black uppercase tracking-wider bg-card px-1 text-muted-foreground">Price</label>
                        <input
                            type="number"
                            id="customItemPrice"
                            placeholder="0"
                            className="w-full h-12 px-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const priceInput = document.getElementById('customItemPrice') as HTMLInputElement;
                                    const price = parseFloat(priceInput.value);
                                    onAddCustom(productSearch, price);
                                }
                            }}
                        />
                    </div>
                    <button
                        onClick={() => {
                            const priceInput = document.getElementById('customItemPrice') as HTMLInputElement;
                            const price = parseFloat(priceInput.value);
                            onAddCustom(productSearch, price);
                        }}
                        className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        Add
                    </button>
                </div>
            </div>

            {items.length > 0 && (
                <div className="mt-8">
                    <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div className="col-span-4">Product</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Disc.</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y divide-border/50">
                        {items.map((item) => {
                            const lineTotalRef = item.sellingPrice * item.quantity;
                            const itemDiscountValue = item.discountType === 'PERCENTAGE'
                                ? (lineTotalRef * item.discount) / 100
                                : item.discount;

                            return (
                                <div key={item.id} className="py-3 px-3 hover:bg-muted/30 transition-colors group">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <p className="font-bold text-sm text-foreground">{item.productName}</p>
                                            {item.sku && <p className="text-[10px] text-muted-foreground">{item.sku}</p>}
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-16 h-8 px-2 text-center text-sm font-bold rounded-lg bg-background border border-border focus:border-primary/50 outline-none"
                                                min="1"
                                            />
                                        </div>

                                        <div className="col-span-2 flex justify-end">
                                            <input
                                                type="number"
                                                value={item.sellingPrice}
                                                onChange={(e) => onUpdateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                                className="w-20 h-8 px-2 text-right text-sm font-bold rounded-lg bg-background border border-border focus:border-primary/50 outline-none"
                                            />
                                        </div>

                                        {/* Per-Item Discount Input with Toggle */}
                                        <div className="col-span-2 flex justify-end">
                                            <div className="relative w-20">
                                                <input
                                                    type="number"
                                                    value={item.discount}
                                                    onChange={(e) => onUpdateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 text-right text-sm rounded-lg bg-background border border-border focus:border-primary/50 outline-none placeholder:text-muted-foreground/30"
                                                />
                                                <button
                                                    onClick={() => onToggleDiscountType(item.id)}
                                                    className="absolute -top-2 -right-1 h-4 px-1 bg-card text-[8px] border border-border rounded font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {item.discountType === 'PERCENTAGE' ? '%' : currency}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-1 text-right">
                                            <p className="font-black text-sm text-primary">
                                                {(lineTotalRef - itemDiscountValue).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onToggleCost(item.id)}
                                                className={`p-2 rounded-lg transition-colors ${item.showCostUI ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                                                title="Edit Cost"
                                            >
                                                {item.showCostUI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {item.showCostUI && (
                                        <div className="mt-3 pl-[33%] pr-[8%]">
                                            <div className="bg-muted/40 p-2 rounded-lg border border-border/50 flex gap-4 items-center justify-end">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Unit Cost:</span>
                                                    <input
                                                        type="number"
                                                        value={item.unitCost}
                                                        onChange={(e) => onUpdateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                                        className="w-20 h-7 px-2 text-xs font-bold rounded bg-background border border-border focus:border-primary/50 outline-none"
                                                    />
                                                </div>
                                                <div className="w-px h-4 bg-border/50" />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Total Cost:</span>
                                                    <input
                                                        type="number"
                                                        value={item.unitCost * item.quantity}
                                                        onChange={(e) => {
                                                            const totalCost = parseFloat(e.target.value) || 0;
                                                            const newUnitCost = item.quantity > 0 ? totalCost / item.quantity : totalCost;
                                                            onUpdateItem(item.id, 'unitCost', newUnitCost);
                                                        }}
                                                        className="w-24 h-7 px-2 text-xs font-bold rounded bg-background border border-border focus:border-primary/50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
