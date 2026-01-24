
declare module 'esc-pos-encoder' {
    export default class EscPosEncoder {
        constructor();
        initialize(): this;
        codepage(value: string): this;
        align(value: 'left' | 'center' | 'right'): this;
        size(value: 'normal' | 'small' | 'double-height' | 'double-width' | 'double'): this;
        text(value: string): this;
        newline(): this;
        barcode(value: string, type: 'upca' | 'upce' | 'ean13' | 'ean8' | 'code39' | 'itf' | 'codabar' | 'code93' | 'code128', options?: {
            width?: 1 | 2 | 3 | 4 | 5 | 6;
            height?: number;
            position?: 'none' | 'top' | 'bottom' | 'both';
            font?: 'a' | 'b';
            displayValue?: boolean;
        }): this;
        qrcode(value: string, options?: {
            model?: 1 | 2;
            size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
            errorlevel?: 'l' | 'm' | 'q' | 'h';
        }): this;
        image(image: any, width: number, height: number, algorithm?: 'threshold' | 'bayer' | 'floydsteinberg' | 'atkinson'): this;
        cut(partial?: boolean): this;
        pulse(pin?: 0 | 1, on?: number, off?: number): this;
        encode(): Uint8Array;
    }
}
