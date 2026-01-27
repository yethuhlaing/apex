export * from "./html";
export * from "./files";

import { Check, CheckContext, CheckResult, FileCheckContext } from "@/types/ai-readiness";
import { htmlChecks } from "./html";
import { robotsCheck, sitemapCheck, llmsCheck } from "./files";

// Run all HTML checks
export async function runHtmlChecks(context: CheckContext): Promise<CheckResult[]> {
    const results: CheckResult[] = [];

    for (const check of htmlChecks) {
        const result = await check.run(context);
        results.push(result);
    }

    return results;
}

// Run all file checks
export async function runFileChecks(
    context: FileCheckContext
): Promise<{ robots: CheckResult; sitemap: CheckResult; llms: CheckResult }> {
    // Run robots check first to get sitemap URLs
    const robotsResult = await robotsCheck.run(context);

    // Run sitemap check with URLs from robots.txt
    const sitemapResult = await sitemapCheck.runWithRobotsSitemaps(
        context,
        robotsResult.sitemapUrls
    );

    // Run llms check
    const llmsResult = await llmsCheck.run(context);

    return {
        robots: robotsResult,
        sitemap: sitemapResult,
        llms: llmsResult,
    };
}

// Get all checks for weight calculation
export function getAllChecks(): Check[] {
    return htmlChecks;
}
