import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');
        const topicKey = searchParams.get('topicKey');
        const userId = searchParams.get('userId');

        if (!invoiceId || !topicKey || !userId) {
            return NextResponse.redirect(
                new URL(`/topic/${topicKey}?payment=error&reason=missing_params`, request.url)
            );
        }

        // Get Bonum invoice status
        const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
        const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
        const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

        if (!BONUM_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
            return NextResponse.redirect(
                new URL(`/topic/${topicKey}?payment=error&reason=config_error`, request.url)
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
            return NextResponse.redirect(
                new URL(`/topic/${topicKey}?payment=error&reason=token_error`, request.url)
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;

        // Step 2: Check invoice status
        const invoiceStatusUrl = `${BONUM_BASE_URL}/ecommerce/invoices/${invoiceId}`;
        const statusResponse = await fetch(invoiceStatusUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const invoiceData = await statusResponse.json();

        // Check if payment is successful (status = PAID or SUCCESS)
        const isPaid = invoiceData.status === 'PAID' || invoiceData.status === 'SUCCESS';

        if (isPaid) {
            // Save purchase to Supabase
            const supabase = await createClient();

            const { error } = await supabase.from('purchases').insert({
                user_id: userId,
                topic_key: topicKey,
                invoice_id: invoiceId,
                amount: invoiceData.amount || 3,
            });

            if (error) {
                // Check if already purchased (duplicate key)
                if (error.code === '23505') {
                    return NextResponse.redirect(
                        new URL(`/topic/${topicKey}?payment=success&already_purchased=true`, request.url)
                    );
                }
                console.error('Error saving purchase:', error);
                return NextResponse.redirect(
                    new URL(`/topic/${topicKey}?payment=error&reason=save_error`, request.url)
                );
            }

            return NextResponse.redirect(
                new URL(`/topic/${topicKey}?payment=success`, request.url)
            );
        } else {
            return NextResponse.redirect(
                new URL(`/topic/${topicKey}?payment=pending&status=${invoiceData.status}`, request.url)
            );
        }

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(
            new URL(`/topic?payment=error&reason=unknown`, request.url)
        );
    }
}

// Bonum may also POST to callback
export async function POST(request: NextRequest) {
    return GET(request);
}
