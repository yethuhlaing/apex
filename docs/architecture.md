# Backbone Workflow & Architecture

How the AI Ready Website works in the background: data flow, APIs, and execution order.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER (Client)                                                            │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────────┐  │
│  │ page.tsx    │───▶│ ControlPanel │    │ State: url, isAnalyzing,        │  │
│  │ (main page) │    │ (results UI) │    │ analysisData, showResults       │  │
│  └──────┬──────┘    └──────▲──────┘    └─────────────────────────────────┘  │
│         │                  │                                                  │
└─────────┼──────────────────┼──────────────────────────────────────────────────┘
          │                  │
          │ POST /api/       │ GET analysisData (from page state)
          │ ai-readiness     │ POST /api/ai-analysis (optional, on button)
          │                  │
┌─────────▼──────────────────┴──────────────────────────────────────────────────┐
│  NEXT.JS SERVER (App Router)                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │ /api/ai-readiness │  │ /api/ai-analysis │  │ /api/check-config │  │ /api/     │ │
│  │ (core analysis)   │  │ (optional AI)     │  │ (key check)       │  │ check-llms│ │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘  └────────────┘ │
│           │                    │                                                │
└───────────┼────────────────────┼────────────────────────────────────────────────┘
            │                    │
            │                    │ fetch to Groq (or OpenAI)
            ▼                    ▼
┌───────────────────┐   ┌───────────────────┐
│ Firecrawl API     │   │ Groq / OpenAI API │
│ (scrape HTML)     │   │ (AI insights)     │
└───────────────────┘   └───────────────────┘
```

---

## Backbone Workflow: From URL to Results

### Phase 1: Page load & setup

| Step | Where | What happens |
|------|--------|---------------|
| 1 | `page.tsx` (useEffect) | `GET /api/check-config` runs once. Response tells if OpenAI/Groq/Firecrawl keys exist. |
| 2 | `page.tsx` | User sees hero + URL input. State: `url`, `isAnalyzing=false`, `showResults=false`, `analysisData=null`. |

No analysis runs yet. Only config is checked.

---

### Phase 2: User submits URL

| Step | Where | What happens |
|------|--------|---------------|
| 1 | `page.tsx` → `handleAnalysis()` | URL is normalized (e.g. `example.com` → `https://example.com`) and validated with `new URL(...)`. |
| 2 | `page.tsx` | `setIsAnalyzing(true)`, `setShowResults(false)`, `setAnalysisData(null)`. UI switches to `ControlPanel` (analyzing state). |
| 3 | `page.tsx` | `POST /api/ai-readiness` with `{ url: processedUrl }`. **All real analysis is done inside this one API call.** |

The browser does not call Firecrawl or run scoring. It only calls your own `/api/ai-readiness` route and waits for the JSON response.

---

### Phase 3: What runs inside `/api/ai-readiness` (server, in order)

This is the **core backbone** of the app. Everything below runs on the Next.js server, in one request, in this order:

```
POST /api/ai-readiness
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 1 — Firecrawl scrape (~5–15 s)                                             │
│ • firecrawl.scrape(url, { formats: ["html"] })                                  │
│ • Returns: html, metadata (title, description, og:*, etc.)                     │
│ • If it fails → 500, no further steps                                          │
└───────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 2 — HTML analysis (sync, fast)                                             │
│ • extractTextContent(html) → used for readability                               │
│ • analyzeHTML(html, metadata, url) produces 5 checks:                          │
│   - heading-structure (H1 count, hierarchy)                                     │
│   - readability (Flesch-Kincaid from extracted text)                           │
│   - meta-tags (title, og, description length, author, date)                     │
│   - semantic-html (article, nav, main, ARIA, framework hints)                    │
│   - accessibility (alt text, ARIA, lang)                                        │
└───────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 3 — Domain-level checks (parallel fetches from target site)                │
│ • checkAdditionalFiles(domain)                                                 │
│   - robots.txt  (fetch origin/robots.txt, 3s timeout)                          │
│   - llms.txt    (fetch origin/llms.txt, etc., 3s timeout)                       │
│   - sitemap     (use robots.txt Sitemap: URLs, else try /sitemap.xml, etc.)   │
│ • All use fetchWithTimeout(3s); failures → default “fail” result, no throw     │
└───────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 4 — Score aggregation                                                     │
│ • allChecks = [llms, robots, sitemap, ...htmlChecks]                           │
│ • weights = { readability: 1.5, heading-structure: 1.4, meta-tags: 1.2, ... }  │
│ • weightedSum / totalWeight → baseScore                                         │
│ • + content bonus (e.g. +15 if 3 content checks ≥60)                            │
│ • + getDomainReputationBonus(domain) (e.g. docs.* / known domains)              │
│ • overallScore = min(100, baseScore + bonus)                                    │
└───────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
   NextResponse.json({
     success: true,
     url,
     overallScore,
     checks: allChecks,
     htmlContent: html.substring(0, 10000),
     metadata: { title, description, analyzedAt }
   })
```

So in one request: **Firecrawl → HTML analysis → domain file checks → weighted score → JSON**. All “background” work for the main analysis is just this single server-side pipeline.

---

### Phase 4: Back in the browser

| Step | Where | What happens |
|------|--------|---------------|
| 1 | `page.tsx` | Response from `POST /api/ai-readiness` is read as JSON. |
| 2 | `page.tsx` | If `data.success`: `setAnalysisData(data)`, `setIsAnalyzing(false)`, `setShowResults(true)`. |
| 3 | `page.tsx` | Same render cycle now passes `analysisData` into `<ControlPanel analysisData={analysisData} ... />`. |
| 4 | `ControlPanel` | Uses `analysisData.overallScore`, `analysisData.checks`, `analysisData.url`, etc. to show scores, metrics, and recommendations. |

So the “backend” of the default flow is: **one API route and one client handler**. No background jobs or queues; the “background” is literally the server doing Steps 1–4 while the client waits on that one HTTP request.

---

### Phase 5: Optional AI analysis (another backbone path)

| Step | Where | What happens |
|------|--------|---------------|
| 1 | User | Clicks “Run AI Analysis” (or similar) in `ControlPanel`. |
| 2 | `ControlPanel` | Calls `POST /api/ai-analysis` with `{ url, htmlContent, currentChecks }`. `htmlContent`/`currentChecks` come from `analysisData` (from the first run). |
| 3 | `/api/ai-analysis` | Calls `generateAIInsights()` → in practice `generateGroqInsights()` (Groq chat completions). Sends prompt + page-level scores; asks for 8 AI-readiness dimensions in JSON. |
| 4 | If Groq fails | Falls back to `generateMockInsights()` (hardcoded example insights) so the UI still gets a valid shape. |
| 5 | `ControlPanel` | Receives `{ success, insights, overallAIReadiness, topPriorities }` and merges/display with the existing checks. |

This is a **second, separate backbone**: same server, but a different API route and a different external dependency (Groq/OpenAI). It does not call Firecrawl again; it reuses `htmlContent` and `currentChecks` from the first run.

---

## Where state lives

| State | Location | Purpose |
|-------|----------|---------|
| `url`, `isAnalyzing`, `showResults`, `analysisData` | `page.tsx` (useState) | Drives “input vs analyzing vs results” and feeds ControlPanel. |
| `hasOpenAIKey` | `page.tsx` (from `/api/check-config`) | Used to show/hide or enable “Run AI Analysis”. |
| Checks, overallScore, AI insights | `ControlPanel` (useState) | Derived from `analysisData` and optional AI response; used for rendering tables/charts. |
| API keys | Server env only (`process.env.*`) | Never sent to client. Only booleans like `hasOpenAIKey` are. |

There is no Redux/global store for analysis; the single source of truth for “last run” is `analysisData` in `page.tsx`.

---

## Execution summary

- **One-shot analysis**: User submit → **one** `POST /api/ai-readiness` → server runs Firecrawl → HTML analysis → domain checks → scoring → JSON → client stores result and shows `ControlPanel`.
- **Optional AI path**: User click → **one** `POST /api/ai-analysis` → server calls Groq (or mock) → client merges insights into the same results view.
- **No background workers**: No cron, no message queues. “Background” = the server doing work inside those API route handlers while the client waits on the same request.

If you want to add true background jobs (e.g. fire-and-forget analysis or retries), that would be a new layer (e.g. a queue or serverless function) and is not part of the current backbone.
