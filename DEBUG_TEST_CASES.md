# 🔍 Debug Guide: "Wrong Answer" Issue

## Step 1: Check Browser Console
1. Open your app in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Submit a test case
5. Look for logs starting with `[FRONTEND-CODE-RUN-DEBUG]`

### What to Check:
```
[FRONTEND-CODE-RUN-DEBUG] Comparison {
  rawOutput: "..." ← What JDoodle returned
  actualNormalized: "..." ← After our normalization
  expectedNormalized: "..." ← What we expect
  passed: false/true
  exactMatch: false/true
  lenientMatch: false/true
}
```

**Copy and send me these logs!**

---

## Step 2: Check Network Tab
1. Stay in Developer Tools (F12)
2. Go to **Network** tab
3. Filter by "run" or "code"
4. Submit a test
5. Click on the `/api/code/run` request

### What to Check:
- **Request Payload**: Is the code being sent correctly?
- **Response**: What does JDoodle actually return?
- **Status Code**: Should be 200, not 405 or 500

**Screenshot or copy the response JSON!**

---

## Step 3: Check if Frontend Changes Deployed

### For Vercel:
1. Go to: https://vercel.com/dashboard
2. Find your project
3. Check **Last Deployment** time
4. Should be AFTER the git push timestamp

### Force Redeploy:
```bash
# In your frontend directory
cd packages/frontend
npm run build

# Or in Vercel dashboard, click "Redeploy"
```

### Clear Browser Cache:
- **Hard Reload**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear all cache in browser settings

---

## Step 4: Test the Actual Comparison

Open browser console and paste this to test normalization:

```javascript
function normaliseOutput(s) {
  let normalized = s.trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '')
    .replace(/\[\s*/g, '[').replace(/\s*\]/g, ']')
    .replace(/,\s+/g, ',')
    .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/^["']|["']$/g, '');
  
  try {
    const parsed = JSON.parse(normalized);
    return JSON.stringify(parsed);
  } catch {
    return normalized.toLowerCase();
  }
}

// Test with your actual outputs
const actual = "[1, 2, 3]";     // Replace with your actual output
const expected = "[1,2,3]";     // Replace with expected output

const normalizedActual = normaliseOutput(actual);
const normalizedExpected = normaliseOutput(expected);

console.log("Normalized Actual:", normalizedActual);
console.log("Normalized Expected:", normalizedExpected);
console.log("Match:", normalizedActual === normalizedExpected);
```

---

## Step 5: Check Test Case Data

The problem might be **empty expected outputs**. Check:

### In Browser Console:
```javascript
// Check what test cases the problem has
console.log("Test Cases:", problem.testCases);
```

Look for:
- Are `expected` values present?
- Are they strings like `"3"` or `"[0,1]"`?
- Or are they empty `""`?

---

## Step 6: Verify Vercel Environment

### Check Vercel Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on **Deployments**
4. Click latest deployment
5. Click **View Function Logs**

Look for errors during build or runtime.

---

## Common Issues & Fixes

### Issue 1: Changes Not Deployed
**Fix**: 
- Hard refresh: `Ctrl + Shift + R`
- Redeploy on Vercel
- Check Vercel deployment timestamp

### Issue 2: Empty Expected Outputs
**Fix**: Import problems from LeetCode again, or manually add expected outputs.

### Issue 3: CORS or API Route Issues
**Check Network tab** - if you see:
- 405 Method Not Allowed → Route configuration issue
- 500 Internal Server Error → Backend crash
- CORS error → CORS configuration issue

### Issue 4: JDoodle API Issues
**Check**: Are you getting output from JDoodle at all?
- Check `rawOutput` in console logs
- Verify JDoodle credentials in Vercel environment variables

---

## What I Need from You

To help you fix this, please provide:

1. **Screenshot of browser console** showing `[FRONTEND-CODE-RUN-DEBUG]` logs
2. **Network tab screenshot** of `/api/code/run` request/response
3. **Which environment**: Local dev (`npm run dev`) or Vercel production?
4. **The problem you're testing**: Which LeetCode problem?
5. **Your code**: What code did you submit?
6. **Expected vs Actual**: What output did you get vs what was expected?

---

## Quick Test

Try this simple problem with known output:

**Problem**: Two Sum
**Input**: `[2,7,11,15]` and `9`
**Expected**: `[0,1]`

**Python Code**:
```python
class Solution:
    def twoSum(self, nums, target):
        return [0, 1]
```

**This should PASS**. If it fails, copy the console logs!
