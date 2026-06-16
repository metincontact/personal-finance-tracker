import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET!, { expiresIn: '30d' });
  res.json({ token });
});

export default router;
