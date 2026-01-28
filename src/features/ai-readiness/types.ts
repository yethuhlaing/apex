export interface CheckResult {
    id: string;
    label: string;
    status: "pass" | "fail" | "warning";
    score: number;
    details: string;
    recommendation: string;
}

export interface CheckContext {
    html: string;
    metadata: Record<string, any>;
    url: string;
    textContent: string;
}

export interface Check {
    id: string;
    label: string;
    weight: number;
    run: (context: CheckContext) => Promise<CheckResult> | CheckResult;
}

export interface FileCheckContext {
    baseUrl: string;
}

export interface FileCheck {
    id: string;
    label: string;
    weight: number;
    run: (context: FileCheckContext) => Promise<CheckResult>;
}

export interface AnalysisResult {
    success: boolean;
    url: string;
    overallScore: number;
    checks: CheckResult[];
    htmlContent: string;
    metadata: {
        title?: string;
        description?: string;
        analyzedAt: string;
    };
}
