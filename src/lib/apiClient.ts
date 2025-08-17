export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number; // SLA timeout
  retries?: number; // retry count
  retryDelayMs?: number; // base delay for backoff
  cache?: RequestCache;
}

const defaultOptions: Required<Pick<ApiOptions, "timeoutMs" | "retries" | "retryDelayMs">> = {
  timeoutMs: 15000,
  retries: 1,
  retryDelayMs: 400,
};

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number }) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), init.timeoutMs ?? defaultOptions.timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function apiRequest<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", headers, body, cache, timeoutMs, retries, retryDelayMs } = options;
  const maxRetries = retries ?? defaultOptions.retries;
  const delayBase = retryDelayMs ?? defaultOptions.retryDelayMs;

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    try {
      const res = await fetchWithTimeout(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache,
        timeoutMs,
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const message = isJson ? (data?.error || data?.message || res.statusText) : res.statusText;
        const err = new Error(message);
        (err as any).status = res.status;
        (err as any).data = data;
        throw err;
      }

      return data as T;
    } catch (e: any) {
      lastError = e;
      const isAbort = e?.name === "AbortError";
      const isNetwork = isAbort || e?.status === 0 || e?.message?.includes("Failed to fetch");
      if (attempt < maxRetries && isNetwork) {
        const backoff = delayBase * Math.pow(2, attempt);
        await sleep(backoff);
        attempt += 1;
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

export const apiGet = <T = any>(url: string, options: Omit<ApiOptions, "method" | "body"> = {}) =>
  apiRequest<T>(url, { ...options, method: "GET" });

export const apiPost = <T = any>(url: string, body?: any, options: Omit<ApiOptions, "method" | "body"> = {}) =>
  apiRequest<T>(url, { ...options, method: "POST", body });
