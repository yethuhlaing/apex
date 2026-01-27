import { FileCheck, FileCheckContext, CheckResult } from "@/types/ai-readiness";
import { CHECK_WEIGHTS, COMMON_SITEMAP_LOCATIONS } from "@/config/ai-readiness";
import { fetchWithTimeout } from "@/utils/ai-readiness";

export const sitemapCheck: FileCheck & {
    runWithRobotsSitemaps: (
        context: FileCheckContext,
        robotsSitemapUrls: string[]
    ) => Promise<CheckResult>;
} = {
    id: "sitemap",
    label: "Sitemap",
    weight: CHECK_WEIGHTS["sitemap"],

    async run(context: FileCheckContext): Promise<CheckResult> {
        return this.runWithRobotsSitemaps(context, []);
    },

    async runWithRobotsSitemaps(
        context: FileCheckContext,
        robotsSitemapUrls: string[]
    ): Promise<CheckResult> {
        const { baseUrl } = context;

        const defaultResult: CheckResult = {
            id: this.id,
            label: this.label,
            status: "fail",
            score: 0,
            details: "No sitemap.xml found",
            recommendation: "Generate and submit an XML sitemap",
        };

        // Build list of URLs to check: robots.txt sitemaps first, then common locations
        const possibleUrls = [...robotsSitemapUrls];

        for (const path of COMMON_SITEMAP_LOCATIONS) {
            const url = `${baseUrl}${path}`;
            if (!possibleUrls.includes(url)) {
                possibleUrls.push(url);
            }
        }

        // Check each possible URL
        for (const sitemapUrl of possibleUrls) {
            try {
                const response = await fetchWithTimeout(sitemapUrl);

                if (!response.ok) continue;

                const content = await response.text();

                // Verify it's actually an XML sitemap
                const isValidSitemap =
                    (content.includes("<?xml") ||
                        content.includes("<urlset") ||
                        content.includes("<sitemapindex") ||
                        content.includes("<url>") ||
                        content.includes("<sitemap>")) &&
                    !content.includes("<!DOCTYPE html");

                if (isValidSitemap) {
                    const fromRobots = robotsSitemapUrls.includes(sitemapUrl);

                    return {
                        id: this.id,
                        label: this.label,
                        status: "pass",
                        score: 100,
                        details: `Valid XML sitemap found${fromRobots ? " (referenced in robots.txt)" : ` at ${sitemapUrl.replace(baseUrl, "")}`}`,
                        recommendation: "Sitemap is properly configured",
                    };
                }
            } catch {
                // Continue checking other URLs
            }
        }

        return defaultResult;
    },
};
