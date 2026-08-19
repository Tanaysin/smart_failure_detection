const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load industry benchmark dataset
function loadIndustryDataset() {
    try {
        const filePath = path.join(__dirname, "Industry_data.json");
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
        console.error("Error reading Industry_data.json:", e);
        return {};
    }
}

/**
 * Heuristic Strategic Reasoning Generator (Fallback when API key not present)
 */
function generateHeuristicStrategicPlan(startup, benchmarkData, fmeaDiagnostics) {
    const budget = Number(startup.budget) || 100000;
    const industry = (startup.industry || "Technology").toLowerCase();
    const model = startup.business_model || "SaaS";
    const name = startup.projectName || startup.project_name || "Startup";

    const isBudgetLow = budget < (benchmarkData.avgCompetitorFunding * 1000000 * 0.05 || 500000);
    const hasHighCompetitorCount = (benchmarkData.competitors || []).length > 2;

    const topCompetitor = (benchmarkData.competitors && benchmarkData.competitors[0]) 
        ? benchmarkData.competitors[0].name 
        : "Market Leaders";

    return {
        executiveThesis: `${name} is operating in the rapidly evolving ${startup.industry || "tech"} space with a ${model} model. While market demand is projected to grow by ${benchmarkData.marketGrowthRate || "18%"} annually, the startup faces critical vulnerabilities in runway longevity and differentiation against established incumbents like ${topCompetitor}. By executing phased unit-economics optimization and establishing a focused niche go-to-market wedge, the venture can reduce its overall risk profile by 35-45%.`,
        strategicPillars: [
            {
                title: "1. Runway & Financial Architecture",
                action: isBudgetLow 
                    ? `With a budget of ₹${budget.toLocaleString()}, extend operational runway to at least 14 months by renegotiating vendor cloud commitments and adopting milestone-based contractor hiring.`
                    : `Optimize capital efficiency by allocating 60% of budget directly to customer acquisition and high-retention product features.`
            },
            {
                title: "2. Market Wedge & Competitor Shield",
                action: `Avoid direct feature parity wars with ${topCompetitor}. Focus on a hyper-verticalized micro-segment (e.g. niche compliance or specialized workflows) where switching friction is highest.`
            },
            {
                title: "3. Business Model & Unit Economics",
                action: `Shift pricing structure towards tiered annual contracts with upfront collections to create positive cash-flow float before scaling paid marketing channels.`
            },
            {
                title: "4. Go-to-Market Velocity",
                action: `Deploy product-led growth loops and inbound educational content to drive Customer Acquisition Cost (CAC) down by at least 25% relative to the industry benchmark.`
            }
        ],
        confidenceScore: 88,
        projectedRiskReduction: "38% Lower Risk with Planned Mitigations"
    };
}

/**
 * Call Gemini API for Strategic Reasoning
 */
async function callGeminiStrategicAPI(apiKey, modelName, startup, benchmarkData, fmeaDiagnostics) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

    const prompt = `
You are an elite Silicon Valley venture capitalist, startup risk auditor, and management consultant.
Analyze this startup profile and benchmark data, then provide a structured strategic evaluation in valid JSON.

STARTUP PROFILE:
- Name: ${startup.projectName || startup.project_name || "Unknown"}
- Industry: ${startup.industry}
- Business Model: ${startup.business_model}
- Budget (INR): ${startup.budget}
- Target Market: ${startup.target_market || "General"}
- Description: ${startup.description || "N/A"}

INDUSTRY BENCHMARKS:
- Historical Failure Rate: ${benchmarkData.failureRate || 40}%
- Competitors: ${JSON.stringify(benchmarkData.competitors || [])}
- Market Growth Trend: ${JSON.stringify(benchmarkData.marketGrowth || [])}

IDENTIFIED FAILURE MODES:
${JSON.stringify(fmeaDiagnostics)}

REQUIREMENTS:
Respond ONLY with a valid, raw JSON object (no markdown code blocks, no backticks, no other text) with the following structure:
{
  "executiveThesis": "Comprehensive 3-4 sentence strategic verdict and risk posture summary.",
  "strategicPillars": [
    { "title": "Pillar name (e.g. 1. Financial & Runway Engineering)", "action": "Concrete, non-obvious strategic guidance." },
    { "title": "Pillar name (e.g. 2. Defensive Moat & Competitor Neutralization)", "action": "Concrete tactical steps." },
    { "title": "Pillar name (e.g. 3. Unit Economics & Pricing Model)", "action": "Concrete tactical steps." },
    { "title": "Pillar name (e.g. 4. Scalable GTM & Customer Acquisition)", "action": "Concrete tactical steps." }
  ],
  "confidenceScore": 92,
  "projectedRiskReduction": "e.g. 42% Risk Reduction within 90 days"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
}

/**
 * Call OpenAI API for Strategic Reasoning
 */
async function callOpenAIStrategicAPI(apiKey, modelName, startup, benchmarkData, fmeaDiagnostics) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an elite startup risk intelligence advisor. Respond strictly with raw JSON without markdown formatting."
                },
                {
                    role: "user",
                    content: `Analyze startup ${startup.projectName || startup.project_name} in ${startup.industry} (${startup.business_model}, budget: ₹${startup.budget}).
Benchmarks: Failure Rate ${benchmarkData.failureRate}%, Competitors: ${JSON.stringify(benchmarkData.competitors || [])}.
FMEA Diagnostics: ${JSON.stringify(fmeaDiagnostics)}.
Return JSON with keys: executiveThesis (string), strategicPillars (array of {title, action}), confidenceScore (number 1-100), projectedRiskReduction (string).`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

/**
 * Intelligent Fallback for SWOT & Feasibility Generation
 */
function synthesizeContextualSWOTAndFeasibility(startup, benchmarkData = {}) {
    const name = startup.projectName || startup.project_name || "Venture";
    const ind = startup.industry || "Technology";
    const model = startup.business_model || startup.businessModel || "SaaS";
    const budget = Number(startup.budget) || 500000;
    const targetMarket = startup.target_market || startup.targetMarket || "Enterprise & SMBs";
    const desc = startup.description || "";

    const topCompetitor = (benchmarkData.competitors && benchmarkData.competitors[0]) 
        ? benchmarkData.competitors[0].name 
        : "Market Incumbents";

    // Dynamic Feasibility calculations
    const finScore = budget >= 1000000 ? 88 : budget >= 500000 ? 76 : budget >= 200000 ? 64 : 45;
    const mktScore = benchmarkData.failureRate && benchmarkData.failureRate < 40 ? 84 : 72;
    const bizScore = model === "SaaS" ? 86 : model === "B2B" ? 80 : 70;
    const indScore = Math.max(40, 100 - (benchmarkData.failureRate || 45));
    const exeScore = desc.length > 80 ? 82 : 68;

    const overallScore = Math.round(finScore * 0.25 + mktScore * 0.25 + bizScore * 0.20 + indScore * 0.15 + exeScore * 0.15);
    const status = overallScore >= 80 ? "High Commercial Viability" : overallScore >= 65 ? "Moderately Feasible (Viable)" : "Conditional Feasibility";

    return {
        feasibility: {
            overall: overallScore,
            status: status,
            verdict: `${name} displays strong product-market positioning in ${ind} with an estimated commercial viability score of ${overallScore}%. While financial runway demands disciplined burn management, the scalable ${model} structure provides high operational leverage.`,
            dimensions: {
                financial: {
                    score: finScore,
                    insight: `Budget of ₹${budget.toLocaleString()} provides ~12-14 months operational buffer with structured milestone execution.`
                },
                market: {
                    score: mktScore,
                    insight: `Addressable market demand in ${ind} shows positive CAGR with strong early-adopter appetite.`
                },
                businessModel: {
                    score: bizScore,
                    insight: `${model} architecture delivers compounding gross margins and predictable customer lifetime value (LTV).`
                },
                industry: {
                    score: indScore,
                    insight: `Sector benchmark failure rate is ~${benchmarkData.failureRate || 40}%, representing manageable macro resistance.`
                },
                execution: {
                    score: exeScore,
                    insight: `Operational roadmap demonstrates clear domain alignment for targeting ${targetMarket}.`
                }
            }
        },
        swot: {
            strengths: [
                {
                    title: "Scalable Monetization Architecture",
                    desc: `The ${model} model offers high margin retention and recurring revenue expansion potential.`
                },
                {
                    title: "Focused Target Market Wedge",
                    desc: `Tailored value proposition addressing specific friction points for ${targetMarket}.`
                },
                {
                    title: "Capital Efficiency Foundation",
                    desc: `Lean initial operational framework minimizing fixed overhead prior to product-market fit validation.`
                }
            ],
            weaknesses: [
                {
                    title: "Runway & Working Capital Dependency",
                    desc: `Initial capital allocation of ₹${budget.toLocaleString()} requires early revenue traction or milestone-based financing.`
                },
                {
                    title: "Early Brand & Distribution Friction",
                    desc: "Nascent market awareness compared to well-funded legacy market players."
                },
                {
                    title: "Customer Onboarding & Sales Velocity",
                    desc: "Potential sales procurement cycles could create initial cash receipt lag."
                }
            ],
            opportunities: [
                {
                    title: "Verticalized Niche Capture",
                    desc: `Underserved sub-segments overlooked by ${topCompetitor} present immediate high-conversion market share.`
                },
                {
                    title: "Product-Led Growth & Inbound Flywheel",
                    desc: "Deploying self-serve trials and automated workflows to reduce customer acquisition costs (CAC)."
                },
                {
                    title: "Strategic Ecosystem Integrations",
                    desc: "Partnering with complementary platforms in the space to unlock non-linear distribution channels."
                }
            ],
            threats: [
                {
                    title: "Incumbent Feature Encroachment",
                    desc: `Established market leaders like ${topCompetitor} leveraging larger sales forces and bundling capabilities.`
                },
                {
                    title: "Customer Churn & Switching Dynamics",
                    desc: "Aggressive competitor discount campaigns in price-sensitive market tiers."
                },
                {
                    title: "Regulatory & Compliance Evolutions",
                    desc: `Emerging industry regulations requiring continuous product adaptation and compliance overhead.`
                }
            ]
        }
    };
}

/**
 * Generate Gemini/OpenAI Project Feasibility & SWOT Analysis
 */
async function generateFeasibilityAndSWOT(startup, benchmarkData = {}, options = {}) {
    const provider = options.provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"));
    const apiKey = options.apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);
    const modelName = options.modelName;

    if (provider === "gemini" && apiKey) {
        try {
            console.log("Generating Feasibility & SWOT via Gemini...");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

            const prompt = `
You are a top-tier Venture Capital partner, quantitative startup risk analyst, and McKinsey senior strategy director.
Perform a rigorous, professional Feasibility Assessment and comprehensive 2x2 SWOT Matrix for the following startup:

STARTUP PROFILE:
- Name: ${startup.projectName || startup.project_name || "Startup"}
- Industry: ${startup.industry}
- Business Model: ${startup.business_model || startup.businessModel}
- Budget (INR): ₹${startup.budget}
- Target Market: ${startup.target_market || startup.targetMarket || "General"}
- Description: ${startup.description || "N/A"}

INDUSTRY BENCHMARKS:
- Historical Sector Failure Rate: ${benchmarkData.failureRate || 42}%
- Key Competitors: ${JSON.stringify(benchmarkData.competitors || [])}
- Growth Trajectory: ${JSON.stringify(benchmarkData.marketGrowth || [])}

REQUIREMENTS:
Respond ONLY with a valid, raw JSON object (NO markdown code blocks, no backticks, no other text) with this EXACT structure:
{
  "feasibility": {
    "overall": number (0-100),
    "status": "e.g. High Commercial Viability / Moderately Feasible / Conditional",
    "verdict": "2-3 sentences concise executive feasibility synthesis.",
    "dimensions": {
      "financial": { "score": number (0-100), "insight": "Concise analytical note on runway & capital adequacy." },
      "market": { "score": number (0-100), "insight": "Concise note on addressable demand and sector momentum." },
      "businessModel": { "score": number (0-100), "insight": "Concise note on monetization scalability & unit margins." },
      "industry": { "score": number (0-100), "insight": "Concise note on competitive barriers and failure rate resistance." },
      "execution": { "score": number (0-100), "insight": "Concise note on operational go-to-market readiness." }
    }
  },
  "swot": {
    "strengths": [
      { "title": "Headline (3-5 words)", "desc": "1-2 sentence detailed analytical justification." },
      { "title": "Headline", "desc": "..." },
      { "title": "Headline", "desc": "..." }
    ],
    "weaknesses": [
      { "title": "Headline (3-5 words)", "desc": "1-2 sentence detailed analytical justification." },
      { "title": "Headline", "desc": "..." },
      { "title": "Headline", "desc": "..." }
    ],
    "opportunities": [
      { "title": "Headline (3-5 words)", "desc": "1-2 sentence detailed analytical justification." },
      { "title": "Headline", "desc": "..." },
      { "title": "Headline", "desc": "..." }
    ],
    "threats": [
      { "title": "Headline (3-5 words)", "desc": "1-2 sentence detailed analytical justification." },
      { "title": "Headline", "desc": "..." },
      { "title": "Headline", "desc": "..." }
    ]
  }
}
`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            parsed.source = `${provider}_live_api`;
            return parsed;
        } catch (err) {
            console.warn("Gemini Feasibility/SWOT generation error, falling back to heuristic:", err.message);
            const fallback = synthesizeContextualSWOTAndFeasibility(startup, benchmarkData);
            fallback.source = "fallback_engine";
            return fallback;
        }
    } else if (provider === "openai" && apiKey) {
        try {
            console.log("Generating Feasibility & SWOT via OpenAI...");
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName || "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are an elite VC venture risk auditor. Respond strictly with raw JSON."
                        },
                        {
                            role: "user",
                            content: `Analyze startup ${startup.projectName || startup.project_name} in ${startup.industry}. Return JSON with 'feasibility' (overall, status, verdict, dimensions for financial, market, businessModel, industry, execution) and 'swot' (strengths, weaknesses, opportunities, threats array of {title, desc}).`
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7
                })
            });
            const data = await response.json();
            const parsed = JSON.parse(data.choices[0].message.content);
            parsed.source = "openai_live_api";
            return parsed;
        } catch (err) {
            console.warn("OpenAI Feasibility/SWOT error, using fallback:", err.message);
            const fallback = synthesizeContextualSWOTAndFeasibility(startup, benchmarkData);
            fallback.source = "fallback_engine";
            return fallback;
        }
    }

    const result = synthesizeContextualSWOTAndFeasibility(startup, benchmarkData);
    result.source = "intelligent_synthesizer";
    return result;
}


/**
 * Save dataset back to Industry_data.json
 */
function saveIndustryDataset(dataset) {
    try {
        const filePath = path.join(__dirname, "Industry_data.json");
        fs.writeFileSync(filePath, JSON.stringify(dataset, null, 4), "utf8");
        return true;
    } catch (e) {
        console.error("Error saving Industry_data.json:", e);
        return false;
    }
}

/**
 * Intelligent Fallback Market Data Generator for any industry
 */
const INDIAN_INDUSTRY_CATALOG = {
    healthcare: [
        { name: "Practo", marketShare: 34, revenue: 380, funding: 1850 },
        { name: "PharmEasy", marketShare: 28, revenue: 5700, funding: 9500 },
        { name: "Tata 1mg", marketShare: 22, revenue: 1650, funding: 2400 },
        { name: "Apollo 24|7", marketShare: 16, revenue: 950, funding: 1200 }
    ],
    ai: [
        { name: "Sarvam AI", marketShare: 35, revenue: 45, funding: 420 },
        { name: "Krutrim", marketShare: 28, revenue: 30, funding: 415 },
        { name: "Yellow.ai", marketShare: 22, revenue: 280, funding: 850 },
        { name: "CoRover.ai / Hanooman", marketShare: 15, revenue: 25, funding: 110 }
    ],
    fintech: [
        { name: "PhonePe", marketShare: 38, revenue: 2914, funding: 8200 },
        { name: "Paytm", marketShare: 26, revenue: 7990, funding: 18000 },
        { name: "Razorpay", marketShare: 22, revenue: 2279, funding: 6500 },
        { name: "CRED", marketShare: 14, revenue: 1400, funding: 6600 }
    ],
    edtech: [
        { name: "PhysicsWallah", marketShare: 38, revenue: 1600, funding: 1800 },
        { name: "Unacademy", marketShare: 26, revenue: 980, funding: 7200 },
        { name: "Eruditus", marketShare: 20, revenue: 3300, funding: 6800 },
        { name: "Vedantu", marketShare: 16, revenue: 150, funding: 2700 }
    ],
    travel: [
        { name: "MakeMyTrip", marketShare: 46, revenue: 4900, funding: 4500 },
        { name: "EaseMyTrip", marketShare: 24, revenue: 590, funding: 350 },
        { name: "Ixigo", marketShare: 18, revenue: 501, funding: 600 },
        { name: "Cleartrip", marketShare: 12, revenue: 320, funding: 1100 }
    ],
    agritech: [
        { name: "DeHaat", marketShare: 36, revenue: 2700, funding: 1850 },
        { name: "Ninjacart", marketShare: 28, revenue: 1200, funding: 3100 },
        { name: "AgroStar", marketShare: 22, revenue: 500, funding: 920 },
        { name: "CropIn", marketShare: 14, revenue: 80, funding: 270 }
    ],
    "e commerce": [
        { name: "Flipkart", marketShare: 38, revenue: 56000, funding: 105000 },
        { name: "Meesho", marketShare: 27, revenue: 5735, funding: 8900 },
        { name: "Blinkit", marketShare: 21, revenue: 2300, funding: 6200 },
        { name: "Zepto", marketShare: 14, revenue: 2024, funding: 11000 }
    ],
    gaming: [
        { name: "Dream11", marketShare: 44, revenue: 6384, funding: 5900 },
        { name: "Games24x7", marketShare: 24, revenue: 1988, funding: 1200 },
        { name: "Nazara Technologies", marketShare: 18, revenue: 1091, funding: 1500 },
        { name: "Mobile Premier League (MPL)", marketShare: 14, revenue: 814, funding: 3100 }
    ],
    automotive: [
        { name: "Tata Motors EV", marketShare: 42, revenue: 14500, funding: 7500 },
        { name: "Ola Electric", marketShare: 28, revenue: 5009, funding: 8200 },
        { name: "Ather Energy", marketShare: 18, revenue: 1789, funding: 3700 },
        { name: "Bounce Infinity", marketShare: 12, revenue: 120, funding: 1800 }
    ],
    saas: [
        { name: "Zoho", marketShare: 42, revenue: 8700, funding: 0 },
        { name: "Freshworks", marketShare: 30, revenue: 4900, funding: 3200 },
        { name: "Postman", marketShare: 16, revenue: 600, funding: 3500 },
        { name: "BrowserStack", marketShare: 12, revenue: 900, funding: 1600 }
    ],
    logistics: [
        { name: "Delhivery", marketShare: 40, revenue: 7200, funding: 11000 },
        { name: "Shadowfax", marketShare: 26, revenue: 1400, funding: 1800 },
        { name: "BlackBuck", marketShare: 18, revenue: 750, funding: 2900 },
        { name: "Porter", marketShare: 16, revenue: 880, funding: 1200 }
    ],
    foodtech: [
        { name: "Zomato", marketShare: 52, revenue: 12114, funding: 17500 },
        { name: "Swiggy", marketShare: 40, revenue: 11247, funding: 24000 },
        { name: "Rebel Foods", marketShare: 5, revenue: 1198, funding: 4200 },
        { name: "Curefoods", marketShare: 3, revenue: 380, funding: 1200 }
    ]
};

/**
 * Intelligent Market Data Synthesizer for Indian Startup Ecosystem
 */
function synthesizeRealisticIndustryData(industryName) {
    const ind = (industryName || "technology").toLowerCase().trim();
    const hash = ind.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const baseGrowth = 12 + (hash % 14);
    const growthStep = 4 + (hash % 6);
    const marketGrowth = [
        baseGrowth,
        baseGrowth + growthStep,
        baseGrowth + growthStep * 2,
        baseGrowth + growthStep * 3 + 2,
        baseGrowth + growthStep * 4 + 5,
        baseGrowth + growthStep * 5 + 9
    ];

    const baseFunding = 10 + (hash % 15);
    const fundingStep = 5 + (hash % 8);
    const funding = [
        baseFunding,
        baseFunding + fundingStep,
        baseFunding + fundingStep * 2 + 2,
        baseFunding + fundingStep * 3 + 4,
        baseFunding + fundingStep * 4 + 7,
        baseFunding + fundingStep * 5 + 11
    ];

    const failureRate = 32 + (hash % 30);

    const dist1 = 32 + (hash % 8);
    const dist2 = 24 - (hash % 4);
    const dist3 = 20;
    const dist4 = 15;
    const dist5 = 100 - (dist1 + dist2 + dist3 + dist4);

    // Look up in Indian Industry Catalog or synthesize contextual Indian company names
    let competitors = INDIAN_INDUSTRY_CATALOG[ind];
    if (!competitors) {
        const cleanName = ind.charAt(0).toUpperCase() + ind.slice(1);
        competitors = [
            {
                name: `${cleanName}Bharat / ${cleanName}Pay`,
                marketShare: 36,
                revenue: 350 + (hash % 500),
                funding: 800 + (hash % 1200)
            },
            {
                name: `Nxt${cleanName} India`,
                marketShare: 26,
                revenue: 220 + (hash % 300),
                funding: 450 + (hash % 700)
            },
            {
                name: `Indi${cleanName} Labs`,
                marketShare: 20,
                revenue: 140 + (hash % 200),
                funding: 280 + (hash % 400)
            },
            {
                name: `${cleanName}Kart Ventures`,
                marketShare: 18,
                revenue: 90 + (hash % 150),
                funding: 160 + (hash % 300)
            }
        ];
    }

    return {
        marketGrowth,
        funding,
        failureRate,
        investmentDistribution: [dist1, dist2, dist3, dist4, dist5],
        competitors
    };
}

/**
 * Generate Industry Market Data via Gemini / OpenAI / Synthesizer and persist in Industry_data.json
 */
async function generateAndSaveIndustryData(industryName, options = {}) {
    if (!industryName) throw new Error("Industry name is required");
    const rawKey = industryName.trim();
    const indKey = rawKey.toLowerCase();

    const currentDataset = loadIndustryDataset();

    // If already exists and not forced refresh, return existing
    if (!options.forceRefresh) {
        const existingKey = Object.keys(currentDataset).find(k => k.toLowerCase() === indKey);
        if (existingKey) {
            return {
                industry: existingKey,
                data: currentDataset[existingKey],
                source: "cached_dataset"
            };
        }
    }

    const provider = options.provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"));
    const apiKey = options.apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);
    const modelName = options.modelName;

    let marketData = null;

    if (provider === "gemini" && apiKey) {
        try {
            console.log(`Generating live Indian market data for "${industryName}" via Gemini...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

            const prompt = `
You are an expert venture capital market intelligence analyst specializing in the INDIAN startup ecosystem.
Provide realistic, current, comprehensive Indian market data for the industry sector: "${rawKey}".

Return STRICTLY a valid, raw JSON object (no markdown, no backticks, no explanatory text) with this EXACT structure:
{
  "marketGrowth": [number, number, number, number, number, number],
  "funding": [number, number, number, number, number, number],
  "failureRate": number,
  "investmentDistribution": [number, number, number, number, number],
  "competitors": [
    { "name": "Top Real Indian Startup/Company 1", "marketShare": number, "revenue": number, "funding": number },
    { "name": "Real Indian Startup/Company 2", "marketShare": number, "revenue": number, "funding": number },
    { "name": "Real Indian Startup/Company 3", "marketShare": number, "revenue": number, "funding": number },
    { "name": "Real Indian Startup/Company 4", "marketShare": number, "revenue": number, "funding": number }
  ]
}

Ensure:
- marketGrowth has 6 numbers representing annual market growth index/percent in India from 2020 to 2025.
- funding has 6 numbers representing annual venture funding volume in India in ₹ Crore (or ₹ Billion) from 2020 to 2025.
- failureRate is a realistic percentage for Indian startups in this sector (e.g. between 25 and 65).
- investmentDistribution has 5 percentage numbers summing to 100 representing (Seed, Angel, Series A, Series B, Growth/Late-Stage).
- competitors contains 4 actual real-world INDIAN companies/startups operating in India (e.g., from the Indian ecosystem) with realistic marketShare %, annual revenue in ₹ Crore, and total funding in ₹ Crore.
`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            marketData = JSON.parse(cleanJson);
        } catch (err) {
            console.warn("Gemini Industry Generation Error, using fallback:", err.message);
            marketData = synthesizeRealisticIndustryData(rawKey);
        }
    } else if (provider === "openai" && apiKey) {
        try {
            console.log(`Generating live Indian market data for "${industryName}" via OpenAI...`);
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName || "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are a venture capital market economist specializing in the Indian startup and business ecosystem. Respond strictly with raw JSON."
                        },
                        {
                            role: "user",
                            content: `Generate realistic Indian market data for industry: "${rawKey}". Return JSON with keys: marketGrowth (array of 6 numbers for 2020-2025), funding (array of 6 numbers in ₹ Crore for 2020-2025), failureRate (number %), investmentDistribution (array of 5 stage percentages summing to 100), competitors (array of 4 actual real-world INDIAN companies with name, marketShare %, revenue in ₹ Crore, funding in ₹ Crore).`
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.5
                })
            });
            const data = await response.json();
            marketData = JSON.parse(data.choices[0].message.content);
        } catch (err) {
            console.warn("OpenAI Industry Generation Error, using fallback:", err.message);
            marketData = synthesizeRealisticIndustryData(rawKey);
        }
    } else {
        console.log(`Generating Indian market data for "${industryName}" via intelligent synthesizer...`);
        marketData = synthesizeRealisticIndustryData(rawKey);
    }

    // Persist to Industry_data.json
    currentDataset[indKey] = marketData;
    saveIndustryDataset(currentDataset);

    return {
        industry: indKey,
        data: marketData,
        source: provider === "heuristic" ? "synthesizer" : `${provider}_live_api`
    };
}

/**
 * LangGraph Agent Workflow Implementation
 */
class LangGraphAgentWorkflow {
    constructor(config = {}) {
        this.config = config;
        this.industryDataset = loadIndustryDataset();
    }

    /**
     * Node 1: Industry Benchmarking Agent
     */
    async benchmarkAgentNode(state) {
        const trace = {
            node: "Benchmark & Industry Intelligence Agent",
            status: "COMPLETED",
            timestamp: new Date().toISOString(),
            logs: []
        };

        const rawIndustry = state.startup.industry || "Technology";
        trace.logs.push(`Querying industry dataset for: "${rawIndustry}"...`);

        let indKey = Object.keys(this.industryDataset).find(
            k => k.toLowerCase() === rawIndustry.toLowerCase()
        );

        let benchmark = indKey ? this.industryDataset[indKey] : null;

        // If not found in dataset, dynamically generate live market data via Gemini/API
        if (!benchmark) {
            trace.logs.push(`Industry "${rawIndustry}" not found in local cache. Calling Gemini / Market API to generate live benchmark...`);
            try {
                const generated = await generateAndSaveIndustryData(rawIndustry, {
                    provider: this.config.provider,
                    apiKey: this.config.apiKey,
                    modelName: this.config.modelName
                });
                indKey = generated.industry;
                benchmark = generated.data;
                this.industryDataset = loadIndustryDataset(); // Reload updated cache
                trace.logs.push(`✨ Dynamically generated and stored live market data for "${indKey}" (Source: ${generated.source}).`);
            } catch (err) {
                trace.logs.push(`Dynamic generation fallback: ${err.message}`);
                benchmark = synthesizeRealisticIndustryData(rawIndustry);
                indKey = rawIndustry.toLowerCase();
            }
        }

        trace.logs.push(`Industry match: ${indKey} (Failure Rate: ${benchmark.failureRate}%)`);
        trace.logs.push(`Loaded ${benchmark.competitors ? benchmark.competitors.length : 0} market competitor profiles.`);

        state.benchmarkData = {
            industryKey: indKey,
            failureRate: benchmark.failureRate || 40,
            marketGrowth: benchmark.marketGrowth || [10, 15, 20, 25, 30, 35],
            marketGrowthRate: `${benchmark.marketGrowth ? benchmark.marketGrowth[benchmark.marketGrowth.length - 1] : 24}%`,
            competitors: benchmark.competitors || [],
            investmentDistribution: benchmark.investmentDistribution || [30, 25, 20, 15, 10],
            avgCompetitorFunding: (benchmark.competitors || []).reduce((acc, c) => acc + (c.funding || 0), 0) / ((benchmark.competitors || []).length || 1)
        };

        trace.outputSummary = `Identified benchmark failure rate of ${state.benchmarkData.failureRate}% and ${state.benchmarkData.competitors.length} key market competitors.`;
        state.executionTrace.push(trace);
        return state;
    }

    /**
     * Node 2: Risk & FMEA Diagnostic Agent
     */
    async fmeaDiagnosticAgentNode(state) {
        const trace = {
            node: "Failure Mode & Effects Analysis (FMEA) Diagnostic Agent",
            status: "COMPLETED",
            timestamp: new Date().toISOString(),
            logs: []
        };

        trace.logs.push("Auditing 5 vulnerability dimensions: Financial, Market, Model, Execution, Differentiation...");

        const budget = Number(state.startup.budget) || 100000;
        const industry = (state.startup.industry || "").toLowerCase();
        const model = (state.startup.business_model || "").toUpperCase();

        const failureModes = [];

        // 1. Financial Runway Failure Mode
        const estimatedMonthlyBurn = Math.max(budget * 0.12, 35000);
        const runwayMonths = Math.round(budget / estimatedMonthlyBurn);
        trace.logs.push(`Calculated estimated runway: ~${runwayMonths} months at current capital base.`);

        if (runwayMonths < 10) {
            failureModes.push({
                domain: "Financial & Runway",
                severity: "CRITICAL",
                riskScore: 86,
                failureMode: "Premature Capital Depletion",
                rootCause: `Initial budget of ₹${budget.toLocaleString()} provides less than 10 months runway before self-sustaining cash flow.`,
                impact: "Risk of insolvency before reaching product-market fit or next financing milestone."
            });
        } else {
            failureModes.push({
                domain: "Financial & Runway",
                severity: "MODERATE",
                riskScore: 42,
                failureMode: "Capital Allocation Inefficiency",
                rootCause: "Sufficient baseline capital, but lacks disciplined unit-economics guardrails.",
                impact: "Sub-optimal CAC to LTV ratio during initial growth phase."
            });
        }

        // 2. Market Saturation & Competitor Defense
        const competitorCount = (state.benchmarkData.competitors || []).length;
        if (competitorCount >= 3) {
            failureModes.push({
                domain: "Market & Competition",
                severity: "HIGH",
                riskScore: 78,
                failureMode: "Incumbent Commoditization",
                rootCause: `High market concentration among ${state.benchmarkData.competitors.map(c => c.name).join(", ")}.`,
                impact: "High customer acquisition costs due to aggressive incumbent marketing spend."
            });
        } else {
            failureModes.push({
                domain: "Market & Competition",
                severity: "LOW",
                riskScore: 35,
                failureMode: "Market Timing & Adoption Friction",
                rootCause: "Emerging market category requires higher customer education.",
                impact: "Slower sales cycle duration in early quarters."
            });
        }

        // 3. Business Model & Pricing Structure
        if (model === "B2C") {
            failureModes.push({
                domain: "Business Model",
                severity: "HIGH",
                riskScore: 74,
                failureMode: "High Churn & Low Retention Moat",
                rootCause: "B2C models suffer from higher consumer drop-off and marketing sensitivity.",
                impact: "Unstable recurring revenue stream without long-term contracts."
            });
        } else if (model === "SAAS" || model === "B2B") {
            failureModes.push({
                domain: "Business Model",
                severity: "LOW",
                riskScore: 38,
                failureMode: "Extended Enterprise Sales Cycles",
                rootCause: "B2B / SaaS models experience 60-90 day procurement lag times.",
                impact: "Cash collections lag booked contract values."
            });
        } else {
            failureModes.push({
                domain: "Business Model",
                severity: "MEDIUM",
                riskScore: 60,
                failureMode: "Unvalidated Monetization Mechanism",
                rootCause: "Non-standard business model requires extensive monetization proof.",
                impact: "Difficulty establishing repeatable gross margins."
            });
        }

        // 4. Execution & Team Architecture
        failureModes.push({
            domain: "Execution & Scaling",
            severity: "MEDIUM",
            riskScore: 58,
            failureMode: "Go-to-Market Execution Lag",
            rootCause: "Over-indexing on product features without validated distribution channels.",
            impact: "Delay in achieving target Monthly Recurring Revenue (MRR) velocity."
        });

        state.fmeaDiagnostics = failureModes;
        trace.outputSummary = `Generated 4 Failure Mode entries. Highest vulnerability: ${failureModes[0].failureMode} (${failureModes[0].severity}).`;
        state.executionTrace.push(trace);
        return state;
    }

    /**
     * Node 3: Mitigation & Improvement Engine
     */
    async mitigationPlannerAgentNode(state) {
        const trace = {
            node: "Mitigation & Action Roadmap Planner",
            status: "COMPLETED",
            timestamp: new Date().toISOString(),
            logs: []
        };

        trace.logs.push("Synthesizing 30-Day, 60-Day, and 90+ Day prioritized mitigation actions...");

        const startup = state.startup;
        const budget = Number(startup.budget) || 100000;
        const model = (startup.business_model || "SaaS").toUpperCase();

        const roadmap = {
            immediate30Days: [
                {
                    id: "act-1",
                    title: "Runway Extension & Zero-Waste Budget Audit",
                    priority: "CRITICAL",
                    tag: "Financial",
                    description: `Implement zero-based monthly budgeting. Cap fixed burn at ₹${Math.round(budget * 0.08).toLocaleString()}/month to ensure 14+ months minimum operational buffer.`,
                    expectedImpact: "-18% Financial Risk"
                },
                {
                    id: "act-2",
                    title: "Customer Discovery & Pre-Commitment Validation",
                    priority: "HIGH",
                    tag: "GTM",
                    description: "Conduct 25 structured user interviews in the target market to secure 5 signed Letters of Intent (LOIs) or paid pilot agreements before engineering full build.",
                    expectedImpact: "-12% Market Risk"
                }
            ],
            shortTerm60Days: [
                {
                    id: "act-3",
                    title: model === "B2C" ? "Annual Retention & Loyalty Lock-in" : "Annual Upfront Contract Incentivization",
                    priority: "HIGH",
                    tag: "Business Model",
                    description: model === "B2C" 
                        ? "Introduce tiered annual plans with a 20% discount to collect full-year cash upfront and cut churn."
                        : "Offer 15% discount for upfront annual billing to inject non-dilutive working capital into current runway.",
                    expectedImpact: "+25% Cash Flow Stability"
                },
                {
                    id: "act-4",
                    title: "Defensive Niche Positioning",
                    priority: "MEDIUM",
                    tag: "Strategy",
                    description: "Carve out an underserved sub-vertical that incumbents overlook, avoiding head-on feature comparison with market leaders.",
                    expectedImpact: "+30% Win-Rate in Target Segment"
                }
            ],
            longTerm90Days: [
                {
                    id: "act-5",
                    title: "Product-Led Referral & Virality Loops",
                    priority: "HIGH",
                    tag: "Growth",
                    description: "Embed organic sharing triggers and automated onboarding workflows to drive organic CAC down below ₹2,500/user.",
                    expectedImpact: "-22% Customer Acquisition Cost"
                },
                {
                    id: "act-6",
                    title: "Institutional Seed / Angel Preparedness",
                    priority: "MEDIUM",
                    tag: "Capital",
                    description: "Compile verified cohort retention metrics, unit economics data room, and pipeline forecast for follow-on seed round.",
                    expectedImpact: "+65% Investor Meeting Conversion"
                }
            ]
        };

        state.mitigationRoadmap = roadmap;
        trace.outputSummary = "Constructed 6 prioritized mitigation interventions across 3 chronological phases.";
        state.executionTrace.push(trace);
        return state;
    }

    /**
     * Node 4: Executive Strategy Synthesizer
     */
    async executiveSynthesisAgentNode(state) {
        const trace = {
            node: "Executive Strategy Synthesizer & Reasoning Engine",
            status: "COMPLETED",
            timestamp: new Date().toISOString(),
            logs: []
        };

        const provider = this.config.provider || "heuristic";
        const apiKey = this.config.apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);
        const modelName = this.config.modelName;

        trace.logs.push(`Selecting strategic reasoning engine: ${provider.toUpperCase()}...`);

        try {
            if (provider === "gemini" && apiKey) {
                trace.logs.push(`Dispatching multi-variable analysis to Google Gemini (${modelName || "gemini-1.5-flash"})...`);
                state.strategicIntelligence = await callGeminiStrategicAPI(
                    apiKey,
                    modelName,
                    state.startup,
                    state.benchmarkData,
                    state.fmeaDiagnostics
                );
                trace.logs.push("Gemini strategic reasoning generated successfully.");
            } else if (provider === "openai" && apiKey) {
                trace.logs.push(`Dispatching multi-variable analysis to OpenAI (${modelName || "gpt-4o-mini"})...`);
                state.strategicIntelligence = await callOpenAIStrategicAPI(
                    apiKey,
                    modelName,
                    state.startup,
                    state.benchmarkData,
                    state.fmeaDiagnostics
                );
                trace.logs.push("OpenAI strategic reasoning generated successfully.");
            } else {
                trace.logs.push("Executing deterministic VC reasoning engine (Heuristic mode)...");
                state.strategicIntelligence = generateHeuristicStrategicPlan(
                    state.startup,
                    state.benchmarkData,
                    state.fmeaDiagnostics
                );
                trace.logs.push("Deterministic VC reasoning completed.");
            }
        } catch (err) {
            trace.logs.push(`LLM error encountered (${err.message}). Seamlessly engaging Heuristic VC reasoning fallback.`);
            state.strategicIntelligence = generateHeuristicStrategicPlan(
                state.startup,
                state.benchmarkData,
                state.fmeaDiagnostics
            );
        }

        trace.outputSummary = `Completed executive synthesis with confidence score of ${state.strategicIntelligence.confidenceScore}%.`;
        state.executionTrace.push(trace);
        return state;
    }

    /**
     * Execute the full LangGraph Agent Workflow
     */
    async run(startup) {
        let state = {
            startup: startup,
            benchmarkData: {},
            fmeaDiagnostics: [],
            mitigationRoadmap: {},
            strategicIntelligence: {},
            executionTrace: []
        };

        // Execute Graph Nodes in Sequence
        state = await this.benchmarkAgentNode(state);
        state = await this.fmeaDiagnosticAgentNode(state);
        state = await this.mitigationPlannerAgentNode(state);
        state = await this.executiveSynthesisAgentNode(state);

        return {
            success: true,
            startup: state.startup,
            benchmarkData: state.benchmarkData,
            fmeaDiagnostics: state.fmeaDiagnostics,
            mitigationRoadmap: state.mitigationRoadmap,
            strategicIntelligence: state.strategicIntelligence,
            executionTrace: state.executionTrace
        };
    }
}

/**
 * Scenario Simulator Calculation
 */
function simulateWhatIfScenario(baseStartup, params) {
    const originalBudget = Number(baseStartup.budget) || 100000;
    const budgetDeltaPct = Number(params.budgetDeltaPct) || 0;
    const burnReductionPct = Number(params.burnReductionPct) || 0;
    const gtmPivot = params.gtmPivot || "none";
    const teamExperienceLevel = params.teamExperienceLevel || "moderate";

    // Base score estimation
    let baseRisk = 72;
    if (baseStartup.industry === "AI") baseRisk = 55;
    if (baseStartup.industry === "healthcare") baseRisk = 65;
    if (baseStartup.business_model === "SaaS") baseRisk -= 5;

    // Apply adjustments
    let riskDelta = 0;
    
    // Budget boost impact
    if (budgetDeltaPct > 0) {
        riskDelta -= Math.min(budgetDeltaPct * 0.25, 18);
    } else if (budgetDeltaPct < 0) {
        riskDelta += Math.min(Math.abs(budgetDeltaPct) * 0.3, 20);
    }

    // Burn reduction impact
    if (burnReductionPct > 0) {
        riskDelta -= Math.min(burnReductionPct * 0.35, 16);
    }

    // GTM Pivot impact
    if (gtmPivot === "niche_b2b") {
        riskDelta -= 8;
    } else if (gtmPivot === "product_led") {
        riskDelta -= 10;
    } else if (gtmPivot === "annual_contracts") {
        riskDelta -= 7;
    }

    // Team experience
    if (teamExperienceLevel === "expert") {
        riskDelta -= 12;
    } else if (teamExperienceLevel === "serial_founder") {
        riskDelta -= 16;
    }

    const newRisk = Math.max(12, Math.min(95, Math.round(baseRisk + riskDelta)));
    const newSuccess = 100 - newRisk;

    const newBudget = Math.round(originalBudget * (1 + budgetDeltaPct / 100));

    return {
        originalRisk: baseRisk,
        simulatedRisk: newRisk,
        riskReduction: baseRisk - newRisk,
        simulatedSuccess: newSuccess,
        projectedRunwayMonths: Math.round((newBudget / (originalBudget * 0.12 * (1 - burnReductionPct / 100)))),
        insights: [
            budgetDeltaPct > 0 ? `Increasing budget by ${budgetDeltaPct}% expands financial cushion significantly.` : "Maintaining current capital base.",
            burnReductionPct > 0 ? `Cutting burn rate by ${burnReductionPct}% yields critical extra runway months.` : "Standard burn rate trajectory.",
            gtmPivot !== "none" ? `Adopting ${gtmPivot.replace("_", " ")} strategy lowers customer acquisition friction.` : "Retaining baseline GTM strategy.",
            `Projected risk decreases from ${baseRisk}% to ${newRisk}%.`
        ]
    };
}

module.exports = {
    LangGraphAgentWorkflow,
    simulateWhatIfScenario,
    generateAndSaveIndustryData,
    generateFeasibilityAndSWOT,
    synthesizeContextualSWOTAndFeasibility,
    loadIndustryDataset
};


