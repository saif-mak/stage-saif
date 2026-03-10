import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                quotes: true,
            },
        });
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        const client = await prisma.client.create({
            data: {
                name,
                email,
                phone,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        );
    }
}
