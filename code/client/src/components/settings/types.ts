
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLogo?: string;
  currency: string;
  signature?: string;
  paymentInfo?: string; 
  defaultPrintFormat?: 'standard' | 'thermal'; 
}

export interface DbBusinessSettings {
  id?: string;
  user_id: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_logo?: string;
  currency: string;
  signature?: string;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}
