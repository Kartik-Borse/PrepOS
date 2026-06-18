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
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    # Parse args
    args = []
    for i, p in enumerate(${JSON.stringify(params)}):
        if i < len(lines):
            try:
                args.append(json.loads(lines[i]))
            except:
                args.append(lines[i])
    
    sol = Solution()
    res = getattr(sol, '${method}')(*args)
    print(json.dumps(res).replace(" ", ""))

if __name__ == '__main__':
    _run()
`;
}

function generateJSWrapper(code: string, method: string, params: any[], ret: any): string {
  return `${code}

const fs = require('fs');
function _run() {
    const input = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
    if (!input.length || !input[0]) return;
    
    const args = [];
    const params = ${JSON.stringify(params)};
    for (let i = 0; i < params.length; i++) {
        if (i < input.length) {
            try {
                args.push(JSON.parse(input[i]));
            } catch(e) {
                args.push(input[i]);
            }
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
  // Java wrapper is complex since we must map types
  // This is a minimal generic implementation using reflection or naive parsing.
  // JDoodle requires the public class to be Main or Match the file. 
  // We will assume the user provides class Solution. We inject public class Main.
  return `import java.util.*;
import java.util.stream.*;

${code}

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        // Naive line reader
        List<String> inputs = new ArrayList<>();
        while (sc.hasNextLine()) {
            inputs.add(sc.nextLine());
        }
        if (inputs.isEmpty()) return;
        
        // This requires parsing JSON arrays natively without Jackson/Gson since we don't have them in JDoodle
        // For simplicity we will tell the user that for Java, custom boilerplate is omitted in the editor 
        // but fully parsing complex types requires JSON libraries.
        System.out.println("Java automatic wrapper not fully implemented for complex types. Please use manual main.");
    }
}
`;
}
