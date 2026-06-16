import type { Request, Response } from 'express';
import { parseAndImportErstePDF } from '../services/importService';

export async function importPDF(req: Request, res: Response) {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are accepted' });
      return;
    }

    const result = await parseAndImportErstePDF(file.buffer);
    res.json(result);
  } catch (err) {
    console.error('PDF import error:', err);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
}
