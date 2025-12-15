import { NextRequest, NextResponse } from 'next/server';

interface InvoiceItem {
    image?: string;
    title: string;
    remark?: string;
    amount: number;
    count: number;
}

interface InvoiceExtra {
    placeholder: string;
    type: 'TEXT' | 'NUMBER' | 'PHONE' | 'EMAIL' | 'ALL';
    required: boolean;
}

interface CreateInvoiceRequest {
    amount: number;
    callback: string;
    transactionId: string;
    expiresIn?: number;
    items?: InvoiceItem[];
    extras?: InvoiceExtra[];
}

interface BonumInvoiceResponse {
    invoiceId: string;
    followUpLink: string;
}

interface BonumErrorResponse {
    message?: string;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_TOKEN_BASE_URL = process.env.BONUM_TOKEN_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        if (!BONUM_BASE_URL || !BONUM_TOKEN_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            return NextResponse.json(
                {
                    error: 'Missing required environment variables',
                },
                { status: 500 }
            );
        }

        const body: CreateInvoiceRequest = await request.json();
        const { amount, callback, transactionId, expiresIn, items, extras } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                {
                    error: 'Invalid amount',
                    message: 'Amount must be greater than 0'
                },
                { status: 400 }
            );
        }

        if (!callback) {
            return NextResponse.json(
                {
                    error: 'Callback URL is required',
                    message: 'Please provide a callback URL'
                },
                { status: 400 }
            );
        }

        if (!transactionId) {
            return NextResponse.json(
                {
                    error: 'Transaction ID is required',
                    message: 'Please provide a transaction ID'
                },
                { status: 400 }
            );
        }

        // Step 1: Get access token using GET request
        const tokenUrl = `${BONUM_BASE_URL}/ecommerce/auth/create`;

        const tokenResponse = await fetch(tokenUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `AppSecret ${BONUM_APP_SECRET}`,
                'X-TERMINAL-ID': BONUM_DEFAULT_TERMINAL_ID,
            },
        });

        if (!tokenResponse.ok) {
            const tokenError = await tokenResponse.json();
            return NextResponse.json(
                {
                    error: 'Failed to get access token',
                    message: tokenError.message || 'Token request failed',
                    statusCode: tokenResponse.status
                },
                { status: tokenResponse.status }
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;

        const invoiceUrl = `${BONUM_BASE_URL}/ecommerce/invoices`;

        const invoicePayload: CreateInvoiceRequest = {
            amount,
            callback,
            transactionId,
            expiresIn: expiresIn || 23000,
            items,
            extras,
        };

        const response = await fetch(invoiceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Accept-Language': 'mn',
            },
            body: JSON.stringify(invoicePayload),
        });

        const data = await response.json();

        // Handle non-successful responses
        if (!response.ok) {
            const errorData = data as BonumErrorResponse;
            return NextResponse.json(
                {
                    error: 'Failed to create invoice',
                    message: errorData.message || errorData.error || 'Unknown error',
                    statusCode: response.status
                },
                { status: response.status }
            );
        }

        // Return successful response
        const invoiceData = data as BonumInvoiceResponse;
        return NextResponse.json(invoiceData, { status: 200 });

    } catch (error) {
        console.error('Error creating Bonum invoice:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}