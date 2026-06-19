import { Router } from 'express';
import { runCode, JDoodleRequest } from '../jdoodle';
import { query } from '../db/connection';
import { generateWrapper, ProblemMetadata } from '../utils/codeGenerator';

const router = Router();

/**
 * ERROR DETECTION & LOGGING UTILITY
 * This helps diagnose routing issues in Express
 */
function logExpressDebug(stage: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [EXPRESS-CODE-RUNNER] ${stage}:`, JSON.stringify(data, null, 2));
}

router.post('/run', async (req, res) => {
  const requestId = `express_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // LOG: Express route hit
  logExpressDebug('EXPRESS_ROUTE_HIT', {
    requestId,
    method: req.method,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });

  const body = req.body; // JDoodleRequest & { problemId?: string }
  
  try {
    let metaData: ProblemMetadata | null = null;
    
    logExpressDebug('PROCESSING_REQUEST', {
      requestId,
      hasProblemId: !!body.problemId,
      hasScript: !!body.script,
      language: body.language
    });
    
    if (body.problemId) {
      // Try to fetch metadata from DB
      // Check if problemId is numeric (id) or string (slug)
      const isNumeric = /^\d+$/.test(String(body.problemId));
      const query_sql = isNumeric 
        ? `SELECT meta_data FROM problems WHERE id = $1`
        : `SELECT meta_data FROM problems WHERE slug = $1`;
      const query_param = isNumeric ? [parseInt(body.problemId, 10)] : [body.problemId];
      
      const dbRes = await query(query_sql, query_param);
      if (dbRes.rows.length > 0 && dbRes.rows[0].meta_data) {
        metaData = dbRes.rows[0].meta_data;
        logExpressDebug('METADATA_FETCHED', {
          requestId,
          problemId: body.problemId,
          hasMetadata: true
        });
      }
    }

    const wrappedScript = generateWrapper(body.script, body.language, metaData);
    
    const jdoodlePayload: JDoodleRequest = {
      script: wrappedScript,
      language: body.language,
      versionIndex: body.versionIndex,
      stdin: body.stdin
    };

    logExpressDebug('CALLING_JDOODLE', {
      requestId,
      scriptLength: wrappedScript.length,
      language: body.language
    });

    const result = await runCode(jdoodlePayload);
    
    logExpressDebug('JDOODLE_SUCCESS', {
      requestId,
      hasOutput: !!result.output
    });
    
    res.json(result);
  } catch (e: any) {
    logExpressDebug('ERROR', {
      requestId,
      errorMessage: e.message,
      stack: e.stack
    });
    
    console.error('JDoodle error', e);
    res.status(500).json({ 
      error: e.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
