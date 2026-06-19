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

export class JDoodleApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'JDoodleApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function runCode(payload: JDoodleRequest): Promise<JDoodleResponse> {
  try {
    const response = await axios.post(ENDPOINT, {
      ...payload,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const jdoodleMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'JDoodle request failed';

    if (status === 429) {
      throw new JDoodleApiError(
        'JDoodle rate limit reached. Please wait a minute or switch execution provider.',
        429,
        error?.response?.data
      );
    }

    throw new JDoodleApiError(jdoodleMessage, status, error?.response?.data);
  }
}
