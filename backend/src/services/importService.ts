import { PDFParse } from 'pdf-parse';
import prisma from '../lib/prisma';

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  sty: 1, lut: 2, kwi: 4, maj: 5, cze: 6, lip: 7,
  sie: 8, wrz: 9, paz: 10, lis: 11, gru: 12,
};

function parseErsteDate(str: string): Date | null {
  const m = str.match(/(\d{1,2})\s+(\w{3,})\s+(\d{4})/);
  if (!m) return null;
  const month = MONTH_MAP[m[2].toLowerCase()];
  if (!month) return null;
  return new Date(parseInt(m[3]), month - 1, parseInt(m[1]));
}

function extractMerchant(description: string): string {
  // "Dop. Mc 557519******8763 Płatność Kartą 2.50 Pln MERCHANT NAME"
  const match = description.match(/\d+[.,]\d{2}\s+Pln\s+(.*)/i);
  if (match) return match[1].trim();
  return description.replace(/^Dop\.\s+Mc\s+\S+\s*/i, '').trim();
}

function categorize(merchant: string): string {
  const m = merchant.toLowerCase();
  if (/żabka|zabka|biedronka|lidl|aldi|kaufland|delikatesy|carrefour|spar|stokrotka|mcdonald|kfc|burger|pizza|restaur|bistro|cafe|kawiar|food|market|sklep|super|żywno|vendi|spożyw|żywnosc/.test(m)) return 'food';
  if (/hebe|rossmann|apteka|pharmacy|doktor|szpital|klinika|lekarz|dental|stomatolog|med |przychodn/.test(m)) return 'health';
  if (/transport|bileto|pkp|ztm|mpk|metro|uber|bolt|taxi|mzk|tramwaj|autobus|kolej|bus |train|przejazd/.test(m)) return 'transport';
  if (/allegro|amazon|decathlon|h&m|hm |zara|rossmann|media markt|euro rtv|saturn|ikea|leroy|ccc |reserved|mohito|carry|empik/.test(m)) return 'shopping';
  if (/cinema|netflix|spotify|steam|playstation|xbox|kino|helios|multikino|cinema city|film/.test(m)) return 'entertainment';
  if (/pge|innogy|enea|tauron|energa|vattenfall|orange|t-mobile|plus |upc|nc\+|czynsz|opłat|prąd|gaz |woda /.test(m)) return 'utilities';
  return 'other';
}

interface ParsedTransaction {
  date: Date;
  amount: number;
  merchant: string;
  description: string;
  category: string;
}

export async function parseAndImportErstePDF(buffer: Buffer): Promise<{ imported: number; skipped: number }> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  const transactions: ParsedTransaction[] = [];

  const transactionPattern =
    /(\d{1,2}\s+\w{3}\s+\d{4})\s*\n?Booking date\s+\d{1,2}\s+\w{3}\s+\d{4}\s+([\s\S]*?)\s+(-?\d+[.,]\d{2})\s+PLN\s+\d+[.,]\d{2}\s+PLN/g;

  let match: RegExpExecArray | null;
  while ((match = transactionPattern.exec(text)) !== null) {
    const [, dateStr, rawDesc, rawAmount] = match;
    const amount = parseFloat(rawAmount.replace(',', '.'));

    if (amount >= 0) continue;

    const date = parseErsteDate(dateStr);
    if (!date) continue;

    const merchant = extractMerchant(rawDesc.trim());
    const category = categorize(merchant);

    transactions.push({
      date,
      amount: parseFloat(Math.abs(amount).toFixed(2)),
      merchant,
      description: merchant,
      category,
    });
  }

  if (transactions.length === 0) return { imported: 0, skipped: 0 };

  const dates = transactions.map(t => t.date);
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  const existing = await prisma.transaction.findMany({
    where: { date: { gte: minDate, lte: maxDate } },
    select: { date: true, amount: true, merchant: true },
  });

  const existingSet = new Set(
    existing.map(e => `${e.date.toISOString()}|${e.amount}|${e.merchant}`)
  );

  const toInsert = transactions.filter(
    tx => !existingSet.has(`${tx.date.toISOString()}|${tx.amount}|${tx.merchant}`)
  );

  const skipped = transactions.length - toInsert.length;

  if (toInsert.length > 0) {
    await prisma.transaction.createMany({ data: toInsert });
  }

  return { imported: toInsert.length, skipped };
}
