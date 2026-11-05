// src/services/ai/geminiClient.ts
// Shared Service for Gemini AI (Caller-Agnostic)

const API_BASE_URL = ((import.meta as any).env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');

// Shared Cache
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// In-flight requests
const inFlightRequests = new Map<string, Promise<any>>();

interface AIRequestOptions {
  prompt: string;
  systemPrompt?: string;
  module?: string; // Optional, defaults to 'paud' in backend but good for logging
  appSource?: 'CERIA' | 'SISMONEV' | 'GENERAL' | 'CHATBOT'; // Explicit source override
}

/**
 * Handle Caching and Deduplication
 */
async function withDeduplication(cacheKey: string, apiCall: () => Promise<any>): Promise<any> {
  const now = Date.now();

  // Check Cache
  const cached = requestCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  // Check In-Flight
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // Execute
  const promise = apiCall().finally(() => inFlightRequests.delete(cacheKey));
  inFlightRequests.set(cacheKey, promise);

  try {
    const result = await promise;
    requestCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Call Gemini API via Backend Proxy
 */
export async function generateContent(options: AIRequestOptions): Promise<string> {
  const { prompt, systemPrompt, appSource } = options;
  
  // Determine App Source if not provided
  let detectedSource = appSource;
  if (!detectedSource) {
      if (window.location.pathname.startsWith('/ceria')) {
          detectedSource = 'CERIA';
      } else if (window.location.pathname.startsWith('/paudhi7') || window.location.pathname.startsWith('/ran-paud')) { // Assuming main app paths
          detectedSource = 'SISMONEV'; 
      } else {
          detectedSource = 'GENERAL';
      }
  }

  const cacheKey = JSON.stringify({ prompt, systemPrompt, source: detectedSource }); // Include source in cache key

  return withDeduplication(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Source': detectedSource || 'GENERAL'
        },
        body: JSON.stringify({
          prompt,
          systemInstruction: systemPrompt,
          module: 'paud'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Quota exceeded");
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  });
}
