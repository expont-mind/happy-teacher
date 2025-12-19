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

interface BonumErrorResponse {
    message?: string;
    error?: string;
}

export async function POST(request: NextRequest) {
    console.log('=== CREATE INVOICE START ===');

    try {
        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        if (!BONUM_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            return NextResponse.json(
                { error: 'Missing required environment variables' },
                { status: 500 }
            );
        }

        const body: CreateInvoiceRequest = await request.json();
        const { amount, callback, transactionId, expiresIn, items, extras } = body;

        console.log('Request:', { amount, callback, transactionId });

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (!callback || !transactionId) {
            return NextResponse.json(
                { error: 'Callback URL and transactionId are required' },
                { status: 400 }
            );
        }

        // Step 1: Get access token
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
            const tokenError = await tokenResponse.text();
            console.error('Token error:', tokenError);
            return NextResponse.json(
                { error: 'Failed to get access token' },
                { status: tokenResponse.status }
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;

        // Step 2: Create invoice with callback URL
        // Bonum redirect хийхдээ бидний өгсөн callback URL ашигладаг
        // invoiceId-г callback-д урьдчилан нэмэх боломжгүй учир transactionId ашиглана
        const invoiceUrl = `${BONUM_BASE_URL}/ecommerce/invoices`;

        // Callback URL-д transactionId нэмэх (invoiceId-г дараа нь авна)
        const separator = callback.includes('?') ? '&' : '?';
        const callbackWithTransaction = `${callback}${separator}transactionId=${encodeURIComponent(transactionId)}`;

        // Items-г Bonum форматад тохируулах
        const formattedItems = items?.map(item => ({
            image: item.image || '',
            title: item.title,
            remark: item.remark || '',
            amount: item.amount,
            count: item.count
        }));

        const invoicePayload: Record<string, unknown> = {
            amount,
            callback: callbackWithTransaction,
            transactionId,
            expiresIn: expiresIn || 23000,
        };

        // Items болон extras нь зөвхөн байвал нэмнэ
        if (formattedItems && formattedItems.length > 0) {
            invoicePayload.items = formattedItems;
        }
        if (extras && extras.length > 0) {
            invoicePayload.extras = extras;
        }

        console.log('Creating invoice:', JSON.stringify(invoicePayload, null, 2));

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
        console.log('=== BONUM RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Response body:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            const errorData = data as BonumErrorResponse;
            console.error('=== BONUM ERROR DETAILS ===');
            console.error('HTTP Status:', response.status);
            console.error('Error message:', errorData.message);
            console.error('Error field:', errorData.error);
            console.error('Full error data:', JSON.stringify(data, null, 2));

            return NextResponse.json(
                {
                    error: 'Failed to create invoice',
                    message: errorData.message || errorData.error || 'Unknown error',
                    details: data, // Бүх алдааны мэдээллийг буцаах
                },
                { status: response.status }
            );
        }

        const invoiceId = data.invoiceId;
        const followUpLink = data.followUpLink;

        console.log('=== CREATE INVOICE SUCCESS ===');
        console.log('Invoice ID:', invoiceId);
        console.log('Follow Up Link:', followUpLink);

        // invoiceId болон transactionId-г хамт буцаана
        // Frontend localStorage-д хадгална
        return NextResponse.json({
            invoiceId,
            followUpLink,
            transactionId,
        }, { status: 200 });

    } catch (error) {
        console.error('=== CREATE INVOICE ERROR ===');
        console.error('Error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
