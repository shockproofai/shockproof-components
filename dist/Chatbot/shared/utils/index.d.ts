export * from './cn';
export declare const classNames: (...classes: (string | undefined | null | false)[]) => string;
export declare const formatDate: (date: Date, format?: "short" | "long" | "time") => string;
export declare const truncateText: (text: string, maxLength: number) => string;
export declare const generateId: () => string;
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void;
