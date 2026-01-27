import { Check, CheckContext, CheckResult } from "@/types/ai-readiness";
import { CHECK_WEIGHTS } from "@/config/ai-readiness";

export const metadataCheck: Check = {
    id: "meta-tags",
    label: "Metadata Quality",
    weight: CHECK_WEIGHTS["meta-tags"],

    run(context: CheckContext): CheckResult {
        const { html, metadata } = context;

        const hasOgTitle =
            metadata?.ogTitle ||
            metadata?.title ||
            html.includes("og:title") ||
            html.includes("<title");

        const hasOgDescription =
            metadata?.ogDescription ||
            metadata?.description ||
            html.includes("og:description") ||
            html.includes('name="description"');

        // Check description quality
        const descMatch = html.match(/content="([^"]*)"/i);
        const descLength = descMatch?.[1]?.length || 0;
        const hasGoodDescLength = descLength >= 70 && descLength <= 160;

        const hasAuthor =
            html.includes('name="author"') || html.includes('property="article:author"');
        const hasPublishDate =
            html.includes('property="article:published_time"') ||
            html.includes('property="article:modified_time"');

        // Enhanced scoring
        let score = 30; // Base score
        const details: string[] = [];

        if (hasOgTitle) {
            score += 30;
            details.push("Title ✓");
        } else if (html.includes("<title")) {
            score += 20;
            details.push("Basic title");
        }

        if (hasOgDescription) {
            score += 25;
            if (hasGoodDescLength) {
                score += 10;
                details.push("Description ✓");
            } else {
                details.push("Description");
            }
        }

        if (hasAuthor) {
            score += 10;
            details.push("Author ✓");
        }
        if (hasPublishDate) {
            score += 10;
            details.push("Date ✓");
        }

        score = Math.min(100, score);

        return {
            id: this.id,
            label: this.label,
            status: score >= 70 ? "pass" : score >= 40 ? "warning" : "fail",
            score,
            details: details.length > 0 ? details.join(", ") : "Missing critical metadata",
            recommendation:
                score < 70
                    ? "Add title, description (70-160 chars), author, and publish date metadata"
                    : "Metadata provides excellent context for AI",
        };
    },
};
