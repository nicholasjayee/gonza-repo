import React from 'react';
import { Building2 } from 'lucide-react';

const NoBusinessState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No Business Selected</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Please select or create a business/branch to view sales records.
                </p>
            </div>
        </div>
    );
};

export default NoBusinessState;
