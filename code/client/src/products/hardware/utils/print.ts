
import { bluetoothPrinter } from './BluetoothPrinter';

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

    // 1. Try Direct Bluetooth Printing
    if (bluetoothPrinter.isConnected()) {
        try {
            await bluetoothPrinter.printBarcode({ name, barcode, price, currency });
            return;
        } catch (e) {
            console.error("Direct printing failed:", e);
            alert(`Printer Error: ${e instanceof Error ? e.message : 'Communication failed'}`);
            return;
        }
    }

    // fallback: Just alert that printer is not connected
    console.warn("Printing cancelled: Bluetooth printer not connected.");
    alert("Printer not connected. Please pair your Bluetooth printer to print labels.");
}

export async function printSaleReceipt(sale: any) {
    if (!sale) {
        console.warn("Cannot print: No sale data provided.");
        return;
    }

    if (bluetoothPrinter.isConnected()) {
        try {
            await bluetoothPrinter.printReceipt(sale);
            return;
        } catch (e) {
            console.error("Direct printing failed:", e);
            alert(`Printer Error: ${e instanceof Error ? e.message : 'Communication failed'}`);
            return;
        }
    }

    console.warn("Printing cancelled: Bluetooth printer not connected.");
    alert("Printer not connected. Please pair your Bluetooth printer to print receipts.");
}
