const PREFIX = 'ceria-analysis-v1:';
const MAX_ENTRIES = 100;
const metadata = new Map<string, { cached: boolean; savedAt?: string }>();
export const getAnalysisMetadata = (text?: string | null) => text ? metadata.get(text) : undefined;
export const copyAnalysisMetadata = (from: string, to: string) => {
    const value = metadata.get(from);
    if (value) metadata.set(to, value);
};
function registerMetadata(value: { text: string; cached?: boolean; savedAt?: string }) {
    metadata.set(value.text, { cached: !!value.cached, savedAt: value.savedAt });
}

export async function rememberAnalysis<T extends { text: string }>(
    input: unknown, generate: () => Promise<T>, signal?: AbortSignal,
    schema?: { required?: string[]; properties?: Record<string, { type?: string; nullable?: boolean }> }
): Promise<T> {
    const aborted = () => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
    const valid = (value: T) => {
        if (typeof value?.text !== 'string' || !value.text.trim()) return false;
        if (!schema) return true;
        try {
            const data = JSON.parse(value.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
            return (schema.required || []).every(field => {
                const rule = schema.properties?.[field];
                const item = data?.[field];
                if (item === undefined) return false;
                if (item === null) return rule?.nullable === true;
                if (rule?.type === 'string') return typeof item === 'string' && !!item.trim();
                if (rule?.type === 'number') return typeof item === 'number' && Number.isFinite(item);
                if (rule?.type === 'array') return Array.isArray(item);
                return true;
            });
        } catch { return false; }
    };
    aborted();
    let key: string | undefined;
    try {
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(input)));
        key = PREFIX + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
        const raw = localStorage.getItem(key);
        if (raw) {
            const saved = JSON.parse(raw);
            if (valid(saved.response)) {
                aborted();
                saved.response.cached = true;
                registerMetadata(saved.response);
                return saved.response;
            }
            localStorage.removeItem(key);
        }
    } catch { /* Storage can be unavailable; AI must still work. */ }
    aborted();
    const response = await generate();
    aborted();
    if (!valid(response)) throw new Error('Respons AI kosong atau tidak lengkap. Silakan coba lagi.');
    registerMetadata(response);
    if (key) {
        try {
            const entries = Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).sort((a, b) => {
                const time = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || '{}').savedAt || 0; } catch { return 0; } };
                return time(a) - time(b);
            });
            while (entries.length >= MAX_ENTRIES) localStorage.removeItem(entries.shift()!);
            const serialized = JSON.stringify({ savedAt: Date.now(), response });
            try { localStorage.setItem(key, serialized); }
            catch {
                // Evict only our own entries when the browser quota is full.
                while (entries.length) {
                    localStorage.removeItem(entries.shift()!);
                    try { localStorage.setItem(key, serialized); break; } catch { /* Try the next entry. */ }
                }
            }
        } catch { /* Database cache remains available even if browser storage is full. */ }
    }
    return response;
}
