import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.quote.deleteMany();
  await prisma.renovationOption.deleteMany();
  await prisma.client.deleteMany();
  await prisma.office.deleteMany();

  console.log('Inserting standard renovation options...');
  // Create global Renovation Options
  const paintStandard = await prisma.renovationOption.create({
    data: { category: 'Peinture', name: 'Peinture Classique', pricePerM2: 15 },
  });
  const paintPremium = await prisma.renovationOption.create({
    data: { category: 'Peinture', name: 'Peinture Premium', pricePerM2: 30 },
  });
  const elecStandard = await prisma.renovationOption.create({
    data: { category: 'Électricité', name: 'Câblage Standard', pricePerM2: 25 },
  });
  const elecPremium = await prisma.renovationOption.create({
    data: { category: 'Électricité', name: 'Câblage Fibre & Réseau complet', pricePerM2: 60 },
  });
  const floorVinyl = await prisma.renovationOption.create({
    data: { category: 'Sol', name: 'Revêtement Vinyle', pricePerM2: 20 },
  });
  const floorParquet = await prisma.renovationOption.create({
    data: { category: 'Sol', name: 'Parquet Massif', pricePerM2: 85 },
  });

  console.log('Inserting sample offices...');
  // Create Offices
  const office1 = await prisma.office.create({
    data: {
      title: 'Bureau Lumineux - Centre Ville',
      city: 'Paris',
      surface: 120,
      basePrice: 5000,
      description: 'Bright office in the heart of Paris, perfectly suited for a team of 10 people.',
      availability: true,
    },
  });

  const office2 = await prisma.office.create({
    data: {
      title: 'Open Space Moderne',
      city: 'Lyon',
      surface: 80,
      basePrice: 2500,
      description: 'Modern open space close to the train station.',
      availability: true,
    },
  });

  const office3 = await prisma.office.create({
    data: {
      title: 'Plateau Vue Mer',
      city: 'Marseille',
      surface: 150,
      basePrice: 3500,
      description: 'Spacious setup near the old port with beautiful views.',
      availability: true,
    },
  });

  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
