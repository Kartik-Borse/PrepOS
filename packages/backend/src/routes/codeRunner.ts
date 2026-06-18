import { Router } from 'express';
import { runCode, JDoodleRequest } from '../jdoodle';
import { query } from '../db/connection';
import { generateWrapper, ProblemMetadata } from '../utils/codeGenerator';

const router = Router();

router.post('/run', async (req, res) => {
  const body = req.body; // JDoodleRequest & { problemId?: string }
  try {
    let metaData: ProblemMetadata | null = null;
    
    if (body.problemId) {
      // Try to fetch metadata from DB
      const dbRes = await query(`SELECT meta_data FROM problems WHERE id = $1 OR slug = $1`, [body.problemId]);
      if (dbRes.rows.length > 0 && dbRes.rows[0].meta_data) {
        metaData = dbRes.rows[0].meta_data;
      }
    }

    const wrappedScript = generateWrapper(body.script, body.language, metaData);
    
    const jdoodlePayload: JDoodleRequest = {
      script: wrappedScript,
      language: body.language,
      versionIndex: body.versionIndex,
      stdin: body.stdin
    };

    const result = await runCode(jdoodlePayload);
    res.json(result);
  } catch (e: any) {
    console.error('JDoodle error', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
