import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const quotes = await prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                client: true,
                office: true,
            },
        });
        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quotes' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, officeId, renovationsJson, totalPrice } = body;

        if (!clientId || !officeId || !renovationsJson || !totalPrice) {
            return NextResponse.json(
                { error: 'clientId, officeId, renovationsJson, and totalPrice are required' },
                { status: 400 }
            );
        }

        const quote = await prisma.quote.create({
            data: {
                clientId,
                officeId,
                renovationsJson,
                totalPrice: Number(totalPrice),
            },
        });

        return NextResponse.json(quote, { status: 201 });
    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json(
            { error: 'Failed to create quote' },
            { status: 500 }
        );
    }
}
