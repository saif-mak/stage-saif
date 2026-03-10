import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST() {
    try {
        await prisma.quote.deleteMany();
        await prisma.renovationOption.deleteMany();
        await prisma.client.deleteMany();
        await prisma.office.deleteMany();

        await prisma.renovationOption.createMany({
            data: [
                { category: 'Peinture', name: 'Peinture Classique', pricePerM2: 15 },
                { category: 'Peinture', name: 'Peinture Premium', pricePerM2: 30 },
                { category: 'Électricité', name: 'Câblage Standard', pricePerM2: 25 },
                { category: 'Électricité', name: 'Câblage Fibre', pricePerM2: 60 },
                { category: 'Sol', name: 'Revêtement Vinyle', pricePerM2: 20 },
                { category: 'Sol', name: 'Parquet Massif', pricePerM2: 85 },
            ]
        });

        await prisma.office.createMany({
            data: [
                {
                    title: 'Bureau Lumineux - Centre Ville',
                    city: 'Paris',
                    surface: 120,
                    basePrice: 5000,
                    description: 'Bright office in the heart of Paris, perfectly suited for a team of 10 people.',
                    availability: true,
                },
                {
                    title: 'Open Space Moderne',
                    city: 'Lyon',
                    surface: 80,
                    basePrice: 2500,
                    description: 'Modern open space close to the train station.',
                    availability: true,
                },
                {
                    title: 'Plateau Vue Mer',
                    city: 'Marseille',
                    surface: 150,
                    basePrice: 3500,
                    description: 'Spacious setup near the old port with beautiful views.',
                    availability: true,
                }
            ]
        });

        return NextResponse.json({ message: 'Seed successful' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
