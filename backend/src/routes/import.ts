import { Router } from 'express';
import multer from 'multer';
import { importPDF } from '../controllers/importController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/pdf', upload.single('file'), importPDF);

export default router;
