import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";

interface StructuredDataResult {
    jsonLd: { count: number; types: string[] };
    microdata: { count: number; types: string[] };
    rdfa: { count: number };
    totalSchemas: number;
}

function extractJsonLdTypes(html: string): { count: number; types: string[] } {
    const types: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;

    while ((match = jsonLdRegex.exec(html)) !== null) {
        count++;
        try {
            const data = JSON.parse(match[1]);
            const extractTypes = (obj: any): void => {
                if (Array.isArray(obj)) {
                    obj.forEach(extractTypes);
                } else if (obj && typeof obj === "object") {
                    if (obj["@type"]) {
                        const typeVal = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
                        typeVal.forEach((t: string) => {
                            if (!types.includes(t)) types.push(t);
                        });
                    }
                    if (obj["@graph"]) extractTypes(obj["@graph"]);
                }
            };
            extractTypes(data);
        } catch {
            // Invalid JSON, still count the block
        }
    }

    return { count, types };
}

function extractMicrodataTypes(html: string): { count: number; types: string[] } {
    const types: string[] = [];
    // Match itemtype attributes
    const itemtypeRegex = /itemtype=["']([^"']+)["']/gi;
    let match;
    let count = 0;

    while ((match = itemtypeRegex.exec(html)) !== null) {
        count++;
        const typeUrl = match[1];
        // Extract schema type from URL (e.g., https://schema.org/Article -> Article)
        const typeName = typeUrl.split("/").pop();
        if (typeName && !types.includes(typeName)) {
            types.push(typeName);
        }
    }

    return { count, types };
}

function detectRdfa(html: string): { count: number } {
    // Check for RDFa markers
    const vocabCount = (html.match(/\svocab=["'][^"']*schema\.org[^"']*["']/gi) || []).length;
    const typeofCount = (html.match(/\stypeof=["'][^"']+["']/gi) || []).length;
    const propertyCount = (html.match(/\sproperty=["'][^"']+["']/gi) || []).length;

    return { count: Math.max(vocabCount, typeofCount > 0 ? 1 : 0) };
}

function analyzeStructuredData(html: string): StructuredDataResult {
    const jsonLd = extractJsonLdTypes(html);
    const microdata = extractMicrodataTypes(html);
    const rdfa = detectRdfa(html);

    return {
        jsonLd,
        microdata,
        rdfa,
        totalSchemas: jsonLd.count + microdata.count + rdfa.count,
    };
}

export const structuredDataCheck: Check = {
    id: "structured-data",
    label: "Structured Data",
    weight: CHECK_WEIGHTS["structured-data"] ?? 1.0,

    run(context: CheckContext): CheckResult {
        const { html } = context;
        const result = analyzeStructuredData(html);

        // Combine all types found (dedupe without Set to support ES5 target)
        const combined = result.jsonLd.types.concat(result.microdata.types);
        const allTypes = combined.filter((t, i) => combined.indexOf(t) === i);

        // Scoring: reward presence of structured data
        let score = 0;
        const details: string[] = [];

        if (result.jsonLd.count > 0) {
            score += 50;
            details.push(`JSON-LD (${result.jsonLd.count})`);
        }
        if (result.microdata.count > 0) {
            score += 30;
            details.push(`Microdata (${result.microdata.count})`);
        }
        if (result.rdfa.count > 0) {
            score += 20;
            details.push(`RDFa`);
        }

        // Bonus for having multiple schema types
        if (allTypes.length >= 3) {
            score = Math.min(100, score + 20);
        } else if (allTypes.length >= 1) {
            score = Math.min(100, score + 10);
        }

        const status = score >= 80 ? "pass" : score >= 40 ? "warning" : "fail";

        // Build details string
        let detailsStr: string;
        if (result.totalSchemas === 0) {
            detailsStr = "No structured data found";
        } else {
            detailsStr = details.join(", ");
            if (allTypes.length > 0) {
                const displayTypes = allTypes.slice(0, 5);
                detailsStr += ` - Types: ${displayTypes.join(", ")}`;
                if (allTypes.length > 5) {
                    detailsStr += ` +${allTypes.length - 5} more`;
                }
            }
        }

        return {
            id: this.id,
            label: this.label,
            status,
            score,
            details: detailsStr,
            recommendation: result.totalSchemas === 0
                ? "Add JSON-LD structured data to help AI understand your content"
                : score < 80
                    ? "Consider adding more schema types for richer AI comprehension"
                    : "Excellent structured data implementation",
        };
    },
};
