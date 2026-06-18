import { Router } from 'express';
import { runCode, JDoodleRequest } from '../jdoodle';

const router = Router();

router.post('/run', async (req, res) => {
  const body: JDoodleRequest = req.body;
  try {
    const result = await runCode(body);
    res.json(result);
  } catch (e: any) {
    console.error('JDoodle error', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
