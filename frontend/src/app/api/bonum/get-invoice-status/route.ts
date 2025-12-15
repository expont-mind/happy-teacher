import { NextRequest, NextResponse } from 'next/server';

interface InvoiceStatusResponse {
    status: string;
    isPaid: boolean;
    invoiceId: string;
    amount?: number;
    createdAt?: string;
    paidAt?: string;
    rawData?: any;
}

export async function GET(request: NextRequest) {
    console.log('=== GET INVOICE STATUS START ===');

    try {
        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');

        console.log('Checking invoiceId:', invoiceId);

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'Invoice ID is required', isPaid: false },
                { status: 400 }
            );
        }

        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        console.log('Environment:', {
            hasBaseUrl: !!BONUM_BASE_URL,
            hasSecret: !!BONUM_APP_SECRET,
            hasTerminalId: !!BONUM_DEFAULT_TERMINAL_ID
        });

        if (!BONUM_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            return NextResponse.json(
                { error: 'Missing required environment variables', isPaid: false },
                { status: 500 }
            );
        }

        // Step 1: Get access token
        const tokenUrl = `${BONUM_BASE_URL}/ecommerce/auth/create`;
        console.log('Getting token from:', tokenUrl);

        const tokenResponse = await fetch(tokenUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `AppSecret ${BONUM_APP_SECRET}`,
                'X-TERMINAL-ID': BONUM_DEFAULT_TERMINAL_ID,
            },
        });

        console.log('Token response status:', tokenResponse.status);

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
        console.log('Got access token:', !!accessToken);

        // Step 2: Get Invoice Status
        const invoiceStatusUrl = `${BONUM_BASE_URL}/ecommerce/invoices/${invoiceId}`;
        console.log('Getting invoice status from:', invoiceStatusUrl);

        const response = await fetch(invoiceStatusUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('Invoice status response:', response.status);

        const responseText = await response.text();
        console.log('Invoice status response body:', responseText);

        let data: any;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error('Failed to parse response as JSON');
            return NextResponse.json(
                { error: 'Invalid response from Bonum', isPaid: false, rawResponse: responseText },
                { status: 500 }
            );
        }

        console.log('Parsed invoice data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: 'Failed to get invoice status',
                    message: data.message || data.error || 'Unknown error',
                    isPaid: false,
                    status: 'ERROR'
                },
                { status: response.status }
            );
        }

        // Check if payment is successful
        // Bonum status values: PENDING, PAID, SUCCESS, EXPIRED, CANCELLED, etc.
        const isPaid = data.status === 'PAID' || data.status === 'SUCCESS' || data.status === 'COMPLETED';

        console.log('=== GET INVOICE STATUS END ===');
        console.log('Status:', data.status, '| isPaid:', isPaid);

        const result: InvoiceStatusResponse = {
            status: data.status || 'UNKNOWN',
            isPaid,
            invoiceId,
            amount: data.amount,
            createdAt: data.createdAt,
            paidAt: data.paidAt,
            rawData: data
        };

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('=== GET INVOICE STATUS ERROR ===');
        console.error('Error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                isPaid: false,
                status: 'ERROR'
            },
            { status: 500 }
        );
    }
}
