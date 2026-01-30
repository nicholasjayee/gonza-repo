import { BusinessSettings } from "@/inventory/types/";

export const useBusinessSettings = () => {
  const settings: BusinessSettings = {
    businessName: "My Business",
    businessAddress: "123 Main St",
    businessPhone: "123-456-7890",
    businessEmail: "info@mybusiness.com",
    currency: "UGX",
  };
  return {
    settings,
    isLoading: false,
    updateSettings: async () => {},
  };
};
