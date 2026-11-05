import { ActiveAlertData, KeyIndicatorData, RegionalForecastData, DomainFilter, RegionDetailData, ResourceData, ScenarioParams, ChildProfile, GrowthRecord, GroundingSource, MonthlySummaryData, DomainComparisonData, SmartRecommendationResponse, DataValidationResult } from "../types";
import { rememberAnalysis, copyAnalysisMetadata } from './analysisMemory';

// In-memory cache for AI responses
const aiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Keep the loading transition visible for fast cached responses in the UI.
// Server-side precomputation does not need this presentation delay.
const waitForAnalysisTransition = async (startedAt: number, signal?: AbortSignal) => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (typeof window === 'undefined') return;
    const remaining = 1000 - (Date.now() - startedAt);
    if (remaining <= 0) return;
    await new Promise<void>((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, remaining);
        signal?.addEventListener('abort', onAbort, { once: true });
    });
};

// In-flight requests tracking to prevent deduplication
const inFlightRequests: Record<string, Promise<any>> = {};

const generateCacheKey = (fnName: string, params: any): string => {
    // SOP 3: Unique cache key per wilayah/user
    // We include domain/region info in params to ensure uniqueness
    return `${fnName}_${JSON.stringify(params)}`;
};

// Anti-Gravity: Throttling & Hierarchy state
let lastCallTimestamp = 0;
const MIN_CALL_INTERVAL = 3000; // 3 seconds general gap

/**
 * Anti-Gravity: Stricter structural trimming for 3-tier fallback.
 * Targets < 1200 chars and removes esensial-only data.
 */
const trimPayload = (data: any): string => {
    if (!data) return "";
    
    // Deep clone to avoid mutating original data
    let processed = JSON.parse(JSON.stringify(data));

    // 1. Smart Sorting & Limit (Max 7 items)
    if (Array.isArray(processed)) {
        // Prioritize by level if it exists (Critical/High)
        if (processed.length > 0 && processed[0].level) {
            processed.sort((a, b) => {
                const levels: Record<string, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                return (levels[b.level] || 0) - (levels[a.level] || 0);
            });
        }
        
        if (processed.length > 7) {
            console.warn(`[Anti-Gravity] Prioritizing and limiting array to 7 items`);
            processed = processed.slice(0, 7);
        }
    }

    // 2. Optimized Pruning (Strip unnecessary metadata)
    const pruneObject = (obj: any) => {
        if (typeof obj !== 'object' || obj === null) return;
        
        const fieldsToPrune = ['id', 'history', 'metadata', 'log', 'logs', 'timestamp', 'system_info', 'debug'];
        
        for (const key in obj) {
            if (fieldsToPrune.includes(key.toLowerCase())) {
                delete obj[key];
            } else if (typeof obj[key] === 'string' && obj[key].length > 300) {
                // Reduced string limit to 300
                obj[key] = obj[key].substring(0, 300) + "... [Cut]";
            } else if (typeof obj[key] === 'object') {
                pruneObject(obj[key]);
            }
        }
    };

    if (typeof processed === 'object' && !Array.isArray(processed)) {
        pruneObject(processed);
    }

    const finalStr = JSON.stringify(processed);
    
    // 3. Ultra Hard Limit (Reduced to 1000 chars)
    if (finalStr.length > 1000) {
        return finalStr.substring(0, 1000) + "... [Hard Cut]";
    }

    return finalStr;
};


/**
 * Utility to deduplicate and cache AI requests
 */
const withDeduplication = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    // Check cache first
    const cached = aiCache[key];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        await waitForAnalysisTransition(Date.now());
        console.log(`[AI Cache] Returning cached result for: ${key}`);
        return cached.data;
    }

    // Check if there's an in-flight request for the same key
    if (key in inFlightRequests) {
        console.log(`[AI Deduplication] Waiting for in-flight request: ${key}`);
        return inFlightRequests[key];
    }

    // Execute new request
    const timestamp = new Date().toISOString();
    console.log("AI_CALL_TRIGGERED", { timestamp, source: key });

    const requestPromise = fetcher();

    inFlightRequests[key] = requestPromise;

    try {
        const result = await requestPromise;
        // Save to cache
        aiCache[key] = { data: result, timestamp: Date.now() };
        return result;
    } finally {
        delete inFlightRequests[key];
    }
};


// Helper to call Paudhi7 AI Backend
const callAI = async (params: { model: string, contents: any, config?: any, systemInstruction?: string, signal?: AbortSignal, tools?: any }) => {
    const startedAt = Date.now();
    const { signal, ...cacheInput } = params;
    const response = await rememberAnalysis(cacheInput, () => requestAI(params), signal,
        params.config?.responseMimeType === 'application/json' ? (params.config.responseSchema || {}) : undefined);
    await waitForAnalysisTransition(startedAt, signal);
    return response;
};

const requestAI = async (params: { model: string, contents: any, config?: any, systemInstruction?: string, signal?: AbortSignal, tools?: any }) => {
    // 1. Anti-Gravity: General Throttling (3s Gap)
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimestamp;
    if (timeSinceLastCall < MIN_CALL_INTERVAL) {
        const waitTime = MIN_CALL_INTERVAL - timeSinceLastCall;
        console.log(`[AI Throttling] Waiting ${waitTime}ms before next call...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastCallTimestamp = Date.now();

    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-App-Source': 'CERIA'
        },
        body: JSON.stringify({
            appSource: 'CERIA',
            // Browser pages only read prepared analyses. The Node precompute
            // runner is responsible for generating missing results.
            cacheOnly: typeof window !== 'undefined',
            model: params.model,
            contents: params.contents,
            generationConfig: params.config,
            systemInstruction: params.systemInstruction, // [FIX Bug #4] top-level, bukan nested dalam config
            tools: params.tools // Explicitly pass tools to backend
        }),
        signal: params.signal
    });


    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData.message || errData.error;
        const generic = !detail || /^(internal server error|bad gateway|service unavailable)$/i.test(detail);
        throw new Error(generic && response.status >= 500
            ? `Layanan AI tidak dapat dihubungi (HTTP ${response.status}). Belum ada hasil tersimpan untuk pilihan data ini. Pastikan backend aktif lalu coba lagi.`
            : detail || response.statusText || 'AI Service Error');
    }

    const data = await response.json();
    return { 
        text: data.text as string,
        cached: data.cached as boolean | undefined,
        savedAt: data.savedAt as string | undefined,
        candidates: data.candidates // Pass through for grounding sources
    };
};

// Unified chat helper for components
export const callAIChat = async (params: { 
    history: { role: 'user' | 'model', parts: { text: string }[] }[], 
    message: string, 
    systemInstruction?: string,
    signal?: AbortSignal
}) => {
    const key = generateCacheKey('callAIChat', params);
    
    return withDeduplication(key, async () => {
        const contents = [
            ...params.history,
            { role: 'user', parts: [{ text: params.message }] }
        ];

        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents,
            // [FIX Bug #4] systemInstruction sekarang dikirim lewat field khusus di callAI,
            // bukan nested dalam config.systemInstruction
            systemInstruction: params.systemInstruction,
            signal: params.signal
        });


        return response.text;
    });
};



const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove "data:mime/type;base64," prefix
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const analyzeCsvDataWithPrompt = async (
    csvData: string, 
    userPrompt: string,
    signal?: AbortSignal
): Promise<string> => {
    const key = generateCacheKey('analyzeCsvData', { csvData: csvData.substring(0, 500), userPrompt });

    
    return withDeduplication(key, async () => {
        const prompt = `
          You are an expert data analyst. Your task is to analyze the provided CSV data based on the user's request and provide a comprehensive, well-structured analysis.

          **CSV Data:**
          \`\`\`csv
          ${csvData}
          \`\`\`

          **User's Request:**
          "${userPrompt}"

          **Instructions:**
          1.  Thoroughly analyze the data in the context of the user's request.
          2.  Provide clear, insightful findings.
          3.  If the request involves visualization, describe the key takeaways as if you were presenting a chart.
          4.  Structure your response in neat, well-formed paragraphs. Do not use markdown formatting like headings (#, ##) or bold text (**). You may use numbered or bulleted lists for clarity if needed.
          5.  The entire response must be in Bahasa Indonesia.
        `;
        
        const response = await callAI({
            model: 'gemini-2.0-flash', // Updated to 2.0-flash as per Paudhi7 standard
            contents: { parts: [{ text: prompt }] },
            signal
        });
        return response.text;

    });
};




export const extractDataFromFile = async (
    file: File,
    signal?: AbortSignal
): Promise<{headers: string[], rows: Record<string, any>[]}> => {

    try {
        const base64Data = await fileToBase64(file);

        const prompt = `You are an expert data extraction API. Your task is to analyze the provided file and extract its tabular data. Return the result as a single JSON object with two keys: 'headers' and 'rows'.
- The value of 'headers' should be a JSON array of strings representing the column headers.
- The value of 'rows' should be a JSON array of arrays, where each inner array represents a row of data corresponding to the headers. All cell values should be converted to strings.
If the file is unreadable or not tabular, return empty arrays for both 'headers' and 'rows' keys.`;
        
        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };

        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }, filePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "object",
                    properties: {
                        headers: {
                            type: "array",
                            items: { type: "string" }
                        },
                        rows: {
                            type: "array",
                            items: {
                                type: "array",
                                items: { 
                                    type: "string" 
                                }
                            }
                        }
                    },
                    required: ["headers", "rows"],
                }
            },
            signal
        });


        const jsonResponse = JSON.parse(response.text);
        const { headers, rows: dataRows } = jsonResponse;

        if (!headers || headers.length === 0 || !dataRows || dataRows.length === 0) {
            return { headers: [], rows: [] };
        }

        const rows = dataRows.map((rowArray: any[]) => {
            const rowObject: Record<string, any> = {};
            headers.forEach((header: string, index: number) => {
                rowObject[header] = rowArray[index];
            });
            return rowObject;
        });
        
        return { headers, rows };

    } catch(e) {
        console.error("Gemini API call failed in extractDataFromFile", e);
        throw new Error("Gagal mengekstrak data dengan AI. Pastikan file berisi data tabular dan coba lagi.");
    }
};


export const getExecutiveBriefing = async (
    domain: DomainFilter,
    indicators: KeyIndicatorData[],
    alerts: ActiveAlertData[],
    signal?: AbortSignal,
    analysisContext?: { year: number; datasets: unknown[] }
): Promise<string> => {

    const key = generateCacheKey('getExecutiveBriefing', { 
        domain, 
        indicators,
        alerts,
        year: analysisContext?.year ?? 2024,
        datasets: analysisContext?.datasets
    });
    
    const generate = async () => {
        // Selection Strategy: Filter indicators for CURRENT domain only
        // This ensures the AI isn't confused by irrelevant sectoral data
        const relevantIndicators = indicators.filter(ind => {
            if (domain === 'Semua') return true;
            return ind.domain === domain;
        });

        const trimmedIndicators = trimPayload(relevantIndicators);
        const trimmedAlerts = trimPayload(alerts.filter(a => domain === 'Semua' || a.domain === domain));

        const prompt = `
          Anda adalah penasihat kebijakan senior untuk program PAUDHI (Pengembangan Anak Usia Dini Holistik Integratif).
          
          Tahun data yang dipilih: ${analysisContext?.year ?? 2024}. Domain: ${domain}.
          Jangan menggunakan data tahun lain atau mengarang nilai yang tidak tersedia.
          ${analysisContext?.year === 2025 ? `Dataset lengkap tahun terpilih: ${JSON.stringify(analysisContext.datasets)}
          Gunakan total nasional yang disediakan; null berarti belum tersedia, bukan nol.
          Sumber dan tahun pengamatan pada metadata belum semuanya terverifikasi; jelaskan keterbatasannya.
          Pertahankan satuan, definisi gejala, jumlah korban (bukan kasus), dan catatan kaki.
          Kemiskinan Maret dan September adalah periode terpisah, bukan nilai tahunan.
          Gunakan label APK/APM hanya pada dataset yang secara eksplisit memuatnya; bedakan tahun ajaran 2025/2026 dari tahun kalender. Ikuti analysisScope dan qualityFlags; SD–SMA/SM hanya data pendukung, bukan indikator PAUD. Jangan menghitung risiko/prediksi tanpa dasar.
          Bandingkan wilayah menggunakan indikator yang sejenis. Jangan menganggap cakupan PKH tinggi sebagai risiko tinggi.
          Data pengasuhan, bencana, cuaca, IPM, persalinan, AKB, AKI, akreditasi dan rasio guru-murid belum diberikan.` : analysisContext?.year === 2024 ? `Dataset arsip 2024: ${JSON.stringify(analysisContext.datasets)}. Angka nasional dan tren tidak tersedia. Jangan mengarang angka, sumber resmi, tren, atau kesimpulan kausal. Skor dihitung dari indikator tersedia, bukan prevalensi.` : ''}
          
          **Indikator Utama:**
          ${trimmedIndicators}
          
          **Peringatan (Alerts) Aktif:**
          ${trimmedAlerts}

          **Instructions:**
          1.  Berikan judul yang merangkum situasi keseluruhan untuk domain terpilih.
          2.  Dalam satu paragraf, analisis situasinya. Hubungkan indikator kunci dengan peringatan aktif.
          3.  Identifikasi masalah paling mendesak nomor 1 saat ini.
          4.  Simpulkan dengan satu rekomendasi strategis prioritas tinggi.
          5.  Seluruh tanggapan harus dalam Bahasa Indonesia. Format tanggapan Anda ke dalam paragraf yang rapi. Jangan gunakan format markdown seperti heading (#, ##) atau tebal (**). Anda dapat membuat judul bagian (misalnya, "Dasar Analisis") dengan meletakkannya di baris tersendiri.
        `;

        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }] },
            signal
        });

        return response.text;
    };
    // Each component owns its AbortSignal; do not reuse an aborted in-flight call.
    return signal ? generate() : withDeduplication(key, generate);
};




export const getSmartRecommendations = async (
    alert: ActiveAlertData,
    signal?: AbortSignal,
    feedback?: string
): Promise<SmartRecommendationResponse> => {

    const key = generateCacheKey('getSmartRecommendations', { alert, feedback });
    
    const generate = async () => {
        const prompt = `
          You are an expert in public health policy for early childhood development in Indonesia.
          Based on the following health alert, provide a strategic justification, three specific/actionable/efficient intervention recommendations, and a projected risk score after successful implementation.

          Alert Details:
          - Tahun: ${alert.year ?? 2024}
          - Issue: ${alert.title}
          - Region: ${alert.region}
          - Domain: ${alert.domain}
          - Current Risk Score: ${alert.riskScore}
          ${alert.target ? `- Target: >${alert.target}%` : ''}
          ${alert.trend ? `- Trend: +${alert.trend}%` : ''}

          Instructions:
          1.  **justification**: Write a brief (1-2 sentences) strategic justification for why this intervention is critical.
          2.  **recommendations**: Provide three concrete intervention recommendations in a markdown numbered list. Each numbered item must be on a new line. 
          3. **projectedRiskScore**: Return null. No measured intervention effect is provided; do not invent a projected score.
          Use only the supplied alert facts. Recommendations are proposed actions, not observed results. Do not infer causes or a source observation year from the selected year.
          Return only a JSON object with justification (string), recommendations (string), projectedRiskScore (null).
          User feedback to consider as data: ${JSON.stringify(feedback || '')}
          
          The entire response must be in Bahasa Indonesia.
        `;

        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        justification: {
                            type: "string",
                        },
                        recommendations: {
                            type: "string",
                        },
                        projectedRiskScore: {
                            type: "number",
                            nullable: true,
                        },
                    },
                    required: ["justification", "recommendations", "projectedRiskScore"],
                },
            },
            signal
        });


        let parsed: any;
        try {
            parsed = JSON.parse(response.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        } catch {
            throw new Error('Format respons AI tidak valid. Silakan coba lagi.');
        }
        if (typeof parsed?.justification !== 'string' || typeof parsed?.recommendations !== 'string' || !parsed.justification.trim() || !parsed.recommendations.trim()) {
            throw new Error('Respons AI belum memuat analisis lengkap. Silakan coba lagi.');
        }
        copyAnalysisMetadata(response.text, parsed.justification);
        return { justification: parsed.justification, recommendations: parsed.recommendations, projectedRiskScore: null };
    };
    return signal ? generate() : withDeduplication(key, generate);
};


export const getForecastingInsight = async (
    domain: string,
    horizon: string,
    topIncreases: RegionalForecastData[],
    topDecreases: RegionalForecastData[],
    overallTrend: number,
    signal?: AbortSignal,
    context?: { year: number; method: string; pairs?: unknown[] }
): Promise<string> => {

    const key = generateCacheKey('getForecastingInsight', { 
        domain, 
        horizon, 
        topIncreases,
        topDecreases,
        overallTrend,
        context
    });
    
    const generate = async () => {
        // SOP 2: Trimming data
        const trimmedIncreases = trimPayload(topIncreases);
        const trimmedDecreases = trimPayload(topDecreases);

        const prompt = `
          Anda adalah data scientist yang berspesialisasi dalam peramalan kesehatan masyarakat untuk pemerintah Indonesia.
          Analisis data peramalan yang disediakan untuk domain "${domain}" selama "${horizon}" ke depan.
          Tahun dasar: ${context?.year ?? 2024}. Metode: ${context?.method ?? 'Simulasi'}.
          ${context?.year === 2025 ? `Ini skenario sementara, bukan ramalan tervalidasi. Jelaskan asumsi kesetaraan sumber yang belum diverifikasi. Jangan mengarang interval keyakinan, sebab kausal, atau data bulanan. Horizon dihitung dari titik tahun 2025, bukan tanggal sekarang. Besaran perubahan adalah poin skor, bukan persen. Pasangan indikator: ${JSON.stringify(context.pairs)}` : ''}

          **Data Kunci:**
          - Tren Risiko Keseluruhan: ${overallTrend > 0 ? `Meningkat rata-rata ${overallTrend.toFixed(2)} poin` : `Menurun rata-rata ${Math.abs(overallTrend).toFixed(2)} poin`}.
          - Wilayah Risiko Memburuk: ${trimmedIncreases}
          - Wilayah Risiko Membaik: ${trimmedDecreases}

          **Task:**
          Berikan wawasan analitis singkat dalam Bahasa Indonesia.
          Format tanggapan Anda ke dalam paragraf yang rapi. Jangan gunakan pemformatan markdown seperti judul (#, ##) atau tebal (**).
          
          1.  Mulai dengan judul: "Analisis Prediksi Risiko Bidang ${domain}".
          2.  Dalam paragraf ringkasan, sebutkan tren keseluruhan yang diprediksi dan implikasi utamanya.
          3.  Buat bagian "Faktor Pendorong Tren". Hipotesiskan alasan potensial di dunia nyata untuk tren keseluruhan.
          4.  Buat bagian "Analisis Wilayah Spesifik". Analisis secara singkat alasan potensial di balik wilayah risiko memburuk dan membaik.
          5.  Simpulkan dengan satu "Rekomendasi Awal" yang dapat ditindaklanjuti.
        `;
        
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }] },
            signal
        });

        return response.text;
    };
    return signal ? generate() : withDeduplication(key, generate);
};



export const getRegionalAnalysisInsight = async (
    regionData: RegionDetailData | ChildProfile,
    signal?: AbortSignal
): Promise<string> => {

    const regionName = 'name' in regionData ? regionData.name : 'Unknown';
    // Use domain names in cache key to distinguish between domain-specific regional insights
    const key = generateCacheKey('getRegionalAnalysisInsight', { regionData });
    
    const generate = async () => {
        // SOP 2: Trimming regional data
        const trimmedData = JSON.stringify(regionData);

        const prompt = `
          Anda adalah analis kebijakan lintas sektoral untuk PAUDHI di Indonesia. Tugas Anda adalah menemukan korelasi tersembunyi antara domain layanan yang berbeda berdasarkan data untuk wilayah tertentu.

          **Data Wilayah: ${regionName}**
          ${trimmedData}

          **Task:**
          1.  Analisis metrik yang disediakan di semua domain.
          2.  Identifikasi korelasi antar-domain yang paling signifikan.
          3.  Tulis wawasan singkat dalam Bahasa Indonesia. Format tanggapan Anda ke dalam paragraf yang rapi. Jangan gunakan pemformatan markdown.
          4.  Mulai dengan judul: "Analisis Ketergantungan Data untuk ${regionName}".
          5.  Sebutkan dengan jelas korelasi yang teridentifikasi dan jelaskan kemungkinan tautan kausal.
          6.  Simpulkan dengan bagian "Hipotesis untuk Investigasi": satu pertanyaan yang memicu pemikiran.
        `;
        
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }] },
            signal
        });

        return response.text;
    };
    return signal ? generate() : withDeduplication(key, generate);
};



export const generateAllocationSuggestion = async (
    totalBudget: number,
    resourceData: ResourceData,
    highestRiskRegions: string[],
    signal?: AbortSignal
): Promise<{ content: string; sources: GroundingSource[] }> => {

    // SOP 2: Trimming data
    const trimmedResourceData = trimPayload(resourceData);
    const trimmedRegions = trimPayload(highestRiskRegions);

    const prompt = `
      You are an economic advisor for the Indonesian government specializing in resource optimization for public health programs, specifically PAUDHI.
      Your objective is to create an optimal resource allocation plan to maximize impact on reducing stunting and improving child health outcomes.

      Current State & Constraints:
      - Total Available Budget: ${totalBudget.toLocaleString('id-ID')} Miliar IDR.
      - Highest Risk Regions (Priority): ${trimmedRegions}
      - Forecasted Demand (Deficit):
        ${trimmedResourceData}

      Task:
      Based on the principles of cost-effectiveness and maximizing impact, provide a strategic resource allocation recommendation.
      1. Start with a title and a 1-2 sentence summary of your strategic approach.
      2. Provide a clear, actionable allocation plan broken down by Anggaran, SDM, and Material.
      3. For each allocation, provide a brief justification ("Justifikasi") explaining why this allocation is optimal for impact.
      4. Use Google Search to find and cite the latest Indonesian government regulations (Peraturan Pemerintah), presidential decrees (Perpres), or ministerial regulations (Permenkes/Permendikbud) related to stunting prevention, PAUDHI, and national health budgets. Base your recommendations on these official sources.
      5. Ensure the total proposed budget allocation does not exceed the available budget.
      6. The entire response must be in Bahasa Indonesia and formatted into neat paragraphs. Do not use markdown formatting like headings (#, ##) or bolding (**). You may use numbered lists for clarity.
    `;
    
    try {
        const response = await callAI({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                // removed tools from config as they are a top-level param now
            },
            tools: [{googleSearch: {}}],
            signal
        });


        
        const content = response.text;
        const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = (groundingChunks as any[])
            .filter(chunk => chunk.web?.uri && chunk.web?.title)
            .map(chunk => ({
                web: {
                    uri: chunk.web!.uri!,
                    title: chunk.web!.title!,
                }
            }));


        return { content, sources };
    } catch (e) {
        console.error("Gemini API call failed in generateAllocationSuggestion", e);
        throw new Error("Gagal menghasilkan saran dari AI. Periksa Kunci API dan koneksi jaringan.");
    }
};

export const generateScenarioAnalysis = async (
    params: ScenarioParams,
    signal?: AbortSignal
): Promise<{ content: string, sources: GroundingSource[] }> => {

    const prompt = `
      You are a senior public policy analyst for the Indonesian government.
      Your task is to analyze the potential impact of a "what-if" scenario related to resource allocation for PAUDHI.

      Scenario Details:
      - Budget Change: Anggaran intervensi ${params.budgetChange > 0 ? `dinaikkan sebesar ${params.budgetChange}` : `dikurangi sebesar ${Math.abs(params.budgetChange)}`}%
      - SDM Focus: Prioritas pengerahan SDM difokuskan pada bidang **${params.sdmFocus}**.
      - Regional Focus: Alokasi diprioritaskan untuk wilayah **${params.regionFocus}**.

      Task:
      Provide a concise analysis of this scenario in neat paragraphs.
      1. Start with a clear title summarizing the scenario.
      2. Write a "Ringkasan Eksekutif" (1-2 sentences) of the most likely outcome.
      3. Create a "Potensi Keuntungan" section listing 2-3 potential positive impacts.
      4. Create a "Potensi Risiko" section listing 2-3 potential negative impacts or trade-offs.
      5. Conclude with a "Rekomendasi Mitigasi" section, suggesting one key action to maximize benefits and minimize risks.
      6. Use Google Search to incorporate recent news, official government statements, or policy shifts in Indonesia that could affect this scenario's outcome. Cite your sources.
      7. Do not use markdown formatting like headings (#, ##) or bolding (**). You may create section titles (e.g., "Potensi Keuntungan") by placing them on their own line.
      8. The entire response must be in Bahasa Indonesia.
    `;
    
    try {
        const response = await callAI({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                // removed tools from config as they are a top-level param now
            },
            tools: [{ googleSearch: {} }],
            signal
        });


        
        const content = response.text;
        const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = (groundingChunks as any[])
            .filter(chunk => chunk.web?.uri && chunk.web?.title)
            .map(chunk => ({
                web: {
                    uri: chunk.web!.uri!,
                    title: chunk.web!.title!,
                }
            }));


        return { content, sources };
    } catch (e) {
        console.error("Gemini API call failed in generateScenarioAnalysis", e);
        throw new Error("Gagal menghasilkan analisis skenario dari AI. Periksa Kunci API dan koneksi jaringan.");
    }
};

export const getParentingInsight = async (
    childProfile: ChildProfile,
    latestGrowth: GrowthRecord | null,
    signal?: AbortSignal
): Promise<string> => {

    const prompt = `
      You are a friendly and encouraging early childhood development expert.
      Provide a short, personalized, and actionable tip for a parent based on their child's latest data.
      The child's name is ${childProfile.name}, age ${childProfile.age}.
      Latest measurement: Weight ${latestGrowth?.weight} kg, Height ${latestGrowth?.height} cm.
      Keep it concise (2-3 sentences) and in Bahasa Indonesia.
      Format the response as a clean paragraph without any markdown formatting (like **, #, *, etc.).
      Focus on a positive and encouraging tone.
    `;

    try {
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: prompt,
            signal
        });

        return response.text;
    } catch (e) {
        console.error("Gemini API call failed in getParentingInsight", e);
        return `Halo Ayah/Bunda! Terus pantau pertumbuhan ${childProfile.name} ya. Pastikan untuk selalu memberikan makanan bergizi seimbang dan stimulasi yang sesuai usianya.`;
    }
};

export const getMonthlyPerformanceInsight = async (
    monthName: string,
    summary: MonthlySummaryData,
    signal?: AbortSignal
): Promise<string> => {


    // SOP 2: Trimming data
    const trimmedSummary = trimPayload(summary);

    const prompt = `
        You are a public policy analyst for PAUDHI Indonesia.
        Summarize the national performance for ${monthName} based on the following data.

        **Data for ${monthName}:**
        ${trimmedSummary}

        **Task:**
        Provide an executive summary and a justification in neat paragraphs and Bahasa Indonesia.
        1.  Create a title: "Ringkasan Kinerja Bulan ${monthName}".
        2.  Write an "Analisis Umum" section summarizing the national trend.
        3.  Highlight "Wilayah Berkinerja Terbaik" and explain why they are important to study.
        4.  Highlight "Wilayah Perlu Perhatian" and suggest initial actions.
        5.  Provide a concluding "Rekomendasi" on next steps.
        6.  Add a "Dasar Analisis" section explaining your logic, focusing on why top movers are critical signals.
        7.  Do not use markdown formatting like headings (#, ##) or bolding (**). You may create section titles by placing them on their own line.
    `;
    
    try {
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: prompt,
            signal
        });


        return response.text;
    } catch (e) {
        console.error("Gemini API call failed in getMonthlyPerformanceInsight", e);
        const trendText = summary.nationalRisk.change > 0 ? 'sedikit memburuk' : 'menunjukkan perbaikan';
        return `### Gagal Memuat Analisis AI
        
Terjadi kesalahan. Analisis manual: Kinerja nasional bulan ${monthName} ${trendText}. Perlu investigasi lebih lanjut pada wilayah ${summary.topWorseningRegions.map(r => r.name).join(', ')}.`;
    }
};

export const getDomainComparisonInsight = async (
    year: number,
    comparisonData: DomainComparisonData,
    signal?: AbortSignal
): Promise<string> => {


    // SOP 2: Trimming data
    const trimmedComparison = trimPayload(comparisonData);

     const prompt = `
        You are a public policy analyst for PAUDHI Indonesia.
        Provide a comparative analysis across all service domains for the year ${year}.

        **Data for ${year}:**
        ${trimmedComparison}

        **Task:**
        Provide an executive summary and justification in neat paragraphs and Bahasa Indonesia.
        1.  Create a title: "Analisis Perbandingan Antar Domain Tahun ${year}".
        2.  Identify and analyze the "Tantangan Utama" (the domain with the highest average risk).
        3.  Identify and analyze the "Bidang Paling Stabil" (the domain with the lowest average risk).
        4.  Discuss the "Kesenjangan Kinerja" by using the best/worst performer data as examples.
        5.  Provide a concluding "Rekomendasi Strategis".
        6.  Add a "Dasar Analisis" section explaining your comparative logic.
        7.  Do not use markdown formatting like headings (#, ##) or bolding (**). You may create section titles by placing them on their own line.
    `;
    
    try {
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: prompt,
            signal
        });


        return response.text;
    } catch (e) {
        console.error("Gemini API call failed in getDomainComparisonInsight", e);
        const highestRiskDomain = [...comparisonData.stats].sort((a,b) => b.averageRisk - a.averageRisk)[0];
        return `### Gagal Memuat Analisis AI

Terjadi kesalahan. Analisis manual: Bidang **${highestRiskDomain.domain}** menunjukkan tantangan terbesar tahun ini dengan skor risiko rata-rata **${highestRiskDomain.averageRisk.toFixed(1)}**.`;
    }
};

export const validateUploadedData = async (
    csvData: string,
    signal?: AbortSignal
): Promise<DataValidationResult> => {
    // SOP 2: Trimming uploaded data for validation
    const trimmedCsv = csvData.length > 5000 ? csvData.substring(0, 5000) + "... [Data Trimmed for Validation]" : csvData;

    const prompt = `
        You are an expert data quality analyst for the Indonesian Ministry of Health, specializing in Early Childhood Development data (PAUDHI).

        Your task is to validate a CSV data file.

        The expected columns and their approximate valid ranges are:
        - province: String (Valid Indonesian province name)
        - cityName: String (Valid Indonesian city/regency name)
        - period: String (Format YYYY-MM)
        - stuntingRate: Number (0-60, anything above 45 is a high outlier)
        - apm: Number (0-100)
        - immunizationRate: Number (0-100)
        - sanitationAccess: Number (0-100)

        CSV Data to Validate:
        \`\`\`csv
        ${trimmedCsv}
        \`\`\`

        Instructions:
        1.  Analyze the provided CSV data. The first line is the header.
        2.  Check for the following issues:
            - Missing values in any cell.
            - Incorrect data types (e.g., text in a number column).
            - Outliers (e.g., stuntingRate > 60, apm > 100).
            - Logical inconsistencies (e.g., a cityName that does not belong to the given province).
            - Formatting errors (e.g., incorrect period format).
        3.  Return a JSON object with the following structure:
            - status: "success" if no major issues are found, otherwise "issues_found".
            - summary: A brief one-sentence summary of the validation result in Bahasa Indonesia.
            - issues: An array of objects, where each object represents a specific issue found. Include the row number (starting from 1 for the first data row), column name, the problematic value, and a clear description of the issue in Bahasa Indonesia. If no issues are found, return an empty array.
    `;

    try {
        const response = await callAI({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        summary: { type: "string" },
                        issues: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    row: { type: "number" },
                                    column: { type: "string" },
                                    value: { type: "string" },
                                    description: { type: "string" },
                                },
                                required: ["row", "column", "value", "description"],
                            }
                        }
                    },
                    required: ["status", "summary", "issues"],
                },
            },
            signal
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DataValidationResult;
    } catch (e) {
        console.error("Gemini API call failed in validateUploadedData", e);
        return {
            status: 'issues_found',
            summary: "Gagal memvalidasi data dengan AI.",
            issues: [{
                row: 0,
                column: 'System',
                value: 'Error',
                description: 'Terjadi kesalahan saat berkomunikasi dengan layanan AI. Harap periksa koneksi atau coba lagi nanti.'
            }],
        };
    }
};

