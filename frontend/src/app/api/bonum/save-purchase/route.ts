import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: NextRequest) {
    console.log('=== SAVE PURCHASE START ===');

    try {
        const body = await request.json();
        const { userId, topicKey, invoiceId } = body;

        console.log('Request:', { userId, topicKey, invoiceId });

        if (!userId || !topicKey) {
            return NextResponse.json(
                { success: false, error: 'userId and topicKey are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Purchase хадгалах
        const { error } = await supabase.from('purchases').insert({
            user_id: userId,
            topic_key: topicKey,
        });

        if (error) {
            // Duplicate key = аль хэдийн худалдан авсан = success
            if (error.code === '23505') {
                console.log('Purchase already exists');
                return NextResponse.json({ success: true, message: 'Already purchased' });
            }

            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        console.log('=== SAVE PURCHASE SUCCESS ===');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('=== SAVE PURCHASE ERROR ===');
        console.error('Error:', error);

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
