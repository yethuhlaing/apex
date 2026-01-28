// Weights for each check category
export const CHECK_WEIGHTS: Record<string, number> = {
    // Page-Level Metrics (Most important)
    readability: 1.5,
    "heading-structure": 1.4,
    "meta-tags": 1.2,

    // Domain-Level Checks (Moderate importance)
    "robots-txt": 0.9,
    sitemap: 0.8,
    "llms-txt": 0.3, // Very rare, minimal weight

    // Supporting Metrics
    "semantic-html": 1.0,
    accessibility: 0.9,
};

// Domain reputation lists
export const TOP_TIER_DOMAINS = [
    "vercel.com",
    "stripe.com",
    "github.com",
    "openai.com",
    "anthropic.com",
    "google.com",
    "microsoft.com",
    "apple.com",
    "aws.amazon.com",
    "cloud.google.com",
    "azure.microsoft.com",
    "react.dev",
    "nextjs.org",
    "tailwindcss.com",
];

export const SECOND_TIER_DOMAINS = [
    "netlify.com",
    "heroku.com",
    "digitalocean.com",
    "cloudflare.com",
    "twilio.com",
    "slack.com",
    "notion.so",
    "linear.app",
    "figma.com",
];

// Scoring thresholds
export const SCORE_THRESHOLDS = {
    pass: 80,
    warning: 50,
    contentSignalThreshold: 60,
    minimumViableScore: 35,
    excellentScore: 80,
};

// Bonus points
export const BONUS_POINTS = {
    documentationSite: 20,
    topTierDomain: 18,
    secondTierDomain: 12,
    threeContentSignals: 15,
    twoContentSignals: 10,
};

// Common sitemap locations
export const COMMON_SITEMAP_LOCATIONS = [
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/sitemap-index.xml",
    "/sitemaps/sitemap.xml",
    "/sitemap/sitemap.xml",
];

// LLMs.txt file variations
export const LLMS_TXT_VARIATIONS = ["llms.txt", "LLMs.txt", "llms-full.txt"];

// Semantic HTML tags to check
export const SEMANTIC_TAGS = [
    "<article",
    "<nav",
    "<main",
    "<section",
    "<header",
    "<footer",
    "<aside",
];

// Content signal check IDs
export const CONTENT_SIGNAL_IDS = ["readability", "heading-structure", "meta-tags"];
