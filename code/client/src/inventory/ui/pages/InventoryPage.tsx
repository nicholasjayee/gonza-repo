/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  ClipboardList,
  ShoppingBag,
  Package,
  TrendingDown,
  Info,
  Plus,
  FileDown,
  Scan,
  Loader2,
} from "lucide-react";
import { InventoryDashboard } from "../components/InventoryDashboard";
import { StockTakingTab } from "../components/StockTakingTab";
import { RequisitionList } from "../components/RequisitionList";
import {
  getInventoryOverviewAction,
  getInventoryMovementsAction,
  getSalesInventoryAnalysisAction,
  getRequisitionsAction,
} from "../../api/controller";
import {
  InventoryStats,
  InventoryMovement,
} from "../../api/inventory-analytics-service";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { BranchFilter } from "@/shared/components/BranchFilter";

interface InventoryPageProps {
  branchType?: string;
  branches?: { id: string; name: string }[];
}

export default function InventoryPage({
  branchType,
  branches = [],
}: InventoryPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "analysis" | "restocks" | "requisitions" | "stock-taking"
  >("overview");
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExportAnalysis = (formatType: "excel" | "pdf") => {
    if (!analysis) return;

    const data = [
      { Metric: "In Inventory Sales", Value: `${analysis.inStockSales} Items` },
      {
        Metric: "Out of Inventory Sales",
        Value: `${analysis.outOfStockSales} Items`,
      },
      { Metric: "Total Sales Analyzed", Value: `${analysis.totalSales} Items` },
    ];

    if (formatType === "excel") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory Analysis");
      XLSX.writeFile(
        wb,
        `inventory_analysis_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
      );
    } else {
      const doc = new jsPDF();
      doc.text("Inventory Items Sold Analysis Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        14,
        22,
      );

      autoTable(doc, {
        startY: 30,
        head: [["Metric", "Value"]],
        body: data.map((item) => [item.Metric, item.Value]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }, // Primary color
      });

      doc.save(`inventory_analysis_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
    }
  };

  async function loadData(filterBranchId?: string | null) {
    setIsRefreshing(true);
    try {
      const [overviewRes, movementsRes, analysisRes, requisitionsRes] =
        await Promise.all([
          getInventoryOverviewAction(filterBranchId || undefined),
          getInventoryMovementsAction(50, filterBranchId || undefined),
          getSalesInventoryAnalysisAction(filterBranchId || undefined),
          getRequisitionsAction(filterBranchId || undefined),
        ]);

      if (overviewRes.success) setStats(overviewRes.data as InventoryStats);
      if (movementsRes.success)
        setMovements(movementsRes.data as InventoryMovement[]);
      if (analysisRes.success) setAnalysis(analysisRes.data);
      if (requisitionsRes.success) setRequisitions(requisitionsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(selectedBranchId);
  }, [selectedBranchId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-muted-foreground">
          Analyzing inventory data...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black italic tracking-tight">
              Inventory Control
            </h1>
            {isRefreshing && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Real-time stock tracking and business intelligence
          </p>
        </div>

        {branchType === "MAIN" && branches.length > 0 && (
          <div className="bg-card border border-border p-3 rounded-2xl shadow-sm">
            <BranchFilter
              branches={branches}
              selectedBranchId={selectedBranchId}
              onBranchChange={setSelectedBranchId}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto pb-px">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Overview"
        />
        <TabButton
          active={activeTab === "analysis"}
          onClick={() => setActiveTab("analysis")}
          icon={<BarChart3 className="w-4 h-4" />}
          label="Items Sold Analysis"
        />
        <TabButton
          active={activeTab === "stock-taking"}
          onClick={() => setActiveTab("stock-taking")}
          icon={<Scan className="w-4 h-4" />}
          label="Stock Taking"
        />
        <TabButton
          active={activeTab === "restocks"}
          onClick={() => setActiveTab("restocks")}
          icon={<Clock className="w-4 h-4" />}
          label="Restock History"
        />
        <TabButton
          active={activeTab === "requisitions"}
          onClick={() => setActiveTab("requisitions")}
          icon={<ClipboardList className="w-4 h-4" />}
          label="Requisitions"
        />
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "overview" && stats && (
          <InventoryDashboard stats={stats} />
        )}

        {activeTab === "stock-taking" && <StockTakingTab />}

        {activeTab === "analysis" && analysis && (
          <div className="space-y-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleExportAnalysis("excel")}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border"
              >
                <FileDown className="w-4 h-4 text-emerald-500" />
                Export as Excel
              </button>
              <button
                onClick={() => handleExportAnalysis("pdf")}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border"
              >
                <FileDown className="w-4 h-4 text-rose-500" />
                Export as PDF
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-8 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                    In Inventory Sales
                  </p>
                  <h4 className="text-3xl font-black italic">
                    {analysis.inStockSales} Items
                  </h4>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-card border border-border p-8 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                    Out of Inventory Sales
                  </p>
                  <h4 className="text-3xl font-black italic text-rose-500">
                    {analysis.outOfStockSales} Items
                  </h4>
                </div>
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex items-start gap-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs font-medium text-blue-700/80 leading-relaxed italic">
                This analysis identifies sales made when stock levels were zero
                or unavailable. Consistently high "Out of Inventory" sales
                indicate potential lost revenue or inaccurate tracking.
              </p>
            </div>
          </div>
        )}

        {activeTab === "restocks" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => router.push("/inventory/restock")}
                className="h-12 px-6 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Restock Inventory
              </button>
            </div>
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Product
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Change
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      User
                    </th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {movements
                    .filter(
                      (m: any) =>
                        m.type === "RESTOCK" || m.type === "ADJUSTMENT",
                    )
                    .map((movement: any) => (
                      <tr
                        key={movement.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black">
                            {movement.productName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm">
                            {movement.productName}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black ${movement.quantityChange > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}
                          >
                            {movement.quantityChange > 0 ? "+" : ""}
                            {movement.quantityChange} Units
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                          {movement.userName}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-bold">
                              {format(
                                new Date(movement.createdAt),
                                "MMM dd, yyyy",
                              )}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {format(new Date(movement.createdAt), "hh:mm a")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requisitions" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => router.push("/inventory/requisitions/create")}
                className="h-12 px-6 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Requisition
              </button>
            </div>
            <RequisitionList
              requisitions={requisitions}
              onRefresh={() => {
                // Simple refresh by re-running effect or similar
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </button>
  );
}
