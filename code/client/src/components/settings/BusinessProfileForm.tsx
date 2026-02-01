import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus, Building } from 'lucide-react';
import NextImage from 'next/image';
import { BusinessSettings } from '@/hooks/useBusinessSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessProfileFormProps {
  settings: BusinessSettings;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  settings,
  onSettingsChange,
  onLogoChange,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          <CardTitle>Business Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessLogo">Business Logo</Label>
          <div className="flex items-center space-x-4">
            {settings.businessLogo && (
              <NextImage
                src={settings.businessLogo}
                alt="Business Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            )}
            <div className="flex-1">
              <Input
                id="businessLogo"
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('businessLogo')?.click()}
                className="w-full"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            value={settings.currency}
            onChange={onSettingsChange}
            placeholder="Enter your preferred currency (e.g., USD, EUR, GBP)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPrintFormat">Default Receipt Format</Label>
          <Select
            value={settings.defaultPrintFormat || 'standard'}
            onValueChange={(value) => onSettingsChange({ target: { name: 'defaultPrintFormat', value } })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select default receipt format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Receipt (A4/Letter)</SelectItem>
              <SelectItem value="thermal">Thermal Receipt (80mm)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the default format for printing receipts. You can still switch formats when printing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={settings.businessName}
            onChange={onSettingsChange}
            placeholder="Enter your business name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address</Label>
          <Input
            id="businessAddress"
            name="businessAddress"
            value={settings.businessAddress}
            onChange={onSettingsChange}
            placeholder="Enter your business address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business Phone</Label>
          <Input
            id="businessPhone"
            name="businessPhone"
            value={settings.businessPhone}
            onChange={onSettingsChange}
            placeholder="Enter your business phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessEmail">Business Email</Label>
          <Input
            id="businessEmail"
            name="businessEmail"
            value={settings.businessEmail}
            onChange={onSettingsChange}
            type="email"
            placeholder="Enter your business email"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileForm;