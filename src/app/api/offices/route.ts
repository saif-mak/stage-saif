import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
    try {
        const offices = await prisma.office.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error fetching offices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch offices' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, city, surface, basePrice, description, extractedDetails, imageUrls, planUrl, availability } = body;

        if (!city || !surface || !basePrice) {
            return NextResponse.json(
                { error: 'City, surface, and base price are required' },
                { status: 400 }
            );
        }

        const office = await prisma.office.create({
            data: {
                title,
                city,
                surface: Number(surface),
                basePrice: Number(basePrice),
                description,
                extractedDetails,
                imageUrls: imageUrls || null,
                planUrl: planUrl || null,
                availability: availability !== undefined ? Boolean(availability) : true,
            },
        });

        return NextResponse.json(office, { status: 201 });
    } catch (error) {
        console.error('Error creating office:', error);
        return NextResponse.json(
            { error: 'Failed to create office' },
            { status: 500 }
        );
    }
}
