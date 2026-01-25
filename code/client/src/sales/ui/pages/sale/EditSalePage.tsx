import React from 'react';
import { SaleForm } from '../../components/SaleForm';
import { Sale } from '../../../types';
import { Edit3 } from 'lucide-react';
import { BackButton } from './components/BackButton';

interface EditSalePageProps {
    sale: Sale;
}

export const EditSalePage: React.FC<EditSalePageProps> = ({ sale }) => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <BackButton />
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                        <Edit3 className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Editor Mode</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Edit Sale <span className="text-muted-foreground/40 text-sm font-bold">#{sale.saleNumber}</span>
                    </h1>
                </div>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500">
                <SaleForm initialData={sale} />
            </div>
        </div>
    );
};
