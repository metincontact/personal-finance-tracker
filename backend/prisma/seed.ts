import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();

  await prisma.transaction.createMany({
    data: [
      { date: new Date('2026-06-01'), amount: 32.50, description: 'Biedronka', category: 'food', merchant: 'Biedronka' },
      { date: new Date('2026-06-02'), amount: 9.60, description: 'ZTM Bilet', category: 'transport', merchant: 'ZTM' },
      { date: new Date('2026-06-03'), amount: 219.99, description: 'Zalando', category: 'shopping', merchant: 'Zalando' },
      { date: new Date('2026-06-04'), amount: 43.00, description: 'Netflix', category: 'entertainment', merchant: 'Netflix' },
      { date: new Date('2026-06-05'), amount: 58.30, description: 'Lidl', category: 'food', merchant: 'Lidl' },
      { date: new Date('2026-06-06'), amount: 12.00, description: 'Bolt Przejazd', category: 'transport', merchant: 'Bolt' },
      { date: new Date('2026-06-07'), amount: 340.00, description: 'PGE Energia', category: 'utilities', merchant: 'PGE' },
      { date: new Date('2026-06-08'), amount: 120.00, description: 'Medicover', category: 'health', merchant: 'Medicover' },
      { date: new Date('2026-06-09'), amount: 189.90, description: 'H&M', category: 'shopping', merchant: 'H&M' },
      { date: new Date('2026-06-10'), amount: 28.50, description: 'McDonald\'s', category: 'food', merchant: 'McDonald\'s' },
      { date: new Date('2026-06-11'), amount: 26.99, description: 'Spotify', category: 'entertainment', merchant: 'Spotify' },
      { date: new Date('2026-06-12'), amount: 74.20, description: 'Kaufland', category: 'food', merchant: 'Kaufland' },
      { date: new Date('2026-05-15'), amount: 145.00, description: 'Allegro', category: 'shopping', merchant: 'Allegro' },
      { date: new Date('2026-05-18'), amount: 22.40, description: 'Uber', category: 'transport', merchant: 'Uber' },
      { date: new Date('2026-05-22'), amount: 67.80, description: 'Rossmann', category: 'health', merchant: 'Rossmann' },
      { date: new Date('2026-05-25'), amount: 55.00, description: 'Helios Cinema', category: 'entertainment', merchant: 'Helios' },
      { date: new Date('2026-05-28'), amount: 189.00, description: 'Orange Rachunek', category: 'utilities', merchant: 'Orange' },
      { date: new Date('2026-05-30'), amount: 38.90, description: 'Apteka Dr. Max', category: 'health', merchant: 'Apteka Dr. Max' },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { category: 'food',          limit: 1500 },
      { category: 'transport',     limit: 300  },
      { category: 'shopping',      limit: 800  },
      { category: 'entertainment', limit: 200  },
      { category: 'health',        limit: 300  },
      { category: 'utilities',     limit: 500  },
      { category: 'other',         limit: 400  },
    ],
  });

  console.log('Seeded with Polish PLN data');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
