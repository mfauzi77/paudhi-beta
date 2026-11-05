const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const pool = require('../dbPostgres');
const appSourceMiddleware = require('../middleware/appSource');
const crypto = require('crypto');
const analysisStore = require('../services/ceriaAnalysisStore').createAnalysisStore(pool);
// Apply middleware to all AI routes
router.use(appSourceMiddleware);

// --- Enhanced In-Memory Cache with Cleanup ---
const requestCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour (Reduced from 24h)
const MAX_CACHE_SIZE = 1000; 

const cleanupCache = () => {
    if (requestCache.size > MAX_CACHE_SIZE) {
        let removedCount = 0;
        const limit = MAX_CACHE_SIZE * 0.2;
        for (const [key, value] of requestCache.entries()) {
            if (Date.now() - value.timestamp > CACHE_TTL || removedCount < limit) {
                requestCache.delete(key);
                removedCount++;
            }
            if (removedCount >= limit) break;
        }
    }
};
setInterval(cleanupCache, 1000 * 60 * 60);

const inFlightRequests = new Map();

/**
 * Generate cache key - Includes AppSource for isolation
 * Uses SHA-256 to prevent collisions from truncation
 */
const getCacheKey = (appSource, prompt, contents, generationConfig, systemInstruction) => {
    const contentStr = JSON.stringify({ 
        module: appSource,
        prompt,
        contents,
        config: generationConfig,
        systemInstruction
    });
    
    // Use SHA-256 for a stable, unique key
    const hash = crypto.createHash('sha256').update(contentStr).digest('hex');
    return `${appSource}:${hash}`;
};

/**
 * Deduplication
 */
const withDeduplication = async (key, requestFn) => {
    const existing = inFlightRequests.get(key);
    if (existing) {
        console.log(`[AI Proxy] Deduplicating request: ${key.substring(0, 50)}...`);
        return existing;
    }
    
    const promise = requestFn().finally(() => {
        inFlightRequests.delete(key);
    });
    inFlightRequests.set(key, promise);
    return promise;
};

// Helper for logging to DB (Non-blocking)
const logToHistory = async (appOwner, prompt, response, status, errorMsg = null) => {
    try {
        const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt || '');
        const promptPreview = promptStr.substring(0, 500);
        await pool.query(
            `INSERT INTO ai_history (app_owner, prompt_preview, response, status, error_message, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [appOwner, promptPreview, response, status, errorMsg]
        );
    } catch (err) {
        console.error('[AI Log] Failed to insert history:', err.message);
    }
};

/**
 * POST /api/ai/generate
 */
router.post('/generate', async (req, res) => {
    const { appSource, apiKey, systemPrompt: configSystemPrompt, model } = req.aiConfig || { appSource: 'GENERAL' };
    
    try {
        const { prompt, contents, generationConfig, systemInstruction } = req.body;

        if (!prompt && !contents) {
            return res.status(400).json({ error: 'Prompt or contents is required' });
        }

        const cacheKey = getCacheKey(appSource, prompt, contents, generationConfig, {
            version: 2, systemInstruction: systemInstruction || configSystemPrompt,
            model, tools: req.body.tools
        });
        if (appSource === 'CERIA') {
            try {
                const saved = await analysisStore.get(cacheKey);
                if (saved) return res.json(saved);
            } catch (error) {
                console.warn('[CERIA Cache] Database read unavailable:', error.message);
            }
        }
        
        // 1. Check Cache
        const cached = requestCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`[AI Proxy] Cache hit for ${appSource}`);
            return res.json({ text: cached.text, cached: true });
        }
        if (req.ceriaCacheProbe) return res.status(404).json({ error: 'Cache miss' });
        if (appSource === 'CERIA' && (process.env.CERIA_CACHE_ONLY === 'true' || req.body.cacheOnly === true) && !req.ceriaPrecompute) {
            return res.status(503).json({ error: 'Analysis not prepared', message: 'Analisis untuk pilihan data ini belum disiapkan. Silakan pilih analisis lain yang tersedia.' });
        }
        if (!apiKey) {
            return res.status(500).json({ error: `AI Service not configured for ${appSource}` });
        }

        // 2. Fetch from Gemini with Retry Logic
        const result = await withDeduplication(cacheKey, async () => {
             console.log(`[AI Proxy] Initial attempt for ${appSource}`);
             
             // List of keys to try (deduplicated)
             const keysToTry = [...new Set([apiKey, ...(req.aiConfig.apiKeys || [])])].filter(Boolean);
             // List of models to try
             const baseModel = model || process.env.GEMINI_MODEL || req.aiConfig.model || 'gemini-2.0-flash';
             const modelsToTry = [baseModel, ...(req.aiConfig.fallbackModels || [])];

             let lastError = null;

             const callOpenRouter = async (model, contents, apiKey, systemInstruction) => {
                 let openRouterModel = model;
                 if (openRouterModel.startsWith('gemini')) {
                     openRouterModel = 'google/' + openRouterModel;
                 }

                 console.log(`[AI Proxy] Calling OpenRouter (${openRouterModel}) using key ending in ...${apiKey.slice(-4)}`);
                 
                 // ESM Dynamic Import workaround to avoid 'ERR_REQUIRE_ESM' crash on startup
                 const { OpenRouter } = await import('@openrouter/sdk');
                 
                 const openrouter = new OpenRouter({ 
                     apiKey,
                     defaultHeaders: {
                         "HTTP-Referer": process.env.FRONTEND_URL || "https://paudhi.kemenkopmk.go.id",
                         "X-OpenRouter-Title": "PAUD HI Dashboard"
                     }
                 });
                 
                 const messages = [];
                 if (systemInstruction || configSystemPrompt) {
                     messages.push({ role: "system", content: systemInstruction || configSystemPrompt });
                 }

                 if (Array.isArray(contents)) {
                     contents.forEach(c => {
                         const role = c.role === 'model' ? 'assistant' : 'user';
                         let content = "";
                         if (Array.isArray(c.parts)) {
                             content = c.parts.map(p => p.text).join("\n");
                         } else {
                             content = c.parts || "";
                         }
                         messages.push({ role, content });
                     });
                 } else if (typeof contents === 'object') {
                     const role = contents.role === 'model' ? 'assistant' : 'user';
                     const content = Array.isArray(contents.parts) ? contents.parts.map(p => p.text).join("\n") : (contents.parts || "");
                     messages.push({ role, content });
                 }

                 const config = generationConfig || {};
                 if (config.responseMimeType === 'application/json') {
                     messages.push({ role: 'system', content: `Return only valid JSON matching this schema: ${JSON.stringify(config.responseSchema || { type: 'object' })}` });
                 }
                 
                 const openRouterParams = {
                     model: openRouterModel,
                     messages: messages,
                     stream: false,
                     ...(config.responseMimeType === 'application/json' ? { responseFormat: { type: 'json_object' } } : {}),
                     temperature: config.temperature ?? 0.7,
                     maxTokens: Math.min(config.max_tokens || config.maxOutputTokens || config.max_output_tokens || req.aiConfig.maxOutputTokens || 4000, req.ceriaPrecompute ? req.ceriaBatchMaxOutputTokens || 16000 : 16000),
                     topP: config.top_p ?? config.topP ?? 1.0,
                     frequencyPenalty: config.frequency_penalty ?? 0.0,
                     presencePenalty: config.presence_penalty ?? 0.0,
                 };

                 console.log(`[OpenRouter] Sending request. Messages count: ${messages.length}`);

                 // Use correctly nested parameters for OpenRouter SDK
                 const response = await openrouter.chat.send({
                     chatGenerationParams: openRouterParams
                 });
                 if (response.choices[0]?.finishReason === 'length') {
                     throw new Error('Respons AI terpotong oleh batas token; hasil tidak disimpan.');
                 }

                 return {
                     text: response.choices[0]?.message?.content || "",
                     modelUsed: openRouterModel,
                     candidates: response.choices
                 };
             };

             for (const currentModel of modelsToTry) {
                 for (const currentKey of keysToTry) {
                      try {
                          if (currentKey.startsWith('sk-or-')) {
                              return await callOpenRouter(currentModel, contents, currentKey, systemInstruction);
                          }

                          let geminiModel = currentModel;
                          if (geminiModel.startsWith('google/')) {
                              geminiModel = geminiModel.replace('google/', '');
                          }
                          
                          // If it's not a gemini model and we are using GoogleGenAI SDK, skip it
                          if (!geminiModel.includes('gemini')) {
                              console.warn(`[AI Proxy] Skipping non-gemini model ${currentModel} for Google SDK`);
                              continue; 
                          }

                          console.log(`[AI Proxy] Calling Gemini (${geminiModel}) for ${appSource} using key ending in ...${currentKey.slice(-4)}`);
                          const genAI = new GoogleGenAI({ apiKey: currentKey });
                         
                         // Prioritize request system instruction, fallback to config
                         const finalSystemInstruction = systemInstruction || configSystemPrompt;

                         // Normalize contents for SDK
                         let finalContents = contents;
                         if (prompt && !contents) {
                             finalContents = [{ role: 'user', parts: [{ text: prompt }] }];
                         } else if (typeof contents === 'string') {
                             finalContents = [{ role: 'user', parts: [{ text: contents }] }];
                         } else if (contents && !Array.isArray(contents)) {
                             // Handle single content object
                             finalContents = [contents];
                         }

                         // Ensure parts are valid (SDK requirement)
                         if (Array.isArray(finalContents)) {
                            finalContents = finalContents.map(c => {
                                if (typeof c === 'string') return { role: 'user', parts: [{ text: c }] };
                                if (c.parts && !Array.isArray(c.parts)) c.parts = [c.parts];
                                return c;
                            });
                         }

                          const response = await genAI.models.generateContent({ 
                              model: geminiModel,
                              contents: finalContents,
                              config: {
                                  ...(generationConfig || {}),
                                  maxOutputTokens: generationConfig?.maxOutputTokens || req.aiConfig.maxOutputTokens || 2048,
                                  systemInstruction: finalSystemInstruction
                              },
                              tools: req.body.tools // Support Google Search grounding
                          });

                         // Extract text from SDK response
                         const text = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || "";
                         
                         // Enhanced result with candidates if it was grounding
                         return { 
                             text, 
                             modelUsed: geminiModel,
                             candidates: response.candidates 
                         };
                     } catch (err) {
                         lastError = err;
                         // Offline batch pauses on the first provider failure rather than
                         // rotating keys/models and consuming more quota.
                         if (req.ceriaPrecompute) throw err;
                         const isRateLimit = err.status === 429 || err.statusCode === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
                         const isKeyError = /api key.*(invalid|not valid)|invalid api key|unauthenticated|permission denied/i.test(err.message || '')
                             || [401, 403].includes(err.status) || [401, 403].includes(err.statusCode);

                         if (isRateLimit) {
                             console.warn(`[AI Proxy] Rate limit hit for model ${currentModel} with key ...${currentKey.slice(-4)}. Trying next option...`);
                             continue; // Try next key/model
                         }

                         if (isKeyError) {
                             console.warn(`[AI Proxy] Key rejected for model ${currentModel} (key ending ...${currentKey.slice(-4)}). Trying next key...`);
                             continue;
                         }

                         // If it's not a rate limit error, we might want to fail fast or try another key depending on the error
                         console.error(`[AI Proxy] Error with ${currentModel}:`, err.message);

                         const isNotFound = err.statusCode === 404 || err.status === 404 || err.message?.includes('not found') || err.message?.includes('endpoints found') || err.message?.includes('model');

                         if (isNotFound) {
                             console.warn(`[AI Proxy] Model ${currentModel} not found. Trying next model...`);
                             continue; // Try next model
                         }

                         throw err; // Rethrow other errors
                     }
                 }
             }

             // If we reach here, all attempts failed
             throw lastError || new Error('All AI fallback attempts failed');
        });

        // Reject empty/malformed structured output before making it persistent.
        if (typeof result.text !== 'string' || !result.text.trim()) throw new Error('Respons AI kosong. Silakan coba lagi.');
        if (generationConfig?.responseMimeType === 'application/json') {
            result.text = result.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
            const parsed = JSON.parse(result.text);
            for (const field of generationConfig.responseSchema?.required || []) {
                const value = parsed?.[field];
                const rule = generationConfig.responseSchema?.properties?.[field];
                if (value === undefined || (value === null && !rule?.nullable)
                    || (value !== null && rule?.type === 'string' && (typeof value !== 'string' || !value.trim()))
                    || (value !== null && rule?.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value)))
                    || (value !== null && rule?.type === 'array' && !Array.isArray(value))) {
                    throw new Error('Respons AI tidak lengkap. Silakan coba lagi.');
                }
            }
        }
        const savedAt = new Date().toISOString();
        let persistenceError = false;
        if (appSource === 'CERIA') {
            try {
                await analysisStore.set(cacheKey, { text: result.text, model: result.modelUsed, candidates: result.candidates });
            } catch (error) {
                persistenceError = true;
                console.warn('[CERIA Cache] Database write unavailable:', error.message);
            }
        }
        // 3. Store in cache & Log success
        requestCache.set(cacheKey, { text: result.text, timestamp: Date.now() });
        logToHistory(appSource, prompt || contents, result.text, 'success', `Model: ${result.modelUsed}`);
        
        res.json({ text: result.text, cached: false, savedAt, persistenceError, model: result.modelUsed, candidates: result.candidates });

    } catch (error) {
        console.error(`AI Error [${appSource}]:`, { status: error.statusCode || error.status, message: error.message });
        
        // Log failure
        logToHistory(appSource, req.body.prompt, null, 'failed', error.message);

        const providerStatus = error.statusCode || error.status;
        const retryAfter = error.response$?.headers?.get?.('retry-after') || error.error?.metadata?.headers?.['Retry-After'];
        if (retryAfter && /^\d+$/.test(String(retryAfter))) res.set('Retry-After', String(retryAfter));
        if (providerStatus === 402) {
            return res.status(402).json({ error: 'AI credit limit', message: 'Penyedia AI membatasi kredit permintaan. Hasil tersimpan tetap dapat dibuka; analisis baru perlu menunggu atau ketersediaan kredit.', retryAfter: retryAfter || null });
        }
        const isRateLimit = providerStatus === 429 || error.message?.includes('429');
        
        if (isRateLimit) {
            // Log specifically for rate limit
            logToHistory(appSource, req.body.prompt, null, 'rate_limited', 'Quota Exceeded');
            
            return res.status(429).json({ 
                error: 'Quota exceeded', 
                message: `Layanan AI untuk ${appSource} sedang sibuk. Silakan coba lagi nanti.` 
            });
        }

        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message || 'Terjadi kesalahan pada layanan AI.' 
        });
    }
});

module.exports = router;
