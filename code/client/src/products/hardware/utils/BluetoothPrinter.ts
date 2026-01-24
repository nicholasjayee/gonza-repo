
import EscPosEncoder from 'esc-pos-encoder';

export interface PrinterDevice {
    name: string;
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    characteristic: BluetoothRemoteGATTCharacteristic;
}

class BluetoothPrinter {
    private device: PrinterDevice | null = null;
    private readonly STORAGE_KEY = 'gonza_preferred_printer_id';

    async autoConnect(): Promise<string | null> {
        console.log("🔍 BT: Attempting auto-connect...");
        try {
            if (typeof window === 'undefined') return null;

            if (!navigator.bluetooth) {
                console.warn("🔍 BT: Web Bluetooth is NOT supported in this browser.");
                return null;
            }

            if (!navigator.bluetooth.getDevices) {
                console.warn("🔍 BT: Persistent permissions (getDevices) is NOT supported. Manual selection is required after refresh.");
                return null;
            }

            const devices = await navigator.bluetooth.getDevices();
            const preferredId = localStorage.getItem(this.STORAGE_KEY);

            console.log(`🔍 BT: Found ${devices.length} permitted devices. Preferred ID: ${preferredId}`);

            if (!preferredId || devices.length === 0) {
                console.log("🔍 BT: No saved device or no permitted devices found.");
                return null;
            }

            const targetDevice = devices.find(d => d.id === preferredId);
            if (!targetDevice) {
                console.warn("🔍 BT: Saved device not found in permitted list.");
                return null;
            }

            console.log(`🔍 BT: Found target device: ${targetDevice.name}. Establishing connection...`);
            return await this.establishConnection(targetDevice);
        } catch (e) {
            console.error("🔍 BT: Auto-connect failed:", e);
            return null;
        }
    }

    private async establishConnection(device: BluetoothDevice): Promise<string> {
        console.log(`🔗 BT: Connecting to ${device.name}...`);
        if (!device.gatt) throw new Error("GATT not available on device.");

        // Connect with retry logic
        let server: BluetoothRemoteGATTServer | null = null;
        let retries = 3;
        while (retries > 0) {
            try {
                server = await device.gatt.connect();
                if (server.connected) {
                    console.log("🔗 BT: GATT Connected.");
                    break;
                }
            } catch (e) {
                retries--;
                console.warn(`🔗 BT: Connection attempt failed. Retries left: ${retries}`, e);
                if (retries === 0) throw e;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!server || !server.connected) throw new Error("Failed to establish GATT connection.");

        // Monitor disconnection
        device.addEventListener('gattserverdisconnected', () => {
            console.warn("🔗 BT: Printer lost connection (gattserverdisconnected).");
            this.device = null;
            // We don't remove storage key here so auto-connect can try again later
        });

        // Try to find the printing characteristic
        let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

        // Common service/characteristic pairs for thermal printers
        const possibleServices = [0xff00, '000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb'];

        for (const serviceUuid of possibleServices) {
            try {
                console.log(`🔗 BT: Trying service ${serviceUuid}...`);
                const service = await server.getPrimaryService(serviceUuid);
                const characteristics = await service.getCharacteristics();
                const writeChar = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);
                if (writeChar) {
                    characteristic = writeChar;
                    console.log(`🔗 BT: Found write characteristic: ${writeChar.uuid}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // Global fallback: Search ALL services if specific ones failed
        if (!characteristic) {
            console.log("🔗 BT: Searching all primary services...");
            const services = await server.getPrimaryServices();
            for (const service of services) {
                try {
                    const chars = await service.getCharacteristics();
                    const writeChar = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
                    if (writeChar) {
                        characteristic = writeChar;
                        console.log(`🔗 BT: Found write characteristic in alternative service: ${service.uuid}`);
                        break;
                    }
                } catch (e) { continue; }
            }
        }

        if (!characteristic) throw new Error("Could not find a writable printer characteristic.");

        this.device = {
            name: device.name || 'Unknown Printer',
            device,
            server,
            characteristic
        };

        localStorage.setItem(this.STORAGE_KEY, device.id);
        console.log(`✅ BT: Successfully connected to ${this.device.name}`);
        return this.device.name;
    }

    async connect(): Promise<string> {
        try {
            if (!navigator.bluetooth) {
                throw new Error("Web Bluetooth is not supported in this browser.");
            }

            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
                    { services: [0xff00] },
                    { namePrefix: 'SPRT' },
                    { namePrefix: 'MTP' },
                    { namePrefix: 'L31' },
                    { namePrefix: 'Printer' }
                ],
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 0xff00]
            });

            return await this.establishConnection(device);
        } catch (error: any) {
            console.error("Bluetooth connection error:", error);
            throw error;
        }
    }

    async disconnect() {
        if (this.device?.device.gatt?.connected) {
            this.device.device.gatt.disconnect();
        }
        this.device = null;
        localStorage.removeItem(this.STORAGE_KEY);
    }

    isConnected(): boolean {
        return !!(this.device?.device.gatt?.connected);
    }

    getDeviceName(): string | null {
        return this.device?.name || null;
    }

    async printBarcode(data: { name: string, barcode: string, price: number, currency: string }) {
        if (!this.isConnected() && localStorage.getItem(this.STORAGE_KEY)) {
            await this.autoConnect();
        }

        if (!this.device || !this.isConnected()) {
            throw new Error("Printer not connected.");
        }

        const encoder = new EscPosEncoder();
        const result = encoder
            .initialize()
            .codepage('cp850')
            .align('center')
            .newline()
            .size('double')
            .text(data.name.toUpperCase())
            .newline()
            .newline()
            .size('normal')
            .barcode(data.barcode, 'code128', {
                width: 2,
                height: 120,
                displayValue: false
            })
            .newline()
            .size('double')
            .text(data.barcode)
            .newline()
            .newline()
            .newline()
            .newline()
            .newline()
            .newline()
            .cut()
            .encode();

        const CHUNK_SIZE = 64;
        for (let i = 0; i < result.length; i += CHUNK_SIZE) {
            const chunk = result.slice(i, i + CHUNK_SIZE);
            if (this.device.characteristic.properties.writeWithoutResponse) {
                await this.device.characteristic.writeValueWithoutResponse(chunk);
            } else {
                await this.device.characteristic.writeValue(chunk);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async printReceipt(sale: any) {
        if (!this.isConnected() && localStorage.getItem(this.STORAGE_KEY)) {
            await this.autoConnect();
        }

        if (!this.device || !this.isConnected()) {
            throw new Error("Printer not connected.");
        }

        const encoder = new EscPosEncoder();

        // Calculate totals
        const subtotal = sale.subtotal || 0;
        const discount = sale.discount || 0;
        const tax = sale.taxAmount || 0;
        const total = sale.total || 0;
        const paid = sale.amountPaid || 0;
        const balance = sale.balance || 0;

        let result = encoder
            .initialize()
            .codepage('cp850')
            .align('center')
            .size('double')
            .text('GONZA SYSTEM')
            .newline()
            .size('normal')
            .text('Quality & Excellence')
            .newline()
            .text('--------------------------------')
            .newline()
            .align('left')
            .text(`Sale #: ${sale.saleNumber}`)
            .newline()
            .text(`Date  : ${new Date(sale.date).toLocaleString()}`)
            .newline()
            .text(`Cust  : ${sale.customerName}`)
            .newline()
            .text('--------------------------------')
            .newline()
            .text('Item             Qty      Total')
            .newline()
            .text('--------------------------------')
            .newline();

        // Add items
        sale.items.forEach((item: any) => {
            const name = (item.productName || item.product?.name || 'Item').substring(0, 15).padEnd(16);
            const qty = item.quantity.toString().padEnd(7);
            const lineTotal = item.lineTotal.toLocaleString().padStart(8);
            result = result.text(`${name}${qty}${lineTotal}`).newline();
        });

        result = result
            .text('--------------------------------')
            .newline()
            .align('right')
            .text(`Subtotal: UGX ${subtotal.toLocaleString()}`)
            .newline();

        if (discount > 0) {
            result = result.text(`Discount: -UGX ${discount.toLocaleString()}`).newline();
        }

        if (tax > 0) {
            result = result.text(`Tax (${sale.taxRate}%): +UGX ${tax.toLocaleString()}`).newline();
        }

        const finalResult = result
            .size('double')
            .text(`TOTAL: UGX ${total.toLocaleString()}`)
            .newline()
            .size('normal')
            .text('--------------------------------')
            .newline()
            .text(`Paid: UGX ${paid.toLocaleString()}`)
            .newline()
            .text(`Balance: UGX ${balance.toLocaleString()}`)
            .newline()
            .text('--------------------------------')
            .newline()
            .align('center')
            .newline()
            .text('Thank you for your business!')
            .newline()
            .newline()
            .newline()
            .cut()
            .encode();

        const CHUNK_SIZE = 64;
        for (let i = 0; i < finalResult.length; i += CHUNK_SIZE) {
            const chunk = finalResult.slice(i, i + CHUNK_SIZE);
            if (this.device.characteristic.properties.writeWithoutResponse) {
                await this.device.characteristic.writeValueWithoutResponse(chunk);
            } else {
                await this.device.characteristic.writeValue(chunk);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

export const bluetoothPrinter = new BluetoothPrinter();
