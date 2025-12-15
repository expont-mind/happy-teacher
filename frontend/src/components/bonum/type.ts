// Bonum API types
export interface BonumInvoiceItem {
    image?: string;
    title: string;
    remark?: string;
    amount: number;
    count: number;
}

export interface BonumExtra {
    placeholder: string;
    type: 'PHONE' | 'NUMBER' | 'EMAIL' | 'TEXT' | 'ALL';
    required: boolean;
}

export interface CreateInvoiceButtonProps {
    amount: number;
    callback: string;
    transactionId: string;
    expiresIn?: number;
    items?: BonumInvoiceItem[];
    extras?: BonumExtra[];
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    className?: string;
    children?: React.ReactNode;
    autoOpenDeeplink?: boolean;
}