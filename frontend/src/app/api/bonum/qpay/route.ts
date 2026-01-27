import { NextRequest, NextResponse } from 'next/server';

interface CreateInvoiceRequest {
    amount: number;
    transactionId?: string;
    expiresIn?: number;
}

interface QPayLink {
    name: string;
    description: string;
    logo: string;
    link: string;
    appStoreId: string;
    androidPackageName: string;
}

interface QPayResponse {
    traceId: string;
    errorCode: string | null;
    error: string | null;
    message: string | null;
    data: {
        invoiceId: string;
        qrCode: string;
        qrImage: string;
        links: QPayLink[];
    };
    detail: string | null;
    duration: number;
    status: number;
}

// TransactionId generate хийх функц
function generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `TXN_${timestamp}_${randomPart}`.toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_TOKEN_BASE_URL = process.env.BONUM_TOKEN_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        if (!BONUM_BASE_URL || !BONUM_TOKEN_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            console.error('Missing Bonum environment variables');
            return NextResponse.json(
                { error: 'Missing required environment variables' },
                { status: 500 }
            );
        }

        const body: CreateInvoiceRequest = await request.json();
        const { amount, expiresIn } = body;

        // TransactionId автоматаар үүсгэх эсвэл request-ээс авах
        const transactionId = body.transactionId || generateTransactionId();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // Step 1: Access Token авах (BONUM_BASE_URL ашиглана)
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
                { error: 'Failed to get access token', message: tokenError },
                { status: tokenResponse.status }
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;

        // Step 2: QPay Invoice үүсгэх
        const qpayUrl = `${BONUM_TOKEN_BASE_URL}/merchant/transaction/qr/create`;

        const qpayPayload = {
            amount,
            transactionId,
            expiresIn: expiresIn || 600, // Default 10 минут
        };

        const response = await fetch(qpayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(qpayPayload),
        });

        const data: QPayResponse = await response.json();

        if (!response.ok || data.errorCode) {
            console.error('=== BONUM QPAY ERROR ===');
            console.error('Error Code:', data.errorCode);
            console.error('Error:', data.error);
            console.error('Message:', data.message);

            return NextResponse.json(
                {
                    error: 'Failed to create QPay invoice',
                    errorCode: data.errorCode,
                    message: data.message || data.error || 'Unknown error',
                },
                { status: response.status }
            );
        }

        // Frontend-д буцаах өгөгдөл
        return NextResponse.json({
            invoiceId: data.data.invoiceId,
            qrCode: data.data.qrCode,
            qrImage: data.data.qrImage,
            links: data.data.links,
            transactionId,
        }, { status: 200 });

    } catch (error) {
        console.error('=== BONUM QPAY CREATE INVOICE ERROR ===');
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
