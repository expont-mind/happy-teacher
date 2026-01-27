import { NextRequest, NextResponse } from 'next/server';

interface QPayStatusRequest {
    qrCode: string;
}

interface QPayStatusResponse {
    traceId: string;
    errorCode: string | null;
    error: string | null;
    message: string | null;
    data: {
        merchant: {
            name: string;
            logo: string;
            id: number;
            merchantId: string;
        };
        invoice: {
            invoiceId: number;
            currency: string;
            amount: number;
            createdAt: string;
            status: string; // "OPEN", "PAID", "EXPIRED", etc.
            initType: string;
            terminalId: string;
            description: string;
        };
    };
    detail: string | null;
    duration: number;
    status: number;
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
                { error: 'Missing required environment variables', isPaid: false },
                { status: 500 }
            );
        }

        const body: QPayStatusRequest = await request.json();
        const { qrCode } = body;

        if (!qrCode) {
            return NextResponse.json(
                { error: 'qrCode is required', isPaid: false },
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
                { error: 'Failed to get access token', isPaid: false, message: tokenError },
                { status: tokenResponse.status }
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;

        // Step 2: QPay Invoice Status шалгах
        const statusUrl = `${BONUM_TOKEN_BASE_URL}/merchant/transaction/qr`;

        const response = await fetch(statusUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ qrCode }),
        });

        const data: QPayStatusResponse = await response.json();

        if (!response.ok || data.errorCode) {
            console.error('=== BONUM QPAY STATUS ERROR ===');
            console.error('Error Code:', data.errorCode);
            console.error('Error:', data.error);
            console.error('Message:', data.message);

            return NextResponse.json(
                {
                    error: 'Failed to get invoice status',
                    errorCode: data.errorCode,
                    message: data.message || data.error || 'Unknown error',
                    isPaid: false,
                },
                { status: response.status }
            );
        }

        // Төлбөр төлөгдсөн эсэхийг шалгах
        const invoiceStatus = data.data?.invoice?.status;
        const isPaid = invoiceStatus === 'PAID' || invoiceStatus === 'SUCCESS' || invoiceStatus === 'COMPLETED';

        return NextResponse.json({
            isPaid,
            status: invoiceStatus,
            invoiceId: data.data?.invoice?.invoiceId,
            amount: data.data?.invoice?.amount,
            currency: data.data?.invoice?.currency,
            createdAt: data.data?.invoice?.createdAt,
            merchant: data.data?.merchant,
            rawData: data.data,
        }, { status: 200 });

    } catch (error) {
        console.error('=== BONUM QPAY GET STATUS ERROR ===');
        console.error('Error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                isPaid: false,
            },
            { status: 500 }
        );
    }
}
