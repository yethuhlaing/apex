import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";

export const headingStructureCheck: Check = {
    id: "heading-structure",
    label: "Heading Hierarchy",
    weight: CHECK_WEIGHTS["heading-structure"],

    run(context: CheckContext): CheckResult {
        const { html } = context;

        const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
        const headings = html.match(/<h([1-6])[^>]*>/gi) || [];
        const headingLevels = headings.map((h) => parseInt(h.match(/<h([1-6])/i)?.[1] || "0"));

        let score = 100;
        const issues: string[] = [];

        // Check for single H1
        if (h1Count === 0) {
            score -= 40;
            issues.push("No H1 found");
        } else if (h1Count > 1) {
            score -= 30;
            issues.push(`Multiple H1s (${h1Count}) create topic ambiguity`);
        }

        // Check heading hierarchy
        for (let i = 1; i < headingLevels.length; i++) {
            if (headingLevels[i] - headingLevels[i - 1] > 1) {
                score -= 15;
                issues.push(`Skipped heading level (H${headingLevels[i - 1]} → H${headingLevels[i]})`);
            }
        }

        score = Math.max(0, score);

        return {
            id: this.id,
            label: this.label,
            status: score >= 80 ? "pass" : score >= 50 ? "warning" : "fail",
            score,
            details:
                issues.length > 0
                    ? issues.join(", ")
                    : `Perfect hierarchy with ${h1Count} H1 and logical structure`,
            recommendation:
                score < 80
                    ? "Use exactly one H1 and maintain logical heading hierarchy (H1→H2→H3)"
                    : "Excellent heading structure for AI comprehension",
        };
    },
};
