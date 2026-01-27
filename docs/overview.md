# AI Ready Website

<img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzZyaXVlOXoyaGJmMGV5YzBlbXNod2U5emRrZ2lqZTM1eGI1aHlzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/irNt0XtSKmenMRqMre/giphy.gif" width="100%" alt="AI Ready Website">

A comprehensive web application that analyzes websites for AI readiness and optimization. Get detailed insights on how well your website is structured for AI systems, LLMs, and search engines to understand and process your content.

## 🚀 What Users Can Do

- **Analyze Any Website**: Enter any URL to get instant AI readiness analysis
- **Get Comprehensive Scores**: Receive an overall AI readiness score (0-100) with detailed breakdowns
- **View Detailed Metrics**: See scores for 8+ different AI readiness factors
- **Receive Actionable Recommendations**: Get specific, actionable steps to improve your website's AI compatibility
- **Access AI-Powered Insights**: (Optional) Get advanced AI-generated analysis with industry-specific recommendations
- **Track Multiple Checks**: Analyze heading structure, readability, metadata, semantic HTML, accessibility, and more
- **Export Results**: View and share detailed analysis reports

## ✨ Features

### Core Analysis Features

#### 1. **Page-Level Metrics** (High Priority)

- **Heading Hierarchy Analysis**: Checks for proper H1-H6 structure, single H1 usage, and logical hierarchy
- **Content Readability Score**: Calculates Flesch-Kincaid readability to ensure content is clear and AI-friendly
- **Metadata Quality**: Evaluates title tags, meta descriptions, Open Graph tags, author information, and publish dates

#### 2. **Semantic & Accessibility Checks**

- **Semantic HTML**: Analyzes use of HTML5 semantic elements (article, nav, main, section, etc.)
- **Accessibility Score**: Checks alt text for images, ARIA labels, and accessibility best practices

#### 3. **Domain-Level Checks**

- **Robots.txt Validation**: Verifies robots.txt file exists and is properly configured
- **Sitemap Detection**: Checks for XML sitemaps in common locations and robots.txt references
- **LLMs.txt Support**: Detects LLMs.txt files that define AI usage permissions

#### 4. **Advanced AI Analysis** (Optional)

When OpenAI/Groq API keys are configured, users can access:

- **Content Quality Assessment**: Evaluates how clear, factual, and valuable content is for AI training
- **Information Architecture**: Analyzes how well-organized and categorized information is
- **Semantic Structure**: Checks if HTML properly describes content meaning
- **AI Discovery Value**: Assesses how easily AI systems can understand what the page/site offers
- **Knowledge Extraction**: Evaluates if facts, entities, and relationships can be extracted
- **Context & Completeness**: Checks if there's enough context for AI to understand topics
- **Content Uniqueness**: Identifies original vs duplicated/thin content
- **Machine Interpretability**: Measures how easily AI can parse and understand the content

### User Experience Features

- **Real-time Analysis**: Fast analysis with progress indicators
- **Visual Score Display**: Beautiful charts and visualizations of scores
- **Interactive Results**: Expandable sections for detailed insights
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Next.js, Tailwind CSS, and Framer Motion for smooth animations
- **Error Handling**: Clear error messages and validation for invalid URLs

## 🛠️ Setup

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- API keys (see below)

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/firecrawl/ai-ready-website.git
cd ai-ready-website
```

2. **Install dependencies**:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Create environment variables**:
   Create a `.env.local` file in the root directory:

```bash
# Required: Firecrawl API key for web scraping
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Optional: For advanced AI analysis
OPENAI_API_KEY=your_openai_api_key
# or
GROQ_API_KEY=your_groq_api_key
```

4. **Get API Keys**:
    - **Firecrawl**: Sign up at [firecrawl.dev](https://firecrawl.dev) to get your API key (required)
    - **OpenAI**: Get your key from [platform.openai.com](https://platform.openai.com) (optional, for AI insights)
    - **Groq**: Get your key from [console.groq.com](https://console.groq.com) (optional, alternative to OpenAI)

5. **Run the development server**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage

### Basic Analysis

1. Enter a website URL in the input field (e.g., `example.com` or `https://example.com`)
2. Click the analyze button or press Enter
3. Wait for the analysis to complete (typically 5-15 seconds)
4. Review your AI readiness score and detailed metrics

### Understanding Your Results

- **Overall Score**: A weighted score (0-100) indicating overall AI readiness
- **Individual Metrics**: Each metric shows:
    - Status: Pass (✓), Warning (⚠), or Fail (✗)
    - Score: 0-100 numerical score
    - Details: Specific findings
    - Recommendations: Actionable steps to improve

### Advanced AI Analysis

If you have OpenAI or Groq API keys configured:

1. After basic analysis completes, click "Run AI Analysis"
2. Get industry-specific insights and recommendations
3. View detailed action items tailored to your website type

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-analysis/      # Advanced AI insights endpoint
│   │   │   ├── ai-readiness/      # Core analysis endpoint
│   │   │   ├── check-config/      # API key validation
│   │   │   └── check-llms/        # LLMs.txt checker
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main page component
│   ├── components/
│   │   ├── app/(home)/            # Home page sections
│   │   └── shared/                # Reusable components
│   ├── hooks/                     # Custom React hooks
│   ├── styles/                    # Global styles and CSS
│   └── utils/                     # Utility functions
├── public/                        # Static assets
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🔧 Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI, Shadcn UI
- **Web Scraping**: Firecrawl
- **AI Analysis**: OpenAI / Groq APIs
- **Icons**: Tabler Icons, Lucide React

## 📊 Analysis Metrics Explained

### Weighted Scoring System

The overall score uses weighted calculations:

- **Page-Level Metrics** (Higher weight):
    - Readability: 1.5x
    - Heading Structure: 1.4x
    - Metadata Quality: 1.2x
- **Domain-Level Checks** (Moderate weight):
    - Robots.txt: 0.9x
    - Sitemap: 0.8x
    - LLMs.txt: 0.3x
- **Supporting Metrics**:
    - Semantic HTML: 1.0x
    - Accessibility: 0.9x

### Score Interpretation

- **80-100**: Excellent - Your site is highly AI-ready
- **60-79**: Good - Minor improvements recommended
- **40-59**: Fair - Several areas need attention
- **0-39**: Needs Work - Significant improvements required

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Powered by [Firecrawl](https://firecrawl.dev) for web scraping
- Built with [Next.js](https://nextjs.org)
- UI components from [Shadcn UI](https://ui.shadcn.com)

## 🔗 Links

- [GitHub Repository](https://github.com/firecrawl/ai-ready-website)
- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Report an Issue](https://github.com/firecrawl/ai-ready-website/issues)
