import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import BluetoothSpp from 'capacitor-bluetooth-spp';

let connectedDevice: string | null = null;


interface BluetoothDevice {
  name: string;
  address: string;
  id?: string;
  class?: number;
}

interface BluetoothInfo {
  name?: string;
  address?: string;
  message?: string;
}

// Use any cast to avoid type errors if the plugin types are incomplete
/* eslint-disable @typescript-eslint/no-explicit-any */
(BluetoothSpp as any).addListener('connected', (info: BluetoothInfo) => console.log('Event: connected', info));
(BluetoothSpp as any).addListener('connectionFailed', (info: BluetoothInfo) => console.log('Event: connectionFailed', info));
(BluetoothSpp as any).addListener('disconnected', (info: BluetoothInfo) => console.log('Event: disconnected', info));
(BluetoothSpp as any).addListener('deviceFound', (device: BluetoothDevice) => console.log('Event: deviceFound', device));
(BluetoothSpp as any).addListener('discoveryFinished', () => console.log('Event: discoveryFinished'));
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function printBluetooth(data: string) {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, message: 'Not a native platform' };
  }

  try {
    await BluetoothSpp.requestPermissions();

    // Try loading stored printer
    const saved = await Preferences.get({ key: 'selected_printer' });
    let storedPrinter = saved.value;

    // If the stored printer exists, try using it
    if (storedPrinter) {
      try {
        console.log('Trying stored printer:', storedPrinter);
        const res = await BluetoothSpp.connect({ address: storedPrinter });

        if (res?.connected) {
          connectedDevice = storedPrinter;
          console.log('Connected using stored printer.');
        } else {
          storedPrinter = null; // fallback
        }
      } catch (error) {
        console.log('Stored printer failed. Falling back to selection.', error);
        storedPrinter = null;
      }
    }

    // Fallback if no stored printer or it failed
    if (!storedPrinter && !connectedDevice) {
      console.log('Listing paired devices...');
      const paired = await BluetoothSpp.listPairedDevices();

      if (!paired?.devices?.length) {
        throw new Error('No paired devices found');
      }

      const deviceNames = paired.devices.map((d: BluetoothDevice) => d.name || d.address);

      const selection = prompt(
        `Select a Bluetooth device:\n${deviceNames
          .map((n: string, i: number) => `${i + 1}: ${n}`)
          .join('\n')}`,
        '1'
      );

      const index = parseInt(selection || '1', 10) - 1;

      if (index < 0 || index >= paired.devices.length) {
        throw new Error('Invalid device selection');
      }

      const device = paired.devices[index];
      console.log('Connecting to', device.name, device.address);

      const connectRes = await BluetoothSpp.connect({ address: device.address });

      if (!connectRes?.connected) throw new Error('Failed to connect');

      connectedDevice = device.address;

      // Store selected printer for future automatic use
      await Preferences.set({
        key: 'selected_printer',
        value: device.address,
      });

      console.log('Printer saved:', device.address);
    }

    // Send print data
    await BluetoothSpp.write({ data });

    // Feed paper (optional)
    const feedLines = "\x1B\x64\x03";
    await BluetoothSpp.write({ data: feedLines });

    return { success: true, message: 'Printed successfully' };

  } catch (err: unknown) {
    console.error('Bluetooth print failed:', err);
    try { await BluetoothSpp.disconnect(); } catch (disconnectErr) { console.log('Disconnect error', disconnectErr); }
    connectedDevice = null;

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: errorMessage };
  }
}
