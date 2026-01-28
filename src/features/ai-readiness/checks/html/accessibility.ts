import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";

export const accessibilityCheck: Check = {
    id: "accessibility",
    label: "Accessibility",
    weight: CHECK_WEIGHTS["accessibility"],

    run(context: CheckContext): CheckResult {
        const { html } = context;

        const hasAltText = (html.match(/alt="/g) || []).length;
        const imgCount = (html.match(/<img/g) || []).length;
        const altTextRatio = imgCount > 0 ? (hasAltText / imgCount) * 100 : 100;
        const hasAriaLabels = html.includes("aria-label");
        const hasAriaDescribedBy = html.includes("aria-describedby");
        const hasRole = html.includes('role="');
        const hasLangAttribute = html.includes('lang="');

        // Sites with no images shouldn't be penalized
        const imageScore = imgCount === 0 ? 40 : altTextRatio * 0.4;

        const score = Math.min(
            100,
            imageScore +
                (hasAriaLabels ? 20 : 0) +
                (hasAriaDescribedBy ? 10 : 0) +
                (hasRole ? 15 : 0) +
                (hasLangAttribute ? 15 : 0)
        );

        return {
            id: this.id,
            label: this.label,
            status: score >= 80 ? "pass" : score >= 50 ? "warning" : "fail",
            score: Math.round(score),
            details: `${Math.round(altTextRatio)}% images have alt text, ARIA labels: ${hasAriaLabels ? "Yes" : "No"}`,
            recommendation:
                score < 80
                    ? "Add alt text to all images and use ARIA labels for interactive elements"
                    : "Good accessibility implementation",
        };
    },
};
