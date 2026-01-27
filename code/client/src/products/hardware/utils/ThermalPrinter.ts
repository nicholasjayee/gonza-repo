
import EscPosEncoder from 'esc-pos-encoder';

export interface PrinterDevice {
    name: string;
    type: 'BRIDGE';
    status?: string;
}

const BRIDGE_URL = 'http://localhost:5000';

class ThermalPrinter {
    private activeDevice: PrinterDevice | null = null;
    private isConnecting = false;

    public readonly BRIDGE_PRINTER_KEY = 'gonza_preferred_bridge_printer';
    public readonly LABEL_WIDTH_KEY = 'gonza_preferred_label_width';
    public readonly PRINTER_MODE_KEY = 'gonza_preferred_printer_mode';

    private labelTemplate: '1_INCH' | '2_INCH' = '2_INCH';

    constructor() {
        if (typeof window !== 'undefined') {
            const savedLabel = localStorage.getItem(this.LABEL_WIDTH_KEY);
            const validLabels = ['1_INCH', '2_INCH'];
            if (savedLabel && validLabels.includes(savedLabel)) {
                this.labelTemplate = savedLabel as any;
            }
        }
    }

    async checkBridge(): Promise<boolean> {
        try {
            const res = await fetch(`${BRIDGE_URL}/`, { signal: AbortSignal.timeout(2000) });
            return res.ok;
        } catch {
            return false;
        }
    }

    async getBridgePrinters(): Promise<PrinterDevice[]> {
        try {
            const res = await fetch(`${BRIDGE_URL}/printers`, { signal: AbortSignal.timeout(3000) });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((p: any) => ({
                name: p.name,
                type: 'BRIDGE',
                status: p.status
            }));
        } catch (e) {
            console.error("Failed to fetch bridge printers:", e);
            return [];
        }
    }

    async connectBridgePrinter(name: string) {
        this.activeDevice = {
            name,
            type: 'BRIDGE'
        };
        localStorage.setItem(this.BRIDGE_PRINTER_KEY, name);
        localStorage.setItem(this.PRINTER_MODE_KEY, 'BRIDGE');
        return name;
    }

    async autoConnect(): Promise<string | null> {
        if (this.isConnecting) return null;
        if (this.isConnected()) return this.activeDevice?.name || null;

        this.isConnecting = true;
        try {
            if (typeof window === 'undefined') return null;

            const bridgeActive = await this.checkBridge();
            if (bridgeActive) {
                const savedBridgePrinter = localStorage.getItem(this.BRIDGE_PRINTER_KEY);
                if (savedBridgePrinter) {
                    this.activeDevice = { name: savedBridgePrinter, type: 'BRIDGE' };
                    return savedBridgePrinter;
                }
            }

            return null;
        } catch (e) {
            console.error("🔍 Thermal: Auto-connect failed:", e);
            return null;
        } finally {
            this.isConnecting = false;
        }
    }

    async disconnect() {
        this.activeDevice = null;
        localStorage.removeItem(this.BRIDGE_PRINTER_KEY);
    }

    isConnected(): boolean {
        return !!this.activeDevice && this.activeDevice.type === 'BRIDGE';
    }

    getDeviceName(): string | null {
        return this.activeDevice?.name || null;
    }

    getDeviceType(): 'BRIDGE' | null {
        return this.activeDevice?.type || null;
    }

    getLabelTemplate(): string {
        return this.labelTemplate;
    }

    setLabelTemplate(template: '1_INCH' | '2_INCH') {
        this.labelTemplate = template;
        localStorage.setItem(this.LABEL_WIDTH_KEY, template);
    }

    async printBarcode(data: { name: string, barcode: string, price: number, currency: string }) {
        if (!this.isConnected()) {
            const connected = await this.autoConnect();
            if (!connected) throw new Error("Printer not connected.");
        }

        const content = `SIZE 40 mm, 30 mm\nGAP 3 mm, 0 mm\nCLS\nTEXT 10,10,"2",0,1,1,"${data.name.toUpperCase()}"\nBARCODE 10,40,"128",50,1,0,2,2,"${data.barcode}"\nPRINT 1\n`;
        await fetch(`${BRIDGE_URL}/print/label`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PrinterName: this.activeDevice?.name,
                Content: content
            })
        });
    }

    async printReceipt(sale: any) {
        if (!this.isConnected()) {
            const connected = await this.autoConnect();
            if (!connected) throw new Error("Printer not connected.");
        }

        const charWidth = 32;
        const line = '-'.repeat(charWidth);

        // ESC @ (Initialize) is handled by the Bridge for /print/receipt
        let content = `      GONZA SYSTEM\n   Quality & Excellence\n${line}\nSale #: ${sale.saleNumber}\nDate  : ${new Date(sale.date).toLocaleString()}\nCust  : ${sale.customerName}\n${line}\nItem           Qty     Total\n${line}\n`;

        sale.items.forEach((item: any) => {
            const prodName = (item.productName || item.product?.name || 'Item');
            const name = prodName.substring(0, 15).padEnd(16);
            const qty = item.quantity.toString().padEnd(8);
            const lineTotal = (item.lineTotal || 0).toLocaleString().padStart(9);
            content += `${name}${qty}${lineTotal}\n`;
        });

        content += `${line}\nTOTAL: UGX ${sale.total.toLocaleString()}\n      Thank you!\n\n\n\n\n`; // Extra spacing for tear-off

        await fetch(`${BRIDGE_URL}/print/receipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PrinterName: this.activeDevice?.name,
                Content: content
            })
        });
    }

    async syncGap() {
        // Not needed for bridge currently
    }

    async printTest() {
        const name = this.activeDevice?.name?.toUpperCase() || "";
        const isReceiptPrinter = name.includes("POS") || name.includes("58") || name.includes("XP") || name.includes("PRINTER");

        if (isReceiptPrinter) {
            await this.printReceipt({
                saleNumber: "TEST-001",
                date: new Date(),
                customerName: "TEST CUSTOMER",
                total: 10000,
                items: [
                    { productName: "Test Item", quantity: 1, lineTotal: 10000 }
                ]
            });
        } else {
            await this.printBarcode({ name: 'Test Product', barcode: '123456', price: 0, currency: 'TEST' });
        }
    }
}

export const thermalPrinter = new ThermalPrinter();
