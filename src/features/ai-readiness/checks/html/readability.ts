import { Check, CheckContext, CheckResult } from "../../types";
import { CHECK_WEIGHTS } from "../../config";
import { calculateReadability } from "../../utils";

export const readabilityCheck: Check = {
    id: "readability",
    label: "Content Readability",
    weight: CHECK_WEIGHTS["readability"],

    run(context: CheckContext): CheckResult {
        const { textContent } = context;

        const readabilityScore = calculateReadability(textContent);
        let status: "pass" | "warning" | "fail" = "pass";
        let details = "";
        let normalizedScore = 0;

        if (readabilityScore >= 70) {
            normalizedScore = 100;
            status = "pass";
            details = `Very readable (Flesch: ${Math.round(readabilityScore)})`;
        } else if (readabilityScore >= 50) {
            normalizedScore = 80;
            status = "pass";
            details = `Good readability (Flesch: ${Math.round(readabilityScore)})`;
        } else if (readabilityScore >= 30) {
            normalizedScore = 50;
            status = "warning";
            details = `Difficult to read (Flesch: ${Math.round(readabilityScore)})`;
        } else {
            normalizedScore = 20;
            status = "fail";
            details = `Very difficult (Flesch: ${Math.round(readabilityScore)})`;
        }

        return {
            id: this.id,
            label: this.label,
            status,
            score: normalizedScore,
            details,
            recommendation:
                normalizedScore < 80
                    ? "Simplify sentences and use clearer language for better AI comprehension"
                    : "Content is clearly written and AI-friendly",
        };
    },
};
