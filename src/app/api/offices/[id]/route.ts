import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        await prisma.office.delete({ where: { id } });
        return NextResponse.json({ message: 'Office deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const office = await prisma.office.findUnique({ where: { id } });
        if (!office) return NextResponse.json({ error: 'Office not found' }, { status: 404 });
        return NextResponse.json(office);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const body = await request.json();

        const updatedOffice = await prisma.office.update({
            where: { id },
            data: {
                title: body.title,
                city: body.city,
                surface: body.surface,
                basePrice: body.basePrice,
                description: body.description,
                extractedDetails: body.extractedDetails,
                availability: body.availability,
                imageUrls: body.imageUrls,
                planUrl: body.planUrl,
            }
        });

        return NextResponse.json(updatedOffice);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
