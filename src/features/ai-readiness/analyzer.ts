import { AnalysisResult, CheckResult, CheckContext, FileCheckContext } from "@/types/ai-readiness";
import {
    CHECK_WEIGHTS,
    CONTENT_SIGNAL_IDS,
    SCORE_THRESHOLDS,
    BONUS_POINTS,
} from "@/config/ai-readiness";
import {
    extractTextContent,
    getDomainReputationBonus,
    getBaseUrl,
    normalizeUrl,
} from "@/utils/ai-readiness";
import { runHtmlChecks, runFileChecks } from "./checks";

export interface AnalyzerInput {
    url: string;
    html: string;
    metadata: Record<string, any>;
}

export async function analyzeWebsite(input: AnalyzerInput): Promise<AnalysisResult> {
    const { url, html, metadata } = input;

    console.log("[AI-READY] Step 2/4: Analyzing HTML content...");
    const htmlStartTime = Date.now();

    // Prepare context for HTML checks
    const textContent = extractTextContent(html);
    const checkContext: CheckContext = {
        html,
        metadata,
        url,
        textContent,
    };

    // Run HTML checks
    const htmlChecks = await runHtmlChecks(checkContext);
    console.log(`[AI-READY] Step 2/4: HTML analysis completed in ${Date.now() - htmlStartTime}ms`);

    console.log("[AI-READY] Step 3/4: Checking robots.txt, sitemap.xml, llms.txt...");
    const filesStartTime = Date.now();

    // Prepare context for file checks
    const baseUrl = getBaseUrl(url);
    const fileContext: FileCheckContext = { baseUrl };

    // Run file checks
    const fileChecks = await runFileChecks(fileContext);
    console.log(`[AI-READY] Step 3/4: File checks completed in ${Date.now() - filesStartTime}ms`);

    console.log("[AI-READY] Step 4/4: Calculating final scores...");
    const scoreStartTime = Date.now();

    // Combine all checks
    const allChecks: CheckResult[] = [
        fileChecks.llms,
        fileChecks.robots,
        fileChecks.sitemap,
        ...htmlChecks,
    ];

    // Calculate overall score
    const overallScore = calculateOverallScore(allChecks, url);

    console.log(`[AI-READY] Step 4/4: Score calculation completed in ${Date.now() - scoreStartTime}ms`);

    const domain = new URL(normalizeUrl(url)).hostname.toLowerCase();
    console.log(`[AI-READY] Final scoring for ${domain}: final=${overallScore}`);

    return {
        success: true,
        url,
        overallScore,
        checks: allChecks,
        htmlContent: html.substring(0, 10000),
        metadata: {
            title: metadata.title,
            description: metadata.description,
            analyzedAt: new Date().toISOString(),
        },
    };
}

function calculateOverallScore(checks: CheckResult[], url: string): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const check of checks) {
        const weight = CHECK_WEIGHTS[check.id] || 1.0;
        weightedSum += check.score * weight;
        totalWeight += weight;
    }

    // Apply domain reputation bonus
    const domain = new URL(normalizeUrl(url)).hostname.toLowerCase();
    const reputationBonus = getDomainReputationBonus(domain);

    let baseScore = Math.round(weightedSum / totalWeight);

    // Boost score for sites with good content signals
    const contentSignals = checks.filter(
        (c) =>
            CONTENT_SIGNAL_IDS.includes(c.id) && c.score >= SCORE_THRESHOLDS.contentSignalThreshold
    ).length;

    if (contentSignals >= 3) {
        baseScore += BONUS_POINTS.threeContentSignals;
    } else if (contentSignals >= 2) {
        baseScore += BONUS_POINTS.twoContentSignals;
    }

    // Ensure minimum viable score
    if (
        baseScore < SCORE_THRESHOLDS.minimumViableScore &&
        checks.some((c) => c.score >= SCORE_THRESHOLDS.excellentScore)
    ) {
        baseScore = SCORE_THRESHOLDS.minimumViableScore;
    }

    return Math.min(100, baseScore + reputationBonus);
}
