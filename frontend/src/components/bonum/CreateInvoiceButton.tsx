'use client';

import { useState } from 'react';
import { CreateInvoiceButtonProps, BonumExtra, BonumInvoiceItem } from './type';



export function CreateInvoiceButton({
    amount,
    callback,
    transactionId,
    expiresIn,
    items,
    extras,
    onSuccess,
    onError,
    className = '',
    children = 'Create Invoice',
    autoOpenDeeplink = true
}: CreateInvoiceButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading || amount <= 0) return;

        setLoading(true);

        try {
            const response = await fetch('/api/bonum/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    callback,
                    transactionId,
                    expiresIn,
                    items,
                    extras,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create invoice');
            }

            console.log('✅ Invoice created successfully:', data);

            // Auto open followUpLink if available
            const paymentLink = data.followUpLink || data.deeplink;
            if (autoOpenDeeplink && paymentLink) {
                console.log('🔗 Opening payment link:', paymentLink);
                window.location.href = paymentLink;
            }

            if (onSuccess) {
                onSuccess(data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            console.error('❌ Error creating invoice:', errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading || amount <= 0}
            className={`px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? 'Creating Invoice...' : children}
        </button>
    );
}

export type { BonumInvoiceItem, BonumExtra, CreateInvoiceButtonProps };
