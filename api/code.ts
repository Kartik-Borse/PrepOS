import { runCode, JDoodleRequest } from '../../packages/backend/src/jdoodle';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const body = req.body as JDoodleRequest;
  try {
    const result = await runCode(body);
    res.status(200).json(result);
  } catch (e: any) {
    console.error('JDoodle error', e);
    res.status(500).json({ error: e.message });
  }
}
