const axios = require('axios');

/**
 * ERROR DETECTION & LOGGING UTILITY
 * This helps diagnose the 405 Method Not Allowed issue
 */
function logDetailedError(stage, data) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [CODE-RUN-DEBUG] ${stage}:`, JSON.stringify(data, null, 2));
}

function generateWrapper(userCode, language, metaData) {
  if (!metaData?.name || !Array.isArray(metaData?.params)) {
    return userCode;
  }

  if (language === 'python3' || language === 'python') {
    return generatePythonWrapper(userCode, metaData.name, metaData.params);
  }

  if (language === 'nodejs' || language === 'javascript') {
    return generateJSWrapper(userCode, metaData.name, metaData.params);
  }

  if (language === 'java') {
    return generateJavaWrapper(userCode, metaData.name, metaData.params, metaData.return || {});
  }

  return userCode;
}

function generatePythonWrapper(code, method, params) {
  return `${code}

import sys
import json

def _run():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    args = []
    for i, p in enumerate(${JSON.stringify(params)}):
        if i < len(lines):
            line = lines[i].strip()
            try:
                args.append(json.loads(line))
            except:
                args.append(line)

    sol = Solution()
    res = getattr(sol, '${method}')(*args)
    print(json.dumps(res, separators=(',', ':')))

if __name__ == '__main__':
    _run()
`;
}

function generateJSWrapper(code, method, params) {
  return `${code}

const readline = require('readline');

async function _run() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    const lines = [];
    for await (const line of rl) {
        if (line.trim()) lines.push(line.trim());
    }

    if (!lines.length) return;

    const args = [];
    const params = ${JSON.stringify(params)};
    for (let i = 0; i < params.length && i < lines.length; i++) {
        try {
            args.push(JSON.parse(lines[i]));
        } catch(e) {
            args.push(lines[i]);
        }
    }

    let res;
    if (typeof ${method} === 'function') {
        res = ${method}(...args);
    } else if (typeof Solution !== 'undefined') {
        const sol = new Solution();
        res = sol.${method}(...args);
    }
    console.log(JSON.stringify(res));
}
_run();
`;
}

function generateJavaWrapper(code, method, params, ret) {
  const paramParsing = params.map((p, i) => {
    const type = normalizeJavaType(p.type || 'String');
    if (type.includes('int[]')) return `int[] param${i} = parseIntArray(inputs.get(${i}));`;
    if (type.includes('String[]')) return `String[] param${i} = parseStringArray(inputs.get(${i}));`;
    if (type.includes('long[]')) return `long[] param${i} = parseLongArray(inputs.get(${i}));`;
    if (type === 'int' || type === 'Integer') return `int param${i} = Integer.parseInt(inputs.get(${i}));`;
    if (type === 'long' || type === 'Long') return `long param${i} = Long.parseLong(inputs.get(${i}));`;
    if (type === 'double' || type === 'Double') return `double param${i} = Double.parseDouble(inputs.get(${i}));`;
    if (type === 'String') return `String param${i} = inputs.get(${i}).replaceAll("\\\\"", "");`;
    return `String param${i} = inputs.get(${i});`;
  }).join('\n        ');
  const paramNames = params.map((_, i) => `param${i}`).join(', ');
  const returnType = normalizeJavaType(ret.type || 'int');

  return `import java.util.*;
import java.util.stream.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> inputs = new ArrayList<>();
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (!line.isEmpty()) inputs.add(line);
        }
        sc.close();

        if (inputs.isEmpty()) return;

        try {
            ${paramParsing}

            Solution sol = new Solution();
            ${returnType} result = sol.${method}(${paramNames});

            ${generateJavaOutput(returnType)}
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static int[] parseIntArray(String s) {
        s = s.trim().replaceAll("^\\\\[|\\\\]$", "");
        if (s.isEmpty()) return new int[0];
        return Arrays.stream(s.split(",")).mapToInt(x -> Integer.parseInt(x.trim())).toArray();
    }

    static long[] parseLongArray(String s) {
        s = s.trim().replaceAll("^\\\\[|\\\\]$", "");
        if (s.isEmpty()) return new long[0];
        return Arrays.stream(s.split(",")).mapToLong(x -> Long.parseLong(x.trim())).toArray();
    }

    static String[] parseStringArray(String s) {
        s = s.trim().replaceAll("^\\\\[|\\\\]$", "");
        if (s.isEmpty()) return new String[0];
        return Arrays.stream(s.split(",")).map(x -> x.trim().replaceAll("^\\\"|\\\"$", "")).toArray(String[]::new);
    }
}
`;
}

function normalizeJavaType(type) {
  const normalized = String(type).toLowerCase();
  if (normalized === 'integer') return 'int';
  if (normalized === 'boolean') return 'boolean';
  if (normalized === 'string') return 'String';
  if (normalized === 'integer[]' || normalized === 'list<integer>') return 'int[]';
  if (normalized === 'string[]' || normalized === 'list<string>') return 'String[]';
  if (normalized === 'long') return 'long';
  if (normalized === 'double') return 'double';
  return type;
}

function generateJavaOutput(returnType) {
  if (returnType.includes('int[]') || returnType.includes('long[]') || returnType.includes('double[]')) {
    return 'System.out.println("[" + Arrays.stream(result).mapToObj(String::valueOf).collect(Collectors.joining(",")) + "]");';
  }
  if (returnType.includes('String[]')) {
    return 'System.out.println("[" + String.join(",", Arrays.stream(result).map(s -> "\\\\"" + s + "\\\\"").toArray(String[]::new)) + "]");';
  }
  if (returnType.toLowerCase().includes('list')) {
    return 'System.out.println("[" + result.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]");';
  }
  if (returnType === 'String') {
    return 'System.out.println("\\\\"" + result + "\\\\"");';
  }
  return 'System.out.println(result);';
}

/**
 * Vercel serverless function for /api/code/run
 * Executes code using JDoodle API
 */
module.exports = async function handler(req, res) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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

  const { script, language, versionIndex, stdin, metaData } = req.body || {};
  const wrappedScript = generateWrapper(script, language, metaData);

  // LOG 3: Request body validation
  logDetailedError('REQUEST_BODY', {
    requestId,
    hasScript: !!script,
    scriptLength: script?.length || 0,
    wrappedScriptLength: wrappedScript?.length || 0,
    hasMetaData: !!metaData,
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
      script: wrappedScript,
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
  } catch (e) {
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
};
