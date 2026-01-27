
import { thermalPrinter } from './ThermalPrinter';

export async function printBarcode(product: { name: string, barcode?: string | null, price: number, currency?: string }) {
    const { name, barcode, price, currency = "UGX" } = product;

    if (!barcode) {
        console.warn("Cannot print: No barcode associated with this product.");
        alert("The product barcode is missing. Please save the product with a barcode before printing.");
        return;
    }

    if (!name) {
        console.warn("Cannot print: No product name provided.");
        alert("Product name is required for printing labels.");
        return;
    }

    // Try thermal printer (Bridge)
    try {
        if (!thermalPrinter.isConnected()) {
            const connected = await thermalPrinter.autoConnect();
            if (!connected) {
                alert("Printer not connected. Please connect your printer via Printer Bridge in Hardware Manager.");
                return;
            }
        }
        await thermalPrinter.printBarcode({ name, barcode, price, currency });
    } catch (e) {
        console.error("Printing failed:", e);
        alert(`Printer Error: ${e instanceof Error ? e.message : 'Communication failed'}`);
    }
}

export async function printSaleReceipt(sale: any) {
    if (!sale) {
        console.warn("Cannot print: No sale data provided.");
        return;
    }

    // Try thermal printer (Bridge)
    try {
        if (!thermalPrinter.isConnected()) {
            const connected = await thermalPrinter.autoConnect();
            if (!connected) {
                alert("Printer not connected. Please connect your printer via Printer Bridge in Hardware Manager.");
                return;
            }
        }
        await thermalPrinter.printReceipt(sale);
    } catch (e) {
        console.error("Printing failed:", e);
        alert(`Printer Error: ${e instanceof Error ? e.message : 'Communication failed'}`);
    }
}
