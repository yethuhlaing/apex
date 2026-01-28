import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";

type Severity = "none" | "light" | "moderate" | "aggressive";

interface DetectionResult {
    detected: string[];
    severity: Severity;
}

// Detection patterns for various anti-bot measures
const DETECTION_PATTERNS = {
    captcha: [
        { pattern: /recaptcha/i, name: "reCAPTCHA", severity: "moderate" as Severity },
        { pattern: /hcaptcha/i, name: "hCaptcha", severity: "moderate" as Severity },
        { pattern: /turnstile/i, name: "Cloudflare Turnstile", severity: "light" as Severity },
        { pattern: /captcha/i, name: "Generic CAPTCHA", severity: "moderate" as Severity },
    ],
    botDetection: [
        { pattern: /cloudflare.*challenge/i, name: "Cloudflare Challenge", severity: "aggressive" as Severity },
        { pattern: /__cf_bm|cf-ray|cf_clearance/i, name: "Cloudflare Bot Management", severity: "moderate" as Severity },
        { pattern: /akamai.*bot/i, name: "Akamai Bot Manager", severity: "aggressive" as Severity },
        { pattern: /perimeterx|_pxhd|_pxvid/i, name: "PerimeterX", severity: "aggressive" as Severity },
        { pattern: /datadome/i, name: "DataDome", severity: "aggressive" as Severity },
        { pattern: /imperva|incapsula/i, name: "Imperva/Incapsula", severity: "aggressive" as Severity },
        { pattern: /kasada/i, name: "Kasada", severity: "aggressive" as Severity },
        { pattern: /shape.*security/i, name: "Shape Security", severity: "aggressive" as Severity },
    ],
    fingerprinting: [
        { pattern: /fingerprintjs|fpjs/i, name: "FingerprintJS", severity: "moderate" as Severity },
        { pattern: /canvas.*fingerprint/i, name: "Canvas Fingerprinting", severity: "light" as Severity },
        { pattern: /webgl.*fingerprint/i, name: "WebGL Fingerprinting", severity: "light" as Severity },
    ],
    honeypot: [
        { pattern: /<input[^>]*type=["']?hidden["']?[^>]*name=["']?(hp_|honeypot|trap)/i, name: "Honeypot Field", severity: "light" as Severity },
        { pattern: /display:\s*none[^}]*<input/i, name: "Hidden Input Trap", severity: "light" as Severity },
    ],
} as const;

const SEVERITY_ORDER: Severity[] = ["none", "light", "moderate", "aggressive"];

function detectAntiBotMeasures(html: string, metadata: Record<string, any>): DetectionResult {
    const detected: string[] = [];
    let maxSeverity: Severity = "none";

    // Check all pattern categories
    for (const patterns of Object.values(DETECTION_PATTERNS)) {
        for (const { pattern, name, severity } of patterns) {
            if (pattern.test(html)) {
                if (!detected.includes(name)) {
                    detected.push(name);
                    if (SEVERITY_ORDER.indexOf(severity) > SEVERITY_ORDER.indexOf(maxSeverity)) {
                        maxSeverity = severity;
                    }
                }
            }
        }
    }

    // Check metadata for rate limiting hints
    const statusCode = metadata?.statusCode;
    if (statusCode === 429) {
        detected.push("Rate Limited (429)");
        if (SEVERITY_ORDER.indexOf("aggressive") > SEVERITY_ORDER.indexOf(maxSeverity)) {
            maxSeverity = "aggressive";
        }
    } else if (statusCode === 403) {
        detected.push("Access Forbidden (403)");
        if (SEVERITY_ORDER.indexOf("moderate") > SEVERITY_ORDER.indexOf(maxSeverity)) {
            maxSeverity = "moderate";
        }
    }

    // Check for challenge pages
    if (/<title[^>]*>.*?(verify|challenge|blocked|security check)/i.test(html)) {
        detected.push("Challenge Page");
        if (SEVERITY_ORDER.indexOf("aggressive") > SEVERITY_ORDER.indexOf(maxSeverity)) {
            maxSeverity = "aggressive";
        }
    }

    return { detected, severity: maxSeverity };
}

export const antiBotCheck: Check = {
    id: "anti-bot",
    label: "Anti-Bot Detection",
    weight: CHECK_WEIGHTS["anti-bot"] ?? 0,

    run(context: CheckContext): CheckResult {
        const { html, metadata } = context;
        const { detected, severity } = detectAntiBotMeasures(html, metadata);

        // Score is informational - 100 means no protection, lower means more protection
        const severityScores: Record<Severity, number> = {
            none: 100,
            light: 80,
            moderate: 50,
            aggressive: 20,
        };

        const score = severityScores[severity];
        const status = severity === "none" ? "pass" : severity === "light" ? "pass" : "warning";

        const severityLabels: Record<Severity, string> = {
            none: "No anti-bot measures detected",
            light: "Light protection",
            moderate: "Moderate protection",
            aggressive: "Aggressive protection",
        };

        return {
            id: this.id,
            label: this.label,
            status,
            score,
            details: detected.length > 0
                ? `${severityLabels[severity]}: ${detected.join(", ")}`
                : severityLabels[severity],
            recommendation: severity === "aggressive"
                ? "Aggressive anti-bot measures may block AI crawlers"
                : severity === "moderate"
                    ? "Some anti-bot measures present - AI access may be limited"
                    : "Site is accessible to AI crawlers",
        };
    },
};
