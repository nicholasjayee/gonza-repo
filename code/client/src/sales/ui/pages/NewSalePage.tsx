import React from 'react';
import { SaleForm } from '../components/SaleForm';
import { ShoppingCart } from 'lucide-react';


interface NewSalePageProps {
    saleId?: string;
}

export default function NewSalePage({ saleId }: NewSalePageProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingCart className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">POS</h4>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground/90">
                        New <span className="text-primary italic">Sale</span>
                    </h1>
                </div>
            </div>

            <SaleForm saleId={saleId} />
        </div>
    );
}
