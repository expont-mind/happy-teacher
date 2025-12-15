import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');

        if (!invoiceId) {
            return NextResponse.json(
                {
                    error: 'Invoice ID is required',
                    message: 'Please provide an invoiceId query parameter'
                },
                { status: 400 }
            );
        }

        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        if (!BONUM_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            return NextResponse.json(
                {
                    error: 'Missing required environment variables',
                },
                { status: 500 }
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

        // Step 2: Get Invoice Status
        const invoiceStatusUrl = `${BONUM_BASE_URL}/ecommerce/invoices/${invoiceId}`;

        const response = await fetch(invoiceStatusUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: 'Failed to get invoice status',
                    message: data.message || data.error || 'Unknown error',
                    statusCode: response.status
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error getting Bonum invoice status:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
