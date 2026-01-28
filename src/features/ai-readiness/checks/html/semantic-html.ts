import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS, SEMANTIC_TAGS } from "../../config";

export const semanticHtmlCheck: Check = {
    id: "semantic-html",
    label: "Semantic HTML",
    weight: CHECK_WEIGHTS["semantic-html"],

    run(context: CheckContext): CheckResult {
        const { html } = context;

        const semanticCount = SEMANTIC_TAGS.filter((tag) => html.includes(tag)).length;

        // Modern SPAs might use divs with proper ARIA roles
        const hasAriaRoles = html.includes('role="') || html.includes("aria-");
        const isModernFramework =
            html.includes("__next") ||
            html.includes("_app") ||
            html.includes("react") ||
            html.includes("vue") ||
            html.includes("svelte");

        const score = Math.min(
            100,
            (semanticCount / 5) * 60 + (hasAriaRoles ? 20 : 0) + (isModernFramework ? 20 : 0)
        );

        return {
            id: this.id,
            label: this.label,
            status: score >= 80 ? "pass" : score >= 40 ? "warning" : "fail",
            score,
            details: `Found ${semanticCount} semantic HTML5 elements`,
            recommendation:
                score < 80
                    ? "Use more semantic HTML5 elements (article, nav, main, section, etc.)"
                    : "Excellent use of semantic HTML",
        };
    },
};
