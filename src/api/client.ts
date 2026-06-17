import { API_BASE_URL, API_KEY } from '../styles/theme';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export interface ApiEnvelope<T> {
  data: T;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl || API_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey || API_KEY;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
    if (this.apiKey) headers.set('X-API-Key', this.apiKey);

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    if (typeof payload === 'object' && payload && 'data' in payload) {
      return (payload as ApiEnvelope<T>).data;
    }

    return payload as T;
  }
}

export const apiClient = new ApiClient();
