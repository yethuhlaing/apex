import {
    TOP_TIER_DOMAINS,
    SECOND_TIER_DOMAINS,
    BONUS_POINTS,
    SCORE_THRESHOLDS,
} from "./config";

// Calculate Flesch-Kincaid readability score
export function calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const syllables = words.reduce((acc, word) => {
        return acc + (word.match(/[aeiouAEIOU]+/g) || []).length || 1;
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    return Math.max(0, Math.min(100, score));
}

// Extract text content from HTML
export function extractTextContent(html: string): string {
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    cleanHtml = cleanHtml.replace(/<[^>]+>/g, " ");

    // Decode HTML entities
    cleanHtml = cleanHtml.replace(/&nbsp;/g, " ");
    cleanHtml = cleanHtml.replace(/&amp;/g, "&");
    cleanHtml = cleanHtml.replace(/&lt;/g, "<");
    cleanHtml = cleanHtml.replace(/&gt;/g, ">");
    cleanHtml = cleanHtml.replace(/&quot;/g, '"');
    cleanHtml = cleanHtml.replace(/&#39;/g, "'");

    return cleanHtml.replace(/\s+/g, " ").trim();
}

// Fetch with timeout helper
export async function fetchWithTimeout(url: string, timeout = 3000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Get domain reputation bonus
export function getDomainReputationBonus(domain: string): number {
    const cleanDomain = domain.replace("www.", "");

    // Documentation sites get highest priority
    if (
        cleanDomain.includes("docs.") ||
        cleanDomain.includes("developer.") ||
        cleanDomain.includes("api.")
    ) {
        return BONUS_POINTS.documentationSite;
    }

    if (TOP_TIER_DOMAINS.some((d) => cleanDomain === d || cleanDomain.endsWith(`.${d}`))) {
        return BONUS_POINTS.topTierDomain;
    }

    if (SECOND_TIER_DOMAINS.some((d) => cleanDomain === d || cleanDomain.endsWith(`.${d}`))) {
        return BONUS_POINTS.secondTierDomain;
    }

    return 0;
}

// Determine check status based on score
export function getStatusFromScore(score: number): "pass" | "warning" | "fail" {
    if (score >= SCORE_THRESHOLDS.pass) return "pass";
    if (score >= SCORE_THRESHOLDS.warning) return "warning";
    return "fail";
}

// Normalize URL to ensure it has a protocol
export function normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

// Get base URL origin from a URL string
export function getBaseUrl(url: string): string {
    const baseUrl = url.startsWith("http") ? url : `https://${url}`;
    return new URL(baseUrl).origin;
}
