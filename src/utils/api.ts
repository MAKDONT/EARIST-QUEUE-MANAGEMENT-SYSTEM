/**
 * API Base URL Configuration
 * Uses VITE_API_URL environment variable in production (Vercel)
 * Defaults to localhost for development
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Build a full API URL from an endpoint path
 * @param endpoint - The API endpoint (e.g., '/api/faculty', '/api/queue/monitor')
 * @returns Full URL to the backend API
 */
export function getApiUrl(endpoint: string): string {
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper for fetch requests with automatic URL resolution
 * @param endpoint - The API endpoint (e.g., '/api/faculty')
 * @param options - Standard fetch options
 * @returns fetch() response
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  // Ensure credentials are sent (for cookies/auth)
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  return fetch(url, fetchOptions);
}

/**
 * Helper for JSON API requests
 * @param endpoint - The API endpoint
 * @param options - fetch options (headers will be merged)
 * @returns parsed JSON response
 */
export async function apiJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Helper for form data uploads (multipart/form-data)
 * @param endpoint - The API endpoint
 * @param formData - FormData object
 * @returns parsed JSON response
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header; browser will set it with boundary
    headers: {
      // Remove Content-Type to let the browser set it
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL };
