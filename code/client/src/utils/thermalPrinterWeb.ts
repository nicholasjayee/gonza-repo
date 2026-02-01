

export async function printWeb(data: string): Promise<{ success: boolean; message: string }> {
  if (!('serial' in navigator)) {
    return { success: false, message: 'Web Serial API not supported.' };
  }

  try {
    const ports: SerialPort[] = await navigator.serial.getPorts();
    const port = ports.length ? ports[0] : await navigator.serial.requestPort();
    if (!port.readable || !port.writable) await port.open({ baudRate: 9600 });

    if (!port.writable) throw new Error('Port not writable');
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(data + '\n\n\n'));
    writer.releaseLock();


    return { success: true, message: 'Web print sent successfully.' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Web print failed: ${errorMessage}` };
  }
}
