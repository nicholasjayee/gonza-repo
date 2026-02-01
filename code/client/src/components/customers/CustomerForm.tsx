"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { DialogFooter } from "@/components/ui/dialog";
import { useCustomerCategories } from "@/hooks/useCustomerCategories";

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: Partial<Customer>) => Promise<boolean>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { categories } = useCustomerCategories();
  
  // Initialize date state with proper timezone handling 
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (initialData?.birthday) {
      console.log('Initial birthday from props:', initialData.birthday);
      return initialData.birthday;
    }
    return undefined;
  });
  
  // Initialize category selection - use "none" instead of empty string
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(
    initialData?.categoryId || "none"
  );
  
  // Log the initial birthday from props to help debug
  React.useEffect(() => {
    if (initialData?.birthday) {
      console.log('Initial birthday from props:', initialData.birthday);
      console.log('Is Date object:', initialData.birthday instanceof Date);
      console.log('Date string:', initialData.birthday.toString());
    }
  }, [initialData?.birthday]);
  
  const [socialMedia, setSocialMedia] = React.useState({
    facebook: initialData?.socialMedia?.facebook || "",
    instagram: initialData?.socialMedia?.instagram || "",
    twitter: initialData?.socialMedia?.twitter || "",
    linkedin: initialData?.socialMedia?.linkedin || "",
    other: initialData?.socialMedia?.other || "",
  });
  
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = React.useState("");
  const [selectedGender, setSelectedGender] = React.useState(initialData?.gender || "");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      location: initialData?.location || "",
      gender: initialData?.gender || "",
      notes: initialData?.notes || "",
    },
  });

  const addTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSocialMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    platform: string
  ) => {
    setSocialMedia({
      ...socialMedia,
      [platform]: e.target.value,
    });
  };

  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Log the date to help debug
      console.log('Selected date before submission:', date);
      
      const customerData: Partial<Customer> = {
        ...data,
        gender: selectedGender,
        birthday: date, // This is the Date object that needs to be correctly handled
        categoryId: selectedCategoryId === "none" ? null : selectedCategoryId, // Convert "none" back to null
        socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : null,
        tags: tags.length > 0 ? tags : null,
      };
      
      console.log('Submitting customer data:', customerData);
      await onSubmit(customerData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate years for the dropdown (100 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  // Months array for the dropdown
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Handle date selection directly from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    console.log('Date selected from calendar:', selectedDate);
    
    if (selectedDate) {
      // When selecting a date, set it at noon UTC to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Create new date at UTC noon to prevent date shifts
      const correctedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
      console.log('Corrected date with UTC noon:', correctedDate);
      
      setDate(correctedDate);
    } else {
      setDate(undefined);
    }
  };

  // Handle year selection with proper date validation
  const handleYearSelect = (year: string) => {
    try {
      const yearNum = parseInt(year);
      const newDate = date ? new Date(date) : new Date();
      
      // Create a UTC date at noon to prevent timezone issues
      const correctedDate = new Date(Date.UTC(
        yearNum,
        newDate.getMonth(),
        newDate.getDate(),
        12, 0, 0
      ));
      
      // Check if the resulting date is valid
      if (!isNaN(correctedDate.getTime())) {
        setDate(correctedDate);
        console.log('Year selected, new date:', correctedDate);
      } else {
        console.error('Invalid date after setting year:', year);
      }
    } catch (error) {
      console.error('Error setting year:', error);
    }
  };

  // Handle month selection with proper date validation
  const handleMonthSelect = (month: string) => {
    try {
      const monthNum = parseInt(month);
      const newDate = date ? new Date(date) : new Date();
      
      // Create a UTC date at noon to prevent timezone issues
      const correctedDate = new Date(Date.UTC(
        newDate.getFullYear(),
        monthNum,
        newDate.getDate(),
        12, 0, 0
      ));
      
      // Check if the resulting date is valid
      if (!isNaN(correctedDate.getTime())) {
        setDate(correctedDate);
        console.log('Month selected, new date:', correctedDate);
      } else {
        console.error('Invalid date after setting month:', month);
      }
    } catch (error) {
      console.error('Error setting month:', error);
    }
  };

  // Filter categories to ensure no empty IDs
  const validCategories = categories.filter(category => category.id && category.id.trim() !== '');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name*</Label>
            <Input
              id="fullName"
              {...register("fullName", { required: "Name is required" })}
              className={cn(errors.fullName && "border-red-500")}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs">
                {errors.fullName.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {validCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={cn(errors.email && "border-red-500")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={selectedGender}
              onValueChange={setSelectedGender}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Birthday</Label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {date ? date.getDate() : "Day"}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        captionLayout="dropdown"
                        className="p-3 pointer-events-auto"
                        classNames={{
                          caption_label: "hidden",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Select
                    value={date ? String(date.getMonth()) : undefined}
                    onValueChange={handleMonthSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    value={date ? String(date.getFullYear()) : undefined}
                    onValueChange={handleYearSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {date && (
                <div className="text-sm text-muted-foreground">
                  Selected: {date ? format(date, "PPP") : "No date selected"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-gray-200"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove tag</span>
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Social Media</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="facebook" className="text-xs">
                Facebook
              </Label>
              <Input
                id="facebook"
                value={socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange(e, "facebook")}
                placeholder="Username or URL"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instagram" className="text-xs">
                Instagram
              </Label>
              <Input
                id="instagram"
                value={socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange(e, "instagram")}
                placeholder="Username without @"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitter" className="text-xs">
                Twitter/X
              </Label>
              <Input
                id="twitter"
                value={socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange(e, "twitter")}
                placeholder="Username without @"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="linkedin" className="text-xs">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={socialMedia.linkedin}
                onChange={(e) => handleSocialMediaChange(e, "linkedin")}
                placeholder="Profile URL or username"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Birthday</Label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {date ? date.getDate() : "Day"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      captionLayout="dropdown"
                      className="p-3 pointer-events-auto"
                      classNames={{
                        caption_label: "hidden",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Select
                  value={date ? String(date.getMonth()) : undefined}
                  onValueChange={handleMonthSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={date ? String(date.getFullYear()) : undefined}
                  onValueChange={handleYearSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {date && (
              <div className="text-sm text-muted-foreground">
                Selected: {date ? format(date, "PPP") : "No date selected"}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            rows={4}
            placeholder="Add any notes about this customer..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
};

export default CustomerForm;
