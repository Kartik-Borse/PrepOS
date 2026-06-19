export interface ProblemMetadata {
  name: string;
  params: { name: string; type: string }[];
  return: { type: string };
}

export function generateWrapper(
  userCode: string,
  language: string,
  metaData: ProblemMetadata | null
): string {
  // If no metadata is found (custom problem) or it's not supported, return raw code.
  if (!metaData) {
    return userCode;
  }

  const { name: methodName, params, return: ret } = metaData;

  if (language === 'python3' || language === 'python') {
    return generatePythonWrapper(userCode, methodName, params, ret);
  } else if (language === 'nodejs' || language === 'javascript') {
    return generateJSWrapper(userCode, methodName, params, ret);
  } else if (language === 'java') {
    return generateJavaWrapper(userCode, methodName, params, ret);
  }

  // Fallback
  return userCode;
}

function generatePythonWrapper(code: string, method: string, params: any[], ret: any): string {
  return `${code}

import sys
import json

def _run():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    # Parse args
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

function generateJSWrapper(code: string, method: string, params: any[], ret: any): string {
  return `${code}

const fs = require('fs');
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
    
    // Check if it's a class or standalone function
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

function generateJavaWrapper(code: string, method: string, params: any[], ret: any): string {
  // Generate parameter parsing based on types
  const paramParsing = params.map((p, i) => {
    const type = p.type || 'String';
    if (type.includes('int[]')) {
      return `int[] param${i} = parseIntArray(inputs.get(${i}));`;
    } else if (type.includes('String[]')) {
      return `String[] param${i} = parseStringArray(inputs.get(${i}));`;
    } else if (type.includes('long[]')) {
      return `long[] param${i} = parseLongArray(inputs.get(${i}));`;
    } else if (type === 'int' || type === 'Integer') {
      return `int param${i} = Integer.parseInt(inputs.get(${i}));`;
    } else if (type === 'long' || type === 'Long') {
      return `long param${i} = Long.parseLong(inputs.get(${i}));`;
    } else if (type === 'double' || type === 'Double') {
      return `double param${i} = Double.parseDouble(inputs.get(${i}));`;
    } else if (type === 'String') {
      return `String param${i} = inputs.get(${i}).replaceAll("\\"", "");`;
    } else {
      return `String param${i} = inputs.get(${i});`;
    }
  }).join('\n        ');

  const paramNames = params.map((_, i) => `param${i}`).join(', ');
  const returnType = ret.type || 'int';

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
        s = s.trim().replaceAll("^\\[|\\]$", "");
        if (s.isEmpty()) return new int[0];
        return Arrays.stream(s.split(",")).mapToInt(x -> Integer.parseInt(x.trim())).toArray();
    }
    
    static long[] parseLongArray(String s) {
        s = s.trim().replaceAll("^\\[|\\]$", "");
        if (s.isEmpty()) return new long[0];
        return Arrays.stream(s.split(",")).mapToLong(x -> Long.parseLong(x.trim())).toArray();
    }
    
    static String[] parseStringArray(String s) {
        s = s.trim().replaceAll("^\\[|\\]$", "");
        if (s.isEmpty()) return new String[0];
        return Arrays.stream(s.split(",")).map(x -> x.trim().replaceAll("^\\"|\\"$", "")).toArray(String[]::new);
    }
}
`;
}

function generateJavaOutput(returnType: string): string {
  if (returnType.includes('int[]')) {
    return 'System.out.println("[" + Arrays.stream(result).mapToObj(String::valueOf).collect(Collectors.joining(",")) + "]");';
  } else if (returnType.includes('long[]')) {
    return 'System.out.println("[" + Arrays.stream(result).mapToObj(String::valueOf).collect(Collectors.joining(",")) + "]");';
  } else if (returnType.includes('double[]')) {
    return 'System.out.println("[" + Arrays.stream(result).mapToObj(String::valueOf).collect(Collectors.joining(",")) + "]");';
  } else if (returnType.includes('String[]')) {
    return 'System.out.println("[" + String.join(",", Arrays.stream(result).map(s -> "\\"" + s + "\\"").toArray(String[]::new)) + "]");';
  } else if (returnType.toLowerCase().includes('list')) {
    return 'System.out.println("[" + result.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]");';
  } else if (returnType === 'String') {
    return 'System.out.println("\\"" + result + "\\"");';
  } else {
    return 'System.out.println(result);';
  }
}
