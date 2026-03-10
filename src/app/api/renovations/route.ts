import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
    try {
        const options = await prisma.renovationOption.findMany({
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
        return NextResponse.json(options);
    } catch (error) {
        console.error('Error fetching renovation options:', error);
        return NextResponse.json(
            { error: 'Failed to fetch renovation options' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, name, pricePerM2 } = body;

        if (!category || !name || !pricePerM2) {
            return NextResponse.json(
                { error: 'Category, name, and pricePerM2 are required' },
                { status: 400 }
            );
        }

        const option = await prisma.renovationOption.create({
            data: {
                category,
                name,
                pricePerM2: Number(pricePerM2),
            },
        });

        return NextResponse.json(option, { status: 201 });
    } catch (error) {
        console.error('Error creating renovation option:', error);
        return NextResponse.json(
            { error: 'Failed to create renovation option' },
            { status: 500 }
        );
    }
}
