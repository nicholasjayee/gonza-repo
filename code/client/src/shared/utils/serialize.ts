export function serialize<T>(data: T): T {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'object') {
        // Handle Date objects
        if (data instanceof Date) {
            return data.toISOString() as any;
        }

        // Handle Decimal objects (Prisma)
        // Checks for 'Decimal' like object structure or instance
        if (
            (data as any).d &&
            (data as any).e &&
            (data as any).s &&
            Array.isArray((data as any).d)
        ) {
            return Number(data.toString()) as any;
        }

        // Duck typing for Prisma Decimal (has .toNumber method usually, but serialize often gets the raw object)
        // Safer to check constructor name or simple properties if converting from JSON
        // Simplest way for Prisma Decimal: check if it has .toNumber or convert via string
        if (typeof (data as any).toNumber === 'function') {
            return (data as any).toNumber();
        }

        if (Array.isArray(data)) {
            return data.map(item => serialize(item)) as any;
        }

        const serialized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                serialized[key] = serialize((data as any)[key]);
            }
        }
        return serialized;
    }

    return data;
}
