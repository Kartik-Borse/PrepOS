import axios from 'axios';

/**
 * ERROR DETECTION & LOGGING UTILITY
 * This helps diagnose the 405 Method Not Allowed issue
 */
function logDetailedError(stage: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [CODE-RUN-DEBUG-TS] ${stage}:`, JSON.stringify(data, null, 2));
}

/**
 * Standalone Vercel serverless function – proxies JDoodle requests.
 * Credentials come from Vercel environment variables (set in dashboard or vercel.json).
 */
export default async function handler(req: any, res: any) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // LOG 1: Request received
  logDetailedError('REQUEST_RECEIVED', {
    requestId,
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin'],
      'user-agent': req.headers['user-agent']
    },
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : []
  });

  // LOG 2: Check if this function is even being reached
  if (req.method !== 'POST') {
    logDetailedError('METHOD_NOT_ALLOWED', {
      requestId,
      receivedMethod: req.method,
      expectedMethod: 'POST',
      possibleCause: 'Frontend might be sending wrong method OR Vercel routing issue'
    });
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      requestId,
      receivedMethod: req.method,
      expectedMethod: 'POST',
      timestamp: new Date().toISOString()
    });
  }

  const { script, language, versionIndex, stdin } = req.body || {};

  // LOG 3: Request body validation
  logDetailedError('REQUEST_BODY', {
    requestId,
    hasScript: !!script,
    scriptLength: script?.length || 0,
    language,
    versionIndex,
    hasStdin: !!stdin
  });

  // LOG 4: Environment check
  logDetailedError('ENVIRONMENT_CHECK', {
    requestId,
    hasClientId: !!process.env.JDOODLE_CLIENT_ID,
    hasClientSecret: !!process.env.JDOODLE_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  try {
    // LOG 5: Before JDoodle call
    logDetailedError('JDOODLE_REQUEST_START', {
      requestId,
      endpoint: 'https://api.jdoodle.com/v1/execute'
    });

    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script,
      language,
      versionIndex,
      stdin,
    });

    // LOG 6: JDoodle success
    logDetailedError('JDOODLE_SUCCESS', {
      requestId,
      statusCode: response.status,
      hasOutput: !!response.data?.output
    });

    return res.status(200).json(response.data);
  } catch (e: any) {
    // LOG 7: JDoodle error
    logDetailedError('JDOODLE_ERROR', {
      requestId,
      errorMessage: e.message,
      errorStatus: e?.response?.status,
      errorData: e?.response?.data,
      stack: e.stack
    });

    console.error('JDoodle error', e?.response?.data || e.message);
    return res.status(500).json({ 
      error: e?.response?.data?.error || e.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}

