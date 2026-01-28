import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { analyzeWebsite, normalizeUrl } from "@/features/ai-readiness";

const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!,
});

export async function POST(request: NextRequest) {
    try {
        let { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Normalize URL
        url = normalizeUrl(url);

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        console.log("[AI-READY] Step 1/4: Starting Firecrawl scrape...");
        const scrapeStartTime = Date.now();

        // Scrape the website using Firecrawl
        let scrapeResult;
        try {
            scrapeResult = await firecrawl.scrape(url, {
                formats: ["html"],
            });
            console.log(
                `[AI-READY] Step 1/4: Firecrawl scrape completed in ${Date.now() - scrapeStartTime}ms`
            );
        } catch (scrapeError) {
            console.error("Firecrawl scrape error:", scrapeError);
            return NextResponse.json(
                { error: "Failed to scrape website. Please check the URL." },
                { status: 500 }
            );
        }

        // Extract HTML and metadata from response
        const html = scrapeResult?.html || scrapeResult?.data?.html || scrapeResult?.content || "";
        const metadata = scrapeResult?.metadata || scrapeResult?.data?.metadata || {};

        if (!html) {
            console.error("No HTML content found in response");
            return NextResponse.json(
                { error: "Failed to extract content from website" },
                { status: 500 }
            );
        }

        // Run analysis
        const result = await analyzeWebsite({ url, html, metadata });

        console.log(`[AI-READY] Total analysis time: ${Date.now() - scrapeStartTime}ms`);

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI Readiness analysis error:", error);
        return NextResponse.json({ error: "Failed to analyze website" }, { status: 500 });
    }
}
