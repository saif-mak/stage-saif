import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;

        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                quotes: {
                    orderBy: { createdAt: 'desc' },
                    include: { office: true }
                }
            }
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
