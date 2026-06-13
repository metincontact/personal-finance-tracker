import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();

  await prisma.transaction.createMany({
    data: [
      { date: new Date('2026-06-01'), amount: 45.20, description: 'Tesco Superstore', category: 'food', merchant: 'Tesco' },
      { date: new Date('2026-06-02'), amount: 12.50, description: 'TfL Travel', category: 'transport', merchant: 'TfL' },
      { date: new Date('2026-06-03'), amount: 89.99, description: 'ASOS Order', category: 'shopping', merchant: 'ASOS' },
      { date: new Date('2026-06-04'), amount: 15.00, description: 'Netflix', category: 'entertainment', merchant: 'Netflix' },
      { date: new Date('2026-06-05'), amount: 32.80, description: "Sainsbury's", category: 'food', merchant: "Sainsbury's" },
      { date: new Date('2026-06-06'), amount: 8.50, description: 'Bus Pass', category: 'transport', merchant: 'Arriva' },
      { date: new Date('2026-06-07'), amount: 120.00, description: 'Electricity Bill', category: 'utilities', merchant: 'British Gas' },
      { date: new Date('2026-06-08'), amount: 25.00, description: 'Gym Membership', category: 'health', merchant: 'PureGym' },
      { date: new Date('2026-06-09'), amount: 67.40, description: 'Zara', category: 'shopping', merchant: 'Zara' },
      { date: new Date('2026-06-10'), amount: 18.90, description: "McDonald's", category: 'food', merchant: "McDonald's" },
      { date: new Date('2026-06-11'), amount: 9.99, description: 'Spotify', category: 'entertainment', merchant: 'Spotify' },
      { date: new Date('2026-06-12'), amount: 55.00, description: 'Lidl', category: 'food', merchant: 'Lidl' },
      { date: new Date('2026-05-15'), amount: 78.30, description: 'Asda', category: 'food', merchant: 'Asda' },
      { date: new Date('2026-05-18'), amount: 45.00, description: 'Uber', category: 'transport', merchant: 'Uber' },
      { date: new Date('2026-05-22'), amount: 200.00, description: 'Amazon', category: 'shopping', merchant: 'Amazon' },
      { date: new Date('2026-05-25'), amount: 30.00, description: 'Cinema', category: 'entertainment', merchant: 'Odeon' },
      { date: new Date('2026-05-28'), amount: 95.00, description: 'Water Bill', category: 'utilities', merchant: 'Thames Water' },
      { date: new Date('2026-05-30'), amount: 40.00, description: 'Pharmacy', category: 'health', merchant: 'Boots' },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { category: 'food',          limit: 300 },
      { category: 'transport',     limit: 100 },
      { category: 'shopping',      limit: 200 },
      { category: 'entertainment', limit: 50  },
      { category: 'health',        limit: 80  },
      { category: 'utilities',     limit: 150 },
      { category: 'other',         limit: 100 },
    ],
  });

  console.log('✅ Database seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
