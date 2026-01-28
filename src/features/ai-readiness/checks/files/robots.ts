import { FileCheck, FileCheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";
import { fetchWithTimeout } from "../../utils";

export interface RobotsCheckResult extends CheckResult {
    sitemapUrls: string[];
}

export const robotsCheck: FileCheck & {
    run: (context: FileCheckContext) => Promise<RobotsCheckResult>;
} = {
    id: "robots-txt",
    label: "Robots.txt",
    weight: CHECK_WEIGHTS["robots-txt"],

    async run(context: FileCheckContext): Promise<RobotsCheckResult> {
        const { baseUrl } = context;

        const defaultResult: RobotsCheckResult = {
            id: this.id,
            label: this.label,
            status: "fail",
            score: 0,
            details: "No robots.txt file found",
            recommendation: "Create a robots.txt file with AI crawler directives",
            sitemapUrls: [],
        };

        try {
            const response = await fetchWithTimeout(`${baseUrl}/robots.txt`);

            if (!response.ok) {
                return defaultResult;
            }

            const robotsText = await response.text();
            const hasUserAgent = robotsText.toLowerCase().includes("user-agent");

            // Extract sitemap URLs from robots.txt
            const sitemapMatches = robotsText.match(/Sitemap:\s*(.+)/gi);
            const sitemapUrls = sitemapMatches
                ? sitemapMatches.map((match) => match.replace(/Sitemap:\s*/i, "").trim())
                : [];

            const hasSitemap = sitemapUrls.length > 0;
            const score = (hasUserAgent ? 60 : 0) + (hasSitemap ? 40 : 0);

            return {
                id: this.id,
                label: this.label,
                status: score >= 80 ? "pass" : score >= 40 ? "warning" : "fail",
                score,
                details: `Robots.txt found${hasSitemap ? ` with ${sitemapUrls.length} sitemap reference(s)` : ""}`,
                recommendation:
                    score < 80 ? "Add sitemap reference to robots.txt" : "Robots.txt properly configured",
                sitemapUrls,
            };
        } catch {
            return defaultResult;
        }
    },
};
