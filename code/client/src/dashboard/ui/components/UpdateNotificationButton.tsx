import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';

interface UpdateNotificationButtonProps {
  onUpdate: () => void;
  isUpdating: boolean;
}

const UpdateNotificationButton: React.FC<UpdateNotificationButtonProps> = ({ 
  onUpdate, 
  isUpdating 
}) => {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
      <Download className="h-4 w-4 text-blue-600" />
      <AlertTitle>Update Available</AlertTitle>
      <AlertDescription className="flex items-center justify-between mt-2">
        <span>A new version of the application is available.</span>
        <Button 
          size="sm" 
          onClick={onUpdate} 
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Now'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default UpdateNotificationButton;
