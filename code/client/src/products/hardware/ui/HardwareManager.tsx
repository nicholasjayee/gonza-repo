import React, { useState, useEffect } from "react";
import {
  Printer,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Download,
  Cpu,
  Power,
} from "lucide-react";
import { thermalPrinter, PrinterDevice } from "../utils/ThermalPrinter";

export function HardwareManager() {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelTemplate, setLabelTemplate] = useState<"1_INCH" | "2_INCH">(
    thermalPrinter.getLabelTemplate() as any,
  );
  const [bridgePrinters, setBridgePrinters] = useState<PrinterDevice[]>([]);
  const [isBridgeRunning, setIsBridgeRunning] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      // Check bridge status
      const bridgeOk = await thermalPrinter.checkBridge();
      setIsBridgeRunning(bridgeOk);

      if (bridgeOk) {
        const printers = await thermalPrinter.getBridgePrinters();
        setBridgePrinters(printers);
      }

      if (thermalPrinter.isConnected()) {
        setStatus("connected");
        setDeviceName(thermalPrinter.getDeviceName());
      } else {
        const name = await thermalPrinter.autoConnect();
        if (name) {
          setStatus("connected");
          setDeviceName(name);
        }
      }
    };
    init();

    const interval = setInterval(async () => {
      const bridgeOk = await thermalPrinter.checkBridge();
      setIsBridgeRunning(bridgeOk);
      if (bridgeOk) {
        const printers = await thermalPrinter.getBridgePrinters();
        setBridgePrinters(printers);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConnectBridgePrinter = async (name: string) => {
    try {
      setStatus("connecting");
      await thermalPrinter.connectBridgePrinter(name);
      setDeviceName(name);
      setStatus("connected");
    } catch (e: any) {
      setError(e.message);
      setStatus("disconnected");
    }
  };

  const handleDisconnect = async () => {
    await thermalPrinter.disconnect();
    setStatus("disconnected");
    setDeviceName(null);
  };

  const handleLabelWidthChange = (width: "1_INCH" | "2_INCH") => {
    setLabelTemplate(width);
    thermalPrinter.setLabelTemplate(width);
  };

  const handleTestPrint = async () => {
    try {
      setError(null);
      await thermalPrinter.printTest();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm animate-in fade-in duration-500">
      {/* Bridge Status & Download */}
      {!isBridgeRunning && isBridgeRunning !== null && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-700">
                Printer Bridge Offline
              </p>
              <p className="text-[10px] text-amber-600/80">
                Install the bridge to use thermal printers.
              </p>
            </div>
          </div>
          <a
            href="/PrinterBridge-Setup.zip"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Printer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              Thermal Printer
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${status === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : status === "connecting" ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`}
              />
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                {status === "connected"
                  ? `Online: ${deviceName}`
                  : status === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <button
              onClick={handleDisconnect}
              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Disconnect"
            >
              <XCircle className="h-4 w-4" />
            </button>
          ) : (
            <div className="p-1.5 text-muted-foreground">
              <RefreshCw
                className={`h-4 w-4 ${status === "connecting" ? "animate-spin" : ""}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bridge Printer List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3 w-3" />
            Local Printers
          </h3>
          {isBridgeRunning && (
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <Power className="h-2 w-2" /> Bridge Active
            </span>
          )}
        </div>

        <div className="grid gap-2">
          {bridgePrinters.length > 0 ? (
            bridgePrinters.map((p) => (
              <button
                key={p.name}
                onClick={() => handleConnectBridgePrinter(p.name)}
                disabled={status === "connecting"}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  deviceName === p.name
                    ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
                    : "bg-muted/30 border-transparent hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${deviceName === p.name ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {p.status || "Ready"}
                    </p>
                  </div>
                </div>
                {deviceName === p.name && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))
          ) : (
            <div className="p-6 border border-dashed border-border rounded-xl text-center">
              <p className="text-[10px] text-muted-foreground font-medium">
                {isBridgeRunning
                  ? "No printers found"
                  : "Start the Printer Bridge to see local printers"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings & Test */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Global Settings
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">
              Label Width
            </label>
            <div className="flex p-0.5 bg-muted/50 rounded-lg">
              <button
                onClick={() => handleLabelWidthChange("1_INCH")}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${labelTemplate === "1_INCH" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                1&quot;
              </button>
              <button
                onClick={() => handleLabelWidthChange("2_INCH")}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${labelTemplate === "2_INCH" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                2&quot;
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              disabled={status !== "connected"}
              onClick={handleTestPrint}
              className={`w-full py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 ${
                status === "connected"
                  ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <RefreshCw
                className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`}
              />
              Test Print
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            <p className="text-[9px] font-bold text-rose-600 line-clamp-1">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
