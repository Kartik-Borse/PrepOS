import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const ENDPOINT = 'https://api.jdoodle.com/v1/execute';

export interface JDoodleRequest {
  script: string;           // source code
  language: string;        // e.g., "nodejs", "python3"
  versionIndex: string;   // JDoodle version index for the language
  stdin?: string;          // optional input
}

export interface JDoodleResponse {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
  error?: string;
}

export async function runCode(payload: JDoodleRequest): Promise<JDoodleResponse> {
  const response = await axios.post(ENDPOINT, {
    ...payload,
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
  });
  return response.data;
}
