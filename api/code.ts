import axios from 'axios';

/**
 * Standalone Vercel serverless function – proxies JDoodle requests.
 * Credentials come from Vercel environment variables (set in dashboard or vercel.json).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { script, language, versionIndex, stdin } = req.body || {};

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script,
      language,
      versionIndex,
      stdin,
    });
    return res.status(200).json(response.data);
  } catch (e: any) {
    console.error('JDoodle error', e?.response?.data || e.message);
    return res.status(500).json({ error: e?.response?.data?.error || e.message });
  }
}

