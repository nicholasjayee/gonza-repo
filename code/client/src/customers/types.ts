
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Customer {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  birthday: Date | null;
  location: string | null;
  categoryId: string | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    other?: string;
  } | null;
  gender: string | null;
  tags: string[] | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbCustomer {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  birthday: string | null;
  location: string | null;
  category_id: string | null;
  social_media: Json | null;
  gender: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthday: Date | null;
  location: string;
  categoryId: string | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    other?: string;
  };
  gender: string;
  tags: string[];
  notes: string;
}

// Form validation errors
export interface FormErrors {
  customerName?: string;
  customerAddress?: string;
  customerContact?: string;
  itemDescription?: string;
  quantity?: string;
  salePrice?: string;
  costOfProduction?: string;
  taxRate?: string;
}
