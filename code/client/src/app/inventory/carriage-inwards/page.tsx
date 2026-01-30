"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/inventory/components/ui/button";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { useBusiness } from "@/inventory/contexts/BusinessContext";
import CarriageInwardsTable from "@/inventory/components/carriage/CarriageInwardsTable";
import CarriageInwardsForm from "@/inventory/components/carriage/CarriageInwardsForm";
import { useCarriageInwards, CarriageInward } from "@/inventory/hooks/useCarriageInwards";
import { useBusinessSettings } from "@/inventory/hooks/useBusinessSettings";
import { useToast } from "@/inventory/hooks/use-toast";
import { useIsMobile } from "@/inventory/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/inventory/components/ui/card";
import LoadingSpinner from "@/inventory/components/LoadingSpinner";

const CarriageInwards = () => {
  const router = useRouter();
  const { currentBusiness, isLoading: businessLoading } = useBusiness();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { settings } = useBusinessSettings();

  const {
    carriageInwards,
    isLoading,
    createCarriageInward,
    deleteCarriageInward,
    refreshCarriageInwards,
  } = useCarriageInwards();

  const [showForm, setShowForm] = useState(false);

  // Calculate summary statistics
  const totalAmount = carriageInwards.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalEntries = carriageInwards.length;
  const uniqueSuppliers = [
    ...new Set(carriageInwards.map((item) => item.supplierName)),
  ].length;
  const thisMonthEntries = carriageInwards.filter((item) => {
    const itemDate = new Date(item.date);
    const now = new Date();
    return (
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleRefresh = async () => {
    await refreshCarriageInwards();
    toast({
      title: "Data refreshed",
      description: "Carriage inwards data has been updated.",
    });
  };

  const handleEdit = (record: CarriageInward) => {
    // TODO: Implement edit functionality. For now just log or maybe reusing the form would be good if I had set up edit state.
    // The legacy code had TODO comment. I will keep it as TODO or improve if requested? 
    // Wait, the form supports editing. I can add simple state to handle editing.
    // But since I'm mostly porting, I'll follow the legacy logic which had it as TODO.
    console.log("Edit record:", record);
  };

  const handleView = (record: CarriageInward) => {
    console.log("View record:", record);
  };

  if (businessLoading || !currentBusiness || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Loading carriage inwards data...</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section - Improved Mobile Layout */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/inventory")}
              className="shrink-0 h-8 w-8"
              title="Back to inventory"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-sales-dark">
                Carriage Inwards
              </h1>
              <p className="text-xs md:text-base text-muted-foreground">
                Track transportation and delivery costs for your inventory
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons - Improved Layout */}
          {isMobile ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="flex-1 gap-2 h-9"
                  variant={showForm ? "outline" : "default"}
                >
                  <Plus size={16} /> {showForm ? "Cancel" : "Add Entry"}
                </Button>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                  className="shrink-0 h-9 w-9"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Action Buttons
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                disabled={isLoading}
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                <Plus size={16} /> {showForm ? "Cancel" : "Add Entry"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Improved Mobile Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg md:text-xl font-bold">
                {settings.currency || "USD"} {totalAmount.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Entries</p>
              <p className="text-lg md:text-xl font-bold">{totalEntries}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Suppliers</p>
              <p className="text-lg md:text-xl font-bold">{uniqueSuppliers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-lg md:text-xl font-bold">{thisMonthEntries}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-sm md:text-lg">
              Add New Carriage Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarriageInwardsForm
              onSubmit={async (data) => {
                try {
                  await createCarriageInward(data);
                  setShowForm(false);
                  toast({
                    title: "Entry created",
                    description:
                      "Carriage inwards entry has been successfully created.",
                  });
                } catch (_) {
                  toast({
                    title: "Error",
                    description: "Failed to create carriage inwards entry.",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="text-sm md:text-lg">
            Carriage Inwards Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CarriageInwardsTable
            carriageInwards={carriageInwards}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={deleteCarriageInward}
            onView={handleView}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CarriageInwards;
