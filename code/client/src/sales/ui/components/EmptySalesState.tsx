import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptySalesState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 p-8">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No sales records found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Get started by creating your first sale. Sales will appear here once created.
                </p>
            </div>
        </div>
    );
};

export default EmptySalesState;
