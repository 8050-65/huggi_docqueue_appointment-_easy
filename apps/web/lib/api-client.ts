// apps/web/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RefreshResult = { accessToken: string; refreshToken: string } | null;
type RefreshCallback = () => Promise<RefreshResult>;

export class ApiClient {
  private token: string | null = null;
  private refreshCallback: RefreshCallback | null = null;
  private refreshPromise: Promise<RefreshResult> | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  setRefreshCallback(cb: RefreshCallback) {
    this.refreshCallback = cb;
  }

  private doFetch(method: string, endpoint: string, body?: unknown): Promise<Response> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    let response = await this.doFetch(method, endpoint, body);

    if (response.status === 401 && this.refreshCallback && !endpoint.startsWith('/auth/')) {
      // Serialize concurrent 401s — all share the same in-flight refresh
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshCallback().finally(() => {
          this.refreshPromise = null;
        });
      }
      const result = await this.refreshPromise;
      if (result) {
        response = await this.doFetch(method, endpoint, body);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>('POST', endpoint, body);
  }

  patch<T>(endpoint: string, body: unknown) {
    return this.request<T>('PATCH', endpoint, body);
  }

  delete<T>(endpoint: string) {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient();
