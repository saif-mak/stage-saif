const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const clients = await prisma.client.findMany({
            where: { name: 'Verification Tech' },
            include: { quotes: true }
        });
        console.log(JSON.stringify(clients, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
