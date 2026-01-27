import { FileCheck, FileCheckContext, CheckResult } from "@/types/ai-readiness";
import { CHECK_WEIGHTS, LLMS_TXT_VARIATIONS } from "@/config/ai-readiness";
import { fetchWithTimeout } from "@/utils/ai-readiness";

export const llmsCheck: FileCheck = {
    id: "llms-txt",
    label: "LLMs.txt",
    weight: CHECK_WEIGHTS["llms-txt"],

    async run(context: FileCheckContext): Promise<CheckResult> {
        const { baseUrl } = context;

        const defaultResult: CheckResult = {
            id: this.id,
            label: this.label,
            status: "fail",
            score: 0,
            details: "No llms.txt file found",
            recommendation: "Add an llms.txt file to define AI usage permissions",
        };

        // Check all variations in parallel
        const results = await Promise.allSettled(
            LLMS_TXT_VARIATIONS.map(async (filename) => {
                const response = await fetchWithTimeout(`${baseUrl}/${filename}`);

                if (!response.ok) {
                    return null;
                }

                const llmsText = await response.text();

                // Verify it's actually an LLMs.txt file, not a 404 page or HTML
                const isValid =
                    llmsText.length > 10 &&
                    !llmsText.includes("<!DOCTYPE") &&
                    !llmsText.includes("<html") &&
                    !llmsText.includes("<HTML") &&
                    !llmsText.toLowerCase().includes("404 not found") &&
                    !llmsText.toLowerCase().includes("page not found") &&
                    !llmsText.toLowerCase().includes("cannot be found");

                if (isValid) {
                    return filename;
                }

                return null;
            })
        );

        // Find the first successful result
        for (const result of results) {
            if (result.status === "fulfilled" && result.value) {
                return {
                    id: this.id,
                    label: this.label,
                    status: "pass",
                    score: 100,
                    details: `${result.value} file found with AI usage guidelines`,
                    recommendation: "Great! You have defined AI usage permissions",
                };
            }
        }

        return defaultResult;
    },
};
