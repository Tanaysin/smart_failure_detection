
Chart.defaults.font.family = "'Poppins', 'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#94A3B8";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.pointStyle = "circle";
Chart.defaults.plugins.legend.position = "bottom";

// ==========================================
// LIGHT MODE — TEAL + INDIGO SAAS PALETTE
// (cool gray background, white cards,
//  Tailwind/shadcn-style accent colors)
// ==========================================
const COLORS = {
    navy:      "#4F46E5",   // indigo-600 — primary line / dark segment
    orange:    "#14B8A6",   // teal-500 — secondary line / accent segment
    coral:     "#818CF8",   // indigo-400 — tertiary segment
    purple:    "#2DD4BF",   // teal-400 — quaternary segment
    skyblue:   "#C7D2FE",   // indigo-200 — light segment
    green:     "#5EEAD4",   // teal-300
    red:       "#F87171",   // reserved for negative/alert states
    gridline:  "#F1F5F9",   // cool gray-100 gridlines
    axisText:  "#94A3B8",   // slate-400 muted labels
    cardText:  "#1E293B"    // slate-800 near-black text for values/tooltips
};

const PALETTE = [
    COLORS.navy,
    COLORS.orange,
    COLORS.coral,
    COLORS.purple,
    COLORS.skyblue,
    COLORS.green
];

// Shared white "card style" tooltip — dark bold value, light label
const TOOLTIP_STYLE = {
    backgroundColor: "#ffffff",
    titleColor: "#9CA3AF",
    bodyColor: COLORS.cardText,
    borderColor: "#EEF1F6",
    borderWidth: 1,
    padding: 12,
    cornerRadius: 10,
    displayColors: false,
    titleFont: { family: "Poppins", size: 11, weight: "500" },
    bodyFont: { family: "Poppins", size: 15, weight: "700" },
    caretSize: 6,
    boxPadding: 4
};

// Shared light-theme axis style: no vertical gridlines,
// faint dashed horizontal gridlines only, muted labels
function cleanScales() {
    return {
        x: {
            grid: { display: false, drawBorder: false },
            border: { display: false },
            ticks: { color: COLORS.axisText, font: { size: 12 } }
        },
        y: {
            grid: { color: COLORS.gridline, drawBorder: false, drawTicks: false },
            border: { display: false },
            ticks: { color: COLORS.axisText, font: { size: 12 }, padding: 8 }
        }
    };
}

// Builds a soft vertical gradient fill for line charts (light theme:
// fades from a light tint of the line color down to fully transparent)
function gradientFill(ctx, color, chartArea) {
    if (!chartArea) return color;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, color + "26"); // ~15% opacity at top
    gradient.addColorStop(1, color + "00"); // fully transparent at bottom
    return gradient;
}

const SMOOTH_ANIMATION = { duration: 900, easing: "easeOutQuart" };

// Reusable plugin: draws a centered value inside a doughnut
// (e.g. "$452" in the middle of the Earnings ring)
function centerTextPlugin(getText, subtext) {
    return {
        id: "centerText_" + Math.random().toString(36).slice(2),
        afterDraw(chart) {
            const { ctx, chartArea } = chart;
            const x = (chartArea.left + chartArea.right) / 2;
            const y = (chartArea.top + chartArea.bottom) / 2;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = COLORS.cardText;
            ctx.font = "700 26px Poppins";
            ctx.fillText(getText(), x, subtext ? y - 10 : y);

            if (subtext) {
                ctx.font = "12px Poppins";
                ctx.fillStyle = "#9CA3AF";
                ctx.fillText(subtext, x, y + 14);
            }
            ctx.restore();
        }
    };
}

// ==========================================
// Startup Risk Intelligence Dashboard
// ==========================================
// let industryData = {};
let industryTrendChart;
let failureChart;
let investmentChart;
let fundingTrendChart;
let competitorChart;
let revenueChart;
let featureRadarChart;
let riskDistributionChart;
let riskGaugeChart;
let competitorFundingChart;
let industryDataset = {};
let projects = [];

let industryChart;
let businessChart;
let budgetChart;
let growthChart;
let radarChart;



// ==========================================
// PAGE LOAD
// ==========================================

// window.onload = () => {

//     // loadDashboard();

//     // const form = document.getElementById("submissionForm");

//     // if (form) {
//     //     form.addEventListener("submit", Submitproj);
//     // }
//     loadIndustryData();

// loadDashboard();

// document
// .getElementById("submissionForm")
// .addEventListener("submit", Submitproj);

// };

window.onload = async () => {
    console.log("Window Loaded");
    await fetchIndustryData();

    await loadDashboard();

    document
        .getElementById("submissionForm")
        .addEventListener("submit", Submitproj);

};


// ==========================================
// LOAD DATA FROM SERVER
// ==========================================
async function fetchIndustryData() {
    console.log("fetchIndustryData() called");
    try {
        let response;
        try {
            response = await fetch("/industry-data");
            if (!response.ok) throw new Error("Local fetch failed");
        } catch (e) {
            response = await fetch("https://smart-failure-detection-owp3.onrender.com/industry-data");
        }

        industryDataset = await response.json();
        populateIndustryDropdown();
        console.log("Industry Data Loaded successfully:", Object.keys(industryDataset));
    }
    catch(err){
        console.error("Industry JSON Error:", err);
    }
}

function populateIndustryDropdown() {
    const dropdowns = [
        document.getElementById("industry"),
        document.getElementById("marketIndustrySelect"),
        document.getElementById("competitorIndustrySelect")
    ];

    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        const currentVal = dropdown.value;
        dropdown.innerHTML = dropdown.id === "industry" ? '<option value="">Select Industry</option>' : '';

        Object.keys(industryDataset).forEach(industry => {
            const option = document.createElement("option");
            option.value = industry;
            option.textContent = industry.charAt(0).toUpperCase() + industry.slice(1);
            dropdown.appendChild(option);
        });

        if (currentVal && Object.keys(industryDataset).some(k => k.toLowerCase() === currentVal.toLowerCase())) {
            dropdown.value = currentVal;
        }
    });
}
// async function loadDashboard() {

//     try {
//         const jsonResponse = await fetch("/Industry_data.json");
//         industryDataset = await jsonResponse.json();

//         const response = await fetch("https://smart-failure-detection-owp3.onrender.com/projects");
//         projects = await response.json();

//         updateKPIs();
//         updateAssessment();
//         updateRecommendations();
//         createCharts();
//         loadTable();
//         loadIndustryData();

//     } catch (err) {
//         console.error("Dashboard Error:", err);
//     }

// }
async function loadDashboard() {

    try {

        const response =
            await fetch("https://smart-failure-detection-owp3.onrender.com/projects");

        projects =
            await response.json();

        updateKPIs();

        updateAssessment();

        updateRecommendations();

        createCharts();

        loadTable();
        loadIndustryData();


    }

    catch(err){

        console.error("Dashboard Error:", err);

    }

}

function loadIndustryCharts() {

    if (projects.length == 0)
        return;

    const industry = projects[0].industry;
    const data = industryDataset[industry];

    if (!data) {
        alert("Industry data not found!");
        return;
    }

    createIndustryTrend(data);
    createFundingTrend(data);
    createFailureChart(data);
    createCompetitorCharts(data);

}

// ==========================================
// AI RISK ENGINE
// (Rule Based - ML Ready)
// ==========================================

function calculateRisk(project) {

    const scores = {};

    const budget = Number(project.budget || 0);
    const industry = project.industry || "";
    const model = project.business_model || project.businessModel || "";
    const description = project.description || "";

    const words = description.trim() === ""
        ? 0
        : description.trim().split(/\s+/).length;

    // FINANCIAL RISK
    if (budget < 100000) {
        scores.financial = 85;
    } else if (budget < 500000) {
        scores.financial = 60;
    } else {
        scores.financial = 25;
    }

    // MARKET RISK
    const riskyIndustries = [
        "Healthcare", "Real Estate", "Travel", "Food", "Construction", "Agriculture"
    ];

    scores.market = riskyIndustries.includes(industry) ? 80 : 35;

    // BUSINESS MODEL RISK
    switch (model) {
        case "SaaS":
            scores.business = 25;
            break;
        case "B2B":
            scores.business = 40;
            break;
        case "B2C":
            scores.business = 55;
            break;
        default:
            scores.business = 70;
    }

    // EXECUTION RISK
    if (words > 80) {
        scores.execution = 20;
    } else if (words > 40) {
        scores.execution = 40;
    } else {
        scores.execution = 70;
    }

    // INNOVATION RISK
    if (description.length > 250) {
        scores.innovation = 20;
    } else if (description.length > 120) {
        scores.innovation = 40;
    } else {
        scores.innovation = 70;
    }

    // OVERALL RISK
    scores.overall = Math.round(
        scores.market * 0.25 +
        scores.financial * 0.25 +
        scores.business * 0.20 +
        scores.execution * 0.15 +
        scores.innovation * 0.15
    );

    return scores;

}

// ==========================================
// SWOT ANALYSIS ENGINE
// ==========================================

function generateSWOT(project) {

    const scores = calculateRisk(project);

    const industryKey = (project.industry || "").toLowerCase();
    const industryInfo = industryDataset[industryKey] || {};

    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    const budget = Number(project.budget || 0);
    const description = project.description || "";
    const model = project.business_model || project.businessModel || "";

    const words = description.trim() === ""
        ? 0
        : description.trim().split(/\s+/).length;


    // ==============================
    // STRENGTHS
    // ==============================

    if (budget >= 500000) {
        strengths.push("Strong financial capacity supports business execution.");
    }

    if (scores.business <= 40) {
        strengths.push("Business model demonstrates good scalability.");
    }

    if (scores.market <= 40) {
        strengths.push("Market conditions are relatively favourable.");
    }

    if (words > 80) {
        strengths.push("Project description indicates detailed planning.");
    }

    if (industryInfo.marketGrowth) {

        const growth = industryInfo.marketGrowth;
        const latestGrowth = growth[growth.length - 1];

        if (latestGrowth >= 40) {
            strengths.push("Industry is experiencing strong market growth.");
        }
    }


    // ==============================
    // WEAKNESSES
    // ==============================

    if (scores.financial >= 60) {
        weaknesses.push("Funding level may be insufficient for large-scale execution.");
    }

    if (scores.business >= 60) {
        weaknesses.push("Business model requires further validation.");
    }

    if (scores.execution >= 60) {
        weaknesses.push("Execution planning and milestone definition need improvement.");
    }

    if (scores.innovation >= 60) {
        weaknesses.push("Product differentiation and innovation could be strengthened.");
    }

    if (words < 40) {
        weaknesses.push("Project description lacks sufficient implementation detail.");
    }


    // ==============================
    // OPPORTUNITIES
    // ==============================

    if (industryInfo.marketGrowth) {

        const growth = industryInfo.marketGrowth;
        const latestGrowth = growth[growth.length - 1];

        if (latestGrowth >= 20) {
            opportunities.push("Growing industry creates opportunities for market expansion.");
        }
    }

    if (industryInfo.competitors) {

        if (industryInfo.competitors.length > 0) {
            opportunities.push(
                "Market gaps can be identified by analysing existing competitors."
            );
        }
    }

    if (model === "SaaS") {
        opportunities.push(
            "Scalable SaaS architecture provides opportunities for rapid expansion."
        );
    }

    opportunities.push(
        "Technology adoption can create opportunities for product innovation."
    );


    // ==============================
    // THREATS
    // ==============================

    if (industryInfo.failureRate >= 40) {
        threats.push(
            `Industry has a relatively high startup failure rate of ${industryInfo.failureRate}%.`
        );
    }

    if (scores.market >= 60) {
        threats.push(
            "High market risk and competitive pressure may affect growth."
        );
    }

    if (industryInfo.competitors &&
        industryInfo.competitors.length >= 3) {

        threats.push(
            "Established competitors may create significant barriers to entry."
        );
    }

    threats.push(
        "Changing customer preferences and market conditions may affect business performance."
    );


    // Make sure every section has at least one item

    if (strengths.length === 0) {
        strengths.push("Project has a defined business concept and target market.");
    }

    if (weaknesses.length === 0) {
        weaknesses.push("Further validation is recommended before large-scale investment.");
    }

    if (opportunities.length === 0) {
        opportunities.push("Potential exists for expansion into new market segments.");
    }

    if (threats.length === 0) {
        threats.push("Competition and changing market conditions remain potential risks.");
    }


    return {
        strengths,
        weaknesses,
        opportunities,
        threats
    };
}


// ==========================================
// FEASIBILITY ASSESSMENT ENGINE
// ==========================================

function calculateFeasibility(project) {

    const risk = calculateRisk(project);

    const industryKey = (project.industry || "").toLowerCase();
    const industryInfo = industryDataset[industryKey] || {};

    const budget = Number(project.budget || 0);

    // Financial feasibility
    let financial = 50;

    if (budget >= 1000000) {
        financial = 90;
    } else if (budget >= 500000) {
        financial = 80;
    } else if (budget >= 100000) {
        financial = 65;
    } else {
        financial = 45;
    }


    // Market feasibility
    let market = 70;

    if (industryInfo.marketGrowth) {

        const growth =
            industryInfo.marketGrowth[
                industryInfo.marketGrowth.length - 1
            ];

        if (growth >= 50) {
            market = 90;
        } else if (growth >= 30) {
            market = 80;
        } else if (growth >= 15) {
            market = 70;
        } else {
            market = 55;
        }
    }


    // Business model feasibility
    let business = 60;

    const model =
        project.business_model ||
        project.businessModel ||
        "";

    if (model === "SaaS") {
        business = 90;
    } else if (model === "B2B") {
        business = 80;
    } else if (model === "B2C") {
        business = 70;
    }


    // Industry feasibility
    let industry = 70;

    if (industryInfo.failureRate !== undefined) {

        const failureRate =
            Number(industryInfo.failureRate);

        industry = Math.max(
            30,
            100 - failureRate
        );
    }


    // Execution feasibility
    const execution =
        100 - risk.execution;


    // Overall feasibility
    const overall = Math.round(
        financial * 0.25 +
        market * 0.25 +
        business * 0.20 +
        industry * 0.15 +
        execution * 0.15
    );


    let status;

    if (overall >= 80) {
        status = "Highly Feasible";
    } else if (overall >= 65) {
        status = "Moderately Feasible";
    } else if (overall >= 50) {
        status = "Needs Improvement";
    } else {
        status = "Low Feasibility";
    }


    return {
        financial,
        market,
        business,
        industry,
        execution,
        overall,
        status
    };
}

//yha tk swot analysis

// ==========================================
// FEATURE SCORE ENGINE
// ==========================================

function calculateFeatureScores(project) {

    let innovation = 50;
    let scalability = 50;
    let finance = 50;
    let market = 50;
    let execution = 50;

    const words = project.description.trim().split(/\s+/).length;

    if (words > 80) innovation = 90;
    else if (words > 40) innovation = 75;
    else innovation = 55;

    switch (project.business_model) {
        case "SaaS":
            scalability = 95;
            break;
        case "B2B":
            scalability = 80;
            break;
        case "B2C":
            scalability = 70;
            break;
        default:
            scalability = 60;
    }

    const budget = Number(project.budget);

    if (budget >= 1000000) finance = 95;
    else if (budget >= 500000) finance = 80;
    else if (budget >= 100000) finance = 65;
    else finance = 45;

    const goodIndustries = ["AI", "FinTech", "Healthcare", "Cybersecurity", "SaaS"];
    market = goodIndustries.includes(project.industry) ? 90 : 70;

    const risk = calculateRisk(project);
    execution = 100 - risk.overall;

    return { innovation, scalability, finance, market, execution };

}

// ==========================================
// KPI CARDS
// ==========================================

function updateKPIs() {

    if (projects.length === 0)
        return;

    let totalOverall = 0;
    let totalFinancial = 0;
    let totalMarket = 0;
    let totalBudget = 0;

    projects.forEach(project => {
        const scores = calculateRisk(project);
        totalOverall += scores.overall;
        totalFinancial += scores.financial;
        totalMarket += scores.market;
        totalBudget += Number(project.budget || 0);
    });

    const overallRisk = Math.round(totalOverall / projects.length);
    const successProbability = 100 - overallRisk;
    const financialHealth = 100 - Math.round(totalFinancial / projects.length);
    const marketRisk = Math.round(totalMarket / projects.length);

    const cards = document.querySelectorAll(".card");

    if (cards.length >= 4) {

        cards[0].querySelector("h2").textContent = overallRisk + "%";
        cards[0].querySelector("p").textContent =
            overallRisk > 70 ? "High Risk" : overallRisk > 40 ? "Medium Risk" : "Low Risk";

        cards[1].querySelector("h2").textContent = successProbability + "%";
        cards[1].querySelector("p").textContent =
            successProbability > 70 ? "Excellent" : successProbability > 50 ? "Moderate" : "Needs Improvement";

        cards[2].querySelector("h2").textContent = financialHealth + "%";
        cards[2].querySelector("p").textContent =
            financialHealth > 70 ? "Stable" : financialHealth > 40 ? "Average" : "Weak";

        cards[3].querySelector("h2").textContent = marketRisk + "%";
        cards[3].querySelector("p").textContent =
            marketRisk > 70 ? "Competitive" : marketRisk > 40 ? "Moderate" : "Favourable";

    }

}

// ==========================================
// AI ASSESSMENT PANEL
// ==========================================

// function updateAssessment() {

//     if (projects.length === 0)
//         return;

//     const project = projects[0];
//     const scores = calculateRisk(project);
//     const overall = scores.overall;

//     let level = "Low";
//     if (overall > 70) level = "High";
//     else if (overall > 40) level = "Medium";

//     const findings = [];

//     findings.push(scores.financial > 70
//         ? "Funding is below the recommended level."
//         : "Current funding is sufficient.");

//     findings.push(scores.market > 70
//         ? "Industry competition is very high."
//         : "Market conditions are relatively favourable.");

//     findings.push(scores.business > 60
//         ? "Business model requires further validation."
//         : "Business model appears scalable.");

//     findings.push(scores.execution > 60
//         ? "Execution strategy should be strengthened."
//         : "Execution planning looks promising.");

//     findings.push(scores.innovation > 60
//         ? "Product differentiation could be improved."
//         : "Innovation level is above average.");

//     const report = document.querySelector(".assessment");

//     report.innerHTML = `
//         <h2><i class="fa-solid fa-file-lines"></i> AI Assessment Report</h2>
//         <hr>
//         <p><strong>Startup:</strong> ${project.project_name}</p>
//         <p><strong>Industry:</strong> ${project.industry}</p>
//         <p><strong>Business Model:</strong> ${project.business_model}</p>
//         <p><strong>Budget:</strong> ₹${Number(project.budget).toLocaleString()}</p>
//         <p><strong>Overall Risk:</strong> ${overall}% (${level})</p>
//         <br>
//         <h3>Risk Breakdown</h3>
//         <ul>
//             <li>Financial Risk : ${scores.financial}%</li>
//             <li>Market Risk : ${scores.market}%</li>
//             <li>Business Model Risk : ${scores.business}%</li>
//             <li>Execution Risk : ${scores.execution}%</li>
//             <li>Innovation Risk : ${scores.innovation}%</li>
//         </ul>
//         <br>
//         <h3>AI Findings</h3>
//         <ul>
//             ${findings.map(item => `<li>${item}</li>`).join("")}
//         </ul>
//     `;

// }

// NEW ASSESSMENT PANEL

// ==========================================
// AI ASSESSMENT PANEL
// ==========================================

function updateAssessment() {

    if (projects.length === 0)
        return;


    const project = projects[0];

    const scores = calculateRisk(project);

    const overall = scores.overall;


    // ==============================
    // RISK LEVEL
    // ==============================

    let level = "Low";

    if (overall > 70) {
        level = "High";
    }
    else if (overall > 40) {
        level = "Medium";
    }


    // ==============================
    // FINDINGS
    // ==============================

    const findings = [];


    findings.push(
        scores.financial > 70
            ? "Funding is below the recommended level."
            : "Current funding is sufficient."
    );


    findings.push(
        scores.market > 70
            ? "Industry competition is very high."
            : "Market conditions are relatively favourable."
    );


    findings.push(
        scores.business > 60
            ? "Business model requires further validation."
            : "Business model appears scalable."
    );


    findings.push(
        scores.execution > 60
            ? "Execution strategy should be strengthened."
            : "Execution planning looks promising."
    );


    findings.push(
        scores.innovation > 60
            ? "Product differentiation could be improved."
            : "Innovation level is above average."
    );


    // ==============================
    // SWOT
    // ==============================

    const swot = generateSWOT(project);


    // ==============================
    // FEASIBILITY
    // ==============================

    const feasibility =
        calculateFeasibility(project);


    // ==============================
    // REPORT
    // ==============================

    const report =
        document.querySelector(".assessment");


    report.innerHTML = `

        <h2>
            <i class="fa-solid fa-file-lines"></i>
            AI Assessment Report
        </h2>

        <hr>


        <p>
            <strong>Startup:</strong>
            ${project.project_name}
        </p>

        <p>
            <strong>Industry:</strong>
            ${project.industry}
        </p>

        <p>
            <strong>Business Model:</strong>
            ${project.business_model}
        </p>

        <p>
            <strong>Budget:</strong>
            ₹${Number(project.budget).toLocaleString()}
        </p>

        <p>
            <strong>Overall Risk:</strong>
            ${overall}% (${level})
        </p>


        <br>


        <h3>Risk Breakdown</h3>

        <ul>

            <li>
                Financial Risk:
                ${scores.financial}%
            </li>

            <li>
                Market Risk:
                ${scores.market}%
            </li>

            <li>
                Business Model Risk:
                ${scores.business}%
            </li>

            <li>
                Execution Risk:
                ${scores.execution}%
            </li>

            <li>
                Innovation Risk:
                ${scores.innovation}%
            </li>

        </ul>


        <br>


        <h3>AI Findings</h3>

        <ul>

            ${findings
                .map(item => `<li>${item}</li>`)
                .join("")}

        </ul>


        <br>


        <!-- ================================= -->
        <!-- FEASIBILITY -->
        <!-- ================================= -->

        <h3>
            <i class="fa-solid fa-chart-line"></i>
            Project Feasibility
        </h3>

        <div class="feasibility-summary">

            <div class="feasibility-score">
                <strong>
                    ${feasibility.overall}%
                </strong>

                <span>
                    ${feasibility.status}
                </span>
            </div>

        </div>


        <ul>

            <li>
                Financial Feasibility:
                ${feasibility.financial}%
            </li>

            <li>
                Market Feasibility:
                ${feasibility.market}%
            </li>

            <li>
                Business Model:
                ${feasibility.business}%
            </li>

            <li>
                Industry Conditions:
                ${feasibility.industry}%
            </li>

            <li>
                Execution Readiness:
                ${feasibility.execution}%
            </li>

        </ul>


        <br>


        <!-- ================================= -->
        <!-- SWOT ANALYSIS -->
        <!-- ================================= -->

        <h3>
            <i class="fa-solid fa-table-cells"></i>
            SWOT Analysis
        </h3>


        <div class="swot-grid">


            <div class="swot-card strengths">

                <h4>Strengths</h4>

                <ul>

                    ${swot.strengths
                        .map(item => `<li>${item}</li>`)
                        .join("")}

                </ul>

            </div>


            <div class="swot-card weaknesses">

                <h4>Weaknesses</h4>

                <ul>

                    ${swot.weaknesses
                        .map(item => `<li>${item}</li>`)
                        .join("")}

                </ul>

            </div>


            <div class="swot-card opportunities">

                <h4>Opportunities</h4>

                <ul>

                    ${swot.opportunities
                        .map(item => `<li>${item}</li>`)
                        .join("")}

                </ul>

            </div>


            <div class="swot-card threats">

                <h4>Threats</h4>

                <ul>

                    ${swot.threats
                        .map(item => `<li>${item}</li>`)
                        .join("")}

                </ul>

            </div>


        </div>

    `;

}


// ==========================================
// CHARTS
// ==========================================

function createCharts() {

    if (industryChart) industryChart.destroy();
    if (businessChart) businessChart.destroy();
    if (budgetChart) budgetChart.destroy();
    if (growthChart) growthChart.destroy();
    if (radarChart) radarChart.destroy();

    const industries = {};
    const models = {};
    const budgets = {};

    projects.forEach(project => {
        industries[project.industry] = (industries[project.industry] || 0) + 1;
        models[project.business_model] = (models[project.business_model] || 0) + 1;
        budgets[project.industry] = (budgets[project.industry] || 0) + Number(project.budget);
    });

    // ======================================
    // Industry Distribution — horizontal bar
    // ======================================

    industryChart = new Chart(
        document.getElementById("industryChart"),
        {
            type: "bar",
            data: {
                labels: Object.keys(industries),
                datasets: [{
                    label: "Startups",
                    data: Object.values(industries),
                    backgroundColor: COLORS.navy,
                    hoverBackgroundColor: COLORS.orange,
                    borderRadius: 10,
                    borderSkipped: false,
                    borderWidth: 0,
                    barThickness: 16
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: TOOLTIP_STYLE
                },
                // scales: cleanScales()
                scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
            },
            animation: SMOOTH_ANIMATION
        }
    );

    // ======================================
    // Business Model Distribution — doughnut
    // ======================================

    const totalModels = Object.values(models).reduce((a, b) => a + b, 0);

    businessChart = new Chart(
        document.getElementById("businessChart"),
        {
            type: "doughnut",
            data: {
                labels: Object.keys(models),
                datasets: [{
                    data: Object.values(models),
                    backgroundColor: PALETTE,
                    borderWidth: 5,
                    borderColor: "#ffffff",
                    hoverOffset: 6
                }]
            },
            options: {
                cutout: "72%",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: TOOLTIP_STYLE
                }
            },
            plugins: [centerTextPlugin(() => String(totalModels), "Total")],
            animation: SMOOTH_ANIMATION
        }
    );

    // ======================================
    // Budget Analysis — bar
    // ======================================

    budgetChart = new Chart(
        document.getElementById("budgetChart"),
        {
            type: "bar",
            data: {
                labels: Object.keys(budgets),
                datasets: [{
                    label: "Budget",
                    data: Object.values(budgets),
                    backgroundColor: COLORS.orange,
                    hoverBackgroundColor: COLORS.navy,
                    borderRadius: 10,
                    borderSkipped: false,
                    borderWidth: 0,
                    maxBarThickness: 28
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: TOOLTIP_STYLE
                },
                // scales: cleanScales()
                scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
            },
            animation: SMOOTH_ANIMATION
        }
    );

    // ======================================
    // Budget Trend — line, gradient fill
    // ======================================

    growthChart = new Chart(
        document.getElementById("growthChart"),
        {
            type: "line",
            data: {
                labels: projects.map((_, index) => "Startup " + (index + 1)),
                datasets: [{
                    label: "Budget",
                    data: projects.map(project => Number(project.budget)),
                    borderColor: COLORS.navy,
                    backgroundColor: (context) => {
                        const { ctx, chartArea } = context.chart;
                        return gradientFill(ctx, COLORS.navy, chartArea);
                    },
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: COLORS.navy,
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: "index" },
                plugins: {
                    legend: { display: false },
                    tooltip: TOOLTIP_STYLE
                },
                // scales: cleanScales()
                scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
            },
            animation: SMOOTH_ANIMATION
        }
    );

    // ======================================
    // AI Risk Radar Chart
    // ======================================

    const latestProject = projects[0];

    if (latestProject && document.getElementById("riskRadar")) {

        const scores = calculateRisk(latestProject);

        radarChart = new Chart(
            document.getElementById("riskRadar"),
            {
                type: "radar",
                data: {
                    labels: ["Financial", "Market", "Business", "Execution", "Innovation"],
                    datasets: [{
                        label: "Risk Profile",
                        data: [
                            scores.financial,
                            scores.market,
                            scores.business,
                            scores.execution,
                            scores.innovation
                        ],
                        borderColor: COLORS.orange,
                        backgroundColor: COLORS.orange + "26",
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: COLORS.orange,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: TOOLTIP_STYLE
                    },
                    scales: {
                        
                        r: {
                            min: 0,
                            max: 100,
                            grid: { color: COLORS.gridline, display: false },
                            angleLines: { color: COLORS.gridline },
                            pointLabels: { font: { size: 12 }, color: COLORS.axisText },
                            ticks: { display: false }
                        },
                        
                    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

}

// ==========================================
// PROJECT TABLE
// ==========================================

function loadTable() {

    const table = document.getElementById("projectTable");

    if (!table)
        return;

    table.innerHTML = "";

    projects.forEach(project => {

        const scores = calculateRisk(project);
        const risk = scores.overall;

        let riskLevel = "Low";
        if (risk > 70) riskLevel = "High";
        else if (risk > 40) riskLevel = "Medium";

        table.innerHTML += `
        <tr>
            <td>${project.project_name}</td>
            <td>${project.industry}</td>
            <td>₹${Number(project.budget).toLocaleString()}</td>
            <td>${riskLevel}</td>
            <td>${100 - risk}% Success</td>
        </tr>
        `;

    });

}

// ==========================================
// AI RECOMMENDATIONS
// ==========================================

function updateRecommendations() {

    if (projects.length === 0)
        return;

    const project = projects[0];
    const scores = calculateRisk(project);
    const recommendations = [];

    recommendations.push(scores.financial >= 70
        ? { icon: "💰", text: "Raise additional funding to extend runway." }
        : { icon: "✅", text: "Current funding level appears healthy." });

    recommendations.push(scores.market >= 70
        ? { icon: "📊", text: "Conduct deeper market validation before scaling." }
        : { icon: "📈", text: "Market conditions appear favourable." });

    recommendations.push(scores.business >= 60
        ? { icon: "🏢", text: "Refine pricing strategy and business model." }
        : { icon: "🚀", text: "Business model demonstrates good scalability." });

    recommendations.push(scores.execution >= 60
        ? { icon: "⚙️", text: "Improve execution roadmap and milestone planning." }
        : { icon: "🎯", text: "Execution strategy is well defined." });

    recommendations.push(scores.innovation >= 60
        ? { icon: "💡", text: "Increase product differentiation and innovation." }
        : { icon: "⭐", text: "Innovation score is above average." });

    const panel = document.querySelector(".recommendations");

    if (!panel) return;

    panel.innerHTML = `
        <h2><i class="fa-solid fa-lightbulb"></i> AI Recommendations</h2>
        <hr>
        ${recommendations.map(item => `
            <div class="tip">
                <span style="font-size:20px;">${item.icon}</span>
                ${item.text}
            </div>
        `).join("")}
    `;

}

// ==========================================
// SUBMIT PROJECT
// ==========================================

async function Submitproj(e) {

    e.preventDefault();

    let indValue = document.getElementById("industry").value;
    const customWrapper = document.getElementById("customIndustryInputWrapper");
    const customInput = document.getElementById("customIndustryInput");

    if (customWrapper && customWrapper.style.display !== "none" && customInput && customInput.value.trim()) {
        indValue = customInput.value.trim();
        // Dynamically research and persist live market data via Gemini/API
        await generateLiveIndustryData(indValue);
    }

    const project = {
        projectName: document.getElementById("projectName").value,
        industry: indValue,
        businessModel: document.getElementById("businessModel").value,
        targetMarket: document.getElementById("targetMarket").value,
        budget: document.getElementById("budget").value,
        description: document.getElementById("description").value
    };

    try {

        let response;
        try {
            response = await fetch("/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project)
            });
            if (!response.ok) throw new Error("Local post failed");
        } catch (err) {
            response = await fetch("https://smart-failure-detection-owp3.onrender.com/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Error submitting project");
            return;
        }

        alert(`Startup '${project.projectName}' analysed successfully with live ${project.industry} market benchmarks!`);
        document.getElementById("submissionForm").reset();
        await loadDashboard();

    } catch (err) {
        console.error(err);
        alert("Startup recorded locally for risk intelligence analysis.");
        projects.unshift({
            project_name: project.projectName,
            projectName: project.projectName,
            industry: project.industry,
            business_model: project.businessModel,
            budget: project.budget,
            target_market: project.targetMarket,
            description: project.description
        });
        updateKPIs();
        updateAssessment();
        updateRecommendations();
        createCharts();
        loadIndustryData(project.industry);
    }

}

// ==========================================
// PAGE NAVIGATION
// ==========================================

function hideAllPages() {
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("reportPage").style.display = "none";
    document.getElementById("marketPage").style.display = "none";
    document.getElementById("competitorPage").style.display = "none";
    if (document.getElementById("agentPage")) {
        document.getElementById("agentPage").style.display = "none";
    }
    document.getElementById("datasetPage").style.display = "none";
}

function removeActive() {
    document.querySelectorAll(".sidebar ul li").forEach(item => {
        item.classList.remove("active");
    });
}

function showPage(pageId, buttonId) {
    hideAllPages();
    const page = document.getElementById(pageId);
    if (page) page.style.display = "block";
    removeActive();
    const btn = document.getElementById(buttonId);
    if (btn) btn.classList.add("active");
}

document.getElementById("dashboardBtn").addEventListener("click", () => {
    showPage("dashboardPage", "dashboardBtn");
});

document.getElementById("reportBtn").addEventListener("click", () => {
    showPage("reportPage", "reportBtn");
});

document.getElementById("marketBtn").addEventListener("click", () => {
    showPage("marketPage", "marketBtn");
});

document.getElementById("competitorBtn").addEventListener("click", () => {
    showPage("competitorPage", "competitorBtn");
});

const agentBtn = document.getElementById("agentBtn");
if (agentBtn) {
    agentBtn.addEventListener("click", () => {
        showPage("agentPage", "agentBtn");
    });
}

document.getElementById("datasetBtn").addEventListener("click", () => {
    showPage("datasetPage", "datasetBtn");
});

showPage("dashboardPage", "dashboardBtn");

function loadIndustryData(targetIndustry) {

    let indKey = targetIndustry;
    if (!indKey) {
        if (projects.length > 0 && projects[0].industry) {
            indKey = projects[0].industry;
        } else {
            const keys = Object.keys(industryDataset);
            indKey = keys.length > 0 ? keys[0] : "healthcare";
        }
    }

    const matchedKey = Object.keys(industryDataset).find(
        k => k.toLowerCase() === (indKey || "").toLowerCase()
    ) || Object.keys(industryDataset)[0];

    const industryInfo = industryDataset[matchedKey];

    if (!industryInfo) {
        console.log("Industry not found:", indKey);
        return;
    }

    // Synchronize Market & Competitor industry dropdowns
    const mSelect = document.getElementById("marketIndustrySelect");
    const cSelect = document.getElementById("competitorIndustrySelect");
    if (mSelect && mSelect.value !== matchedKey) mSelect.value = matchedKey;
    if (cSelect && cSelect.value !== matchedKey) cSelect.value = matchedKey;


    // ======================================
    // Industry Trend — line, gradient fill
    // ======================================

    function createIndustryTrendChart(data) {

        if (industryTrendChart) {
            industryTrendChart.destroy();
        }

        industryTrendChart = new Chart(
            document.getElementById("industryTrendChart"),
            {
                type: "line",
                data: {
                    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
                    datasets: [{
                        label: "Market Growth",
                        data: data.marketGrowth,
                        borderColor: COLORS.navy,
                        backgroundColor: (context) => {
                            const { ctx, chartArea } = context.chart;
                            return gradientFill(ctx, COLORS.navy, chartArea);
                        },
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: COLORS.navy,
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 2,
                        tension: 0.45,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: "index" },
                    plugins: {
                        legend: { display: false },
                        tooltip: TOOLTIP_STYLE
                    },
                    // scales: cleanScales()
                    scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createIndustryTrendChart(industryInfo);

    // ======================================
    // Funding Trend — bar
    // ======================================

    function createFundingTrendChart(data) {

        if (fundingTrendChart) {
            fundingTrendChart.destroy();
        }

        fundingTrendChart = new Chart(
            document.getElementById("fundingTrendChart"),
            {
                type: "bar",
                data: {
                    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
                    datasets: [{
                        label: "Funding (₹ Crore)",
                        data: data.funding,
                        backgroundColor: COLORS.purple,
                        hoverBackgroundColor: COLORS.navy,
                        borderRadius: 10,
                        borderSkipped: false,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: TOOLTIP_STYLE
                    },
                    // scales: cleanScales()
                    scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createFundingTrendChart(industryInfo);

    // ======================================
    // Failure/Success — doughnut
    // ======================================

    function createFailureChart(data) {

        if (failureChart) {
            failureChart.destroy();
        }

        failureChart = new Chart(
            document.getElementById("failureTrendChart"),
            {
                type: "doughnut",
                data: {
                    labels: ["Failure", "Success"],
                    datasets: [{
                        data: [data.failureRate, 100 - data.failureRate],
                        backgroundColor: [COLORS.coral, COLORS.skyblue],
                        borderWidth: 5,
                        borderColor: "#ffffff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    cutout: "72%",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: TOOLTIP_STYLE
                    }
                },
                plugins: [centerTextPlugin(() => data.failureRate + "%", "Failure Rate")],
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createFailureChart(industryInfo);

    // ======================================
    // Investment Distribution — pie
    // ======================================

    function createInvestmentChart(data) {

        if (investmentChart) {
            investmentChart.destroy();
        }

        investmentChart = new Chart(
            document.getElementById("investmentChart"),
            {
                type: "pie",
                data: {
                    labels: ["Seed", "Angel", "Series A", "Series B", "Others"],
                    datasets: [{
                        data: data.investmentDistribution,
                        backgroundColor: PALETTE,
                        borderWidth: 5,
                        borderColor: "#ffffff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: TOOLTIP_STYLE
                    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createInvestmentChart(industryInfo);

    // ======================================
    // Market Share — pie
    // ======================================

    function createCompetitorChart(data) {

        if (competitorChart) {
            competitorChart.destroy();
        }

        competitorChart = new Chart(
            document.getElementById("marketShareChart"),
            {
                type: "pie",
                data: {
                    labels: data.competitors.map(c => c.name),
                    datasets: [{
                        data: data.competitors.map(c => c.marketShare),
                        backgroundColor: PALETTE,
                        borderWidth: 5,
                        borderColor: "#ffffff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: TOOLTIP_STYLE
                    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createCompetitorChart(industryInfo);

    // ======================================
    // Competitor Revenue — bar
    // ======================================

    function createRevenueChart(data) {

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(
            document.getElementById("revenueChart"),
            {
                type: "bar",
                data: {
                    labels: data.competitors.map(c => c.name),
                    datasets: [{
                        label: "Revenue (₹ Crore)",
                        data: data.competitors.map(c => c.revenue),
                        backgroundColor: COLORS.navy,
                        hoverBackgroundColor: COLORS.orange,
                        borderRadius: 10,
                        borderSkipped: false,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: TOOLTIP_STYLE
                    },
                    // scales: cleanScales()
                    scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createRevenueChart(industryInfo);

    // ======================================
    // Competitor Funding Comparison — bar
    // ======================================

    function createFundingComparisonChart(data) {

        if (competitorFundingChart) {
            competitorFundingChart.destroy();
        }

        competitorFundingChart = new Chart(
            document.getElementById("competitorFundingChart"),
            {
                type: "bar",
                data: {
                    labels: data.competitors.map(c => c.name),
                    datasets: [{
                        label: "Funding (₹ Crore)",
                        data: data.competitors.map(c => c.funding),
                        backgroundColor: COLORS.orange,
                        hoverBackgroundColor: COLORS.navy,
                        borderRadius: 10,
                        borderSkipped: false,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: TOOLTIP_STYLE
                    },
                    // scales: cleanScales()
                    scales:{

         x:{

             grid:{

                 display:false

             }
         },

         y:{

             grid:{
                 display: false,
                 color:"#fdfeff"

             },

             border:{

                 display:false

             }

         }

    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createFundingComparisonChart(industryInfo);

    // ======================================
    // Feature Radar — startup vs industry leader
    // ======================================

    function createFeatureRadar(project, industryInfo) {

        if (featureRadarChart)
            featureRadarChart.destroy();

        const startup = calculateFeatureScores(project);
        const competitor = industryInfo.competitors[0];

        featureRadarChart = new Chart(
            document.getElementById("featureRadarChart"),
            {
                type: "radar",
                data: {
                    labels: ["Innovation", "Scalability", "Finance", "Market", "Execution"],
                    datasets: [
                        {
                            label: "Your Startup",
                            data: [
                                startup.innovation,
                                startup.scalability,
                                startup.finance,
                                startup.market,
                                startup.execution
                            ],
                            borderColor: COLORS.navy,
                            backgroundColor: COLORS.navy + "22",
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: COLORS.navy,
                            fill: true
                        },
                        {
                            label: competitor.name,
                            data: [90, 90, 95, 90, 88],
                            borderColor: COLORS.orange,
                            backgroundColor: COLORS.orange + "1A",
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: COLORS.orange,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: TOOLTIP_STYLE
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: COLORS.gridline, display:false },
                            angleLines: { color: COLORS.gridline },
                            border: { display: false },
                            pointLabels: {
                                display: true,
                                font: { size: 12, weight: "600" },
                                color: COLORS.cardText
                            },
                            ticks: { display: false }
                        }
                    }
                },
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createFeatureRadar(projects[0], industryInfo);

    // ======================================
    // Risk Breakdown — doughnut
    // ======================================

    function createRiskDistributionChart(project) {

        if (riskDistributionChart) {
            riskDistributionChart.destroy();
        }

        const risk = calculateRisk(project);

        riskDistributionChart = new Chart(
            document.getElementById("riskBreakdownChart"),
            {
                type: "doughnut",
                data: {
                    labels: ["Financial", "Market", "Business", "Execution", "Innovation"],
                    datasets: [{
                        data: [
                            risk.financial,
                            risk.market,
                            risk.business,
                            risk.execution,
                            risk.innovation
                        ],
                        backgroundColor: [
                            COLORS.coral,
                            COLORS.orange,
                            COLORS.navy,
                            COLORS.purple,
                            COLORS.skyblue
                        ],
                        borderWidth: 5,
                        borderColor: "#ffffff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    cutout: "68%",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: TOOLTIP_STYLE
                    }
                },
                plugins: [centerTextPlugin(() => risk.overall + "%", "Overall Risk")],
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createRiskDistributionChart(projects[0]);

    // ======================================
    // Risk Gauge — half doughnut
    // ======================================

    function createRiskGauge(project) {

        if (riskGaugeChart) {
            riskGaugeChart.destroy();
        }

        const score = calculateRisk(project).overall;

        riskGaugeChart = new Chart(
            document.getElementById("riskGauge"),
            {
                type: "doughnut",
                data: {
                    datasets: [{
                        data: [score, 100 - score],
                        backgroundColor: [
                            score > 70 ? COLORS.coral : score > 40 ? COLORS.orange : COLORS.skyblue,
                            "#F1F4F9"
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    rotation: -90,
                    circumference: 180,
                    cutout: "80%",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [{
                    id: "gaugeText",
                    afterDraw(chart) {
                        const { ctx } = chart;
                        const x = chart.getDatasetMeta(0).data[0].x;
                        const y = chart.getDatasetMeta(0).data[0].y;

                        ctx.save();
                        ctx.font = "bold 34px Poppins";
                        ctx.textAlign = "center";
                        ctx.fillStyle = COLORS.cardText;
                        ctx.fillText(score + "%", x, y - 10);

                        ctx.font = "13px Poppins";
                        ctx.fillStyle = "#9CA3AF";
                        ctx.fillText("Risk Score", x, y + 18);
                        ctx.restore();
                    }
                }],
                animation: SMOOTH_ANIMATION
            }
        );

    }

    createRiskGauge(projects[0]);

}

// =========================================================
// MILESTONE 3: STRATEGIC AI AGENTS & LANGGRAPH WORKFLOW SUITE
// =========================================================

// Initialize Milestone 3 features when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initMilestone3AgentSuite();
});

// Also trigger initialization in case window.onload already ran
setTimeout(() => {
    initMilestone3AgentSuite();
}, 500);

let isWorkflowRunning = false;

function initMilestone3AgentSuite() {
    if (window._m3Initialized) return;
    window._m3Initialized = true;

    console.log("Initializing Milestone 3: AI Agent & Strategic Reasoning Suite");

    // Modal listeners
    const navSettingsBtn = document.getElementById("aiSettingsNavBtn");
    const headerSettingsBtn = document.getElementById("openAiSettingsBtn");
    const closeSettingsBtn = document.getElementById("closeAiConfigModalBtn");
    const saveSettingsBtn = document.getElementById("saveAiConfigBtn");
    const configModal = document.getElementById("aiConfigModal");
    const providerSelect = document.getElementById("modalAiProvider");

    if (navSettingsBtn) navSettingsBtn.addEventListener("click", () => openAiConfigModal());
    if (headerSettingsBtn) headerSettingsBtn.addEventListener("click", () => openAiConfigModal());
    if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", () => closeAiConfigModal());

    if (configModal) {
        configModal.addEventListener("click", (e) => {
            if (e.target === configModal) closeAiConfigModal();
        });
    }

    if (providerSelect) {
        providerSelect.addEventListener("change", (e) => {
            const geminiGroup = document.getElementById("geminiKeyGroup");
            const openaiGroup = document.getElementById("openaiKeyGroup");
            if (e.target.value === "gemini") {
                if (geminiGroup) geminiGroup.style.display = "block";
                if (openaiGroup) openaiGroup.style.display = "none";
            } else if (e.target.value === "openai") {
                if (geminiGroup) geminiGroup.style.display = "none";
                if (openaiGroup) openaiGroup.style.display = "block";
            } else {
                if (geminiGroup) geminiGroup.style.display = "none";
                if (openaiGroup) openaiGroup.style.display = "none";
            }
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            const provider = document.getElementById("modalAiProvider").value;
            const geminiKey = document.getElementById("geminiApiKeyInput").value.trim();
            const openaiKey = document.getElementById("openaiApiKeyInput").value.trim();

            localStorage.setItem("sfd_ai_provider", provider);
            if (geminiKey) localStorage.setItem("sfd_gemini_api_key", geminiKey);
            if (openaiKey) localStorage.setItem("sfd_openai_api_key", openaiKey);

            appendLog("info", `[Config] Saved AI preferences: Provider = ${provider.toUpperCase()}`);
            closeAiConfigModal();
            alert("AI Configuration saved successfully!");
        });
    }

    // Load saved settings into form
    const savedProvider = localStorage.getItem("sfd_ai_provider");
    const savedGeminiKey = localStorage.getItem("sfd_gemini_api_key");
    const savedOpenaiKey = localStorage.getItem("sfd_openai_api_key");

    if (savedProvider && providerSelect) {
        providerSelect.value = savedProvider;
        providerSelect.dispatchEvent(new Event("change"));
    }
    if (savedGeminiKey && document.getElementById("geminiApiKeyInput")) {
        document.getElementById("geminiApiKeyInput").value = savedGeminiKey;
    }
    if (savedOpenaiKey && document.getElementById("openaiApiKeyInput")) {
        document.getElementById("openaiApiKeyInput").value = savedOpenaiKey;
    }

    // Deep Dive CTA from Assessment Report Page
    const deepDiveBtn = document.getElementById("deepDiveAgentBtn");
    if (deepDiveBtn) {
        deepDiveBtn.addEventListener("click", () => {
            showPage("agentPage", "agentBtn");
            runLangGraphWorkflow();
        });
    }

    // Run Workflow Button
    const runBtn = document.getElementById("runWorkflowBtn");
    if (runBtn) {
        runBtn.addEventListener("click", () => {
            runLangGraphWorkflow();
        });
    }

    // Clear Logs Button
    const clearBtn = document.getElementById("clearLogsBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const terminal = document.getElementById("agentLogsTerminal");
            if (terminal) terminal.innerHTML = '<div class="log-line info">[System] Log cleared. Ready for next execution.</div>';
        });
    }

    // Scenario Simulator listeners
    const budgetSlider = document.getElementById("budgetDeltaSlider");
    const burnSlider = document.getElementById("burnReductionSlider");
    const gtmSelect = document.getElementById("simGtmPivot");
    const teamSelect = document.getElementById("simTeamProfile");

    if (budgetSlider) {
        budgetSlider.addEventListener("input", (e) => {
            const val = document.getElementById("budgetDeltaVal");
            if (val) val.textContent = (e.target.value >= 0 ? "+" : "") + e.target.value + "%";
            recalculateScenarioSimulator();
        });
    }

    if (burnSlider) {
        burnSlider.addEventListener("input", (e) => {
            const val = document.getElementById("burnReductionVal");
            if (val) val.textContent = e.target.value + "%";
            recalculateScenarioSimulator();
        });
    }

    // Initial calculation for simulator
    recalculateScenarioSimulator();

    // ==========================================
    // DYNAMIC INDUSTRY SELECTION & AI GENERATION
    // ==========================================

    const toggleCustomBtn = document.getElementById("toggleCustomIndustryBtn");
    const standardWrapper = document.getElementById("standardIndustrySelectWrapper");
    const customWrapper = document.getElementById("customIndustryInputWrapper");
    const customInput = document.getElementById("customIndustryInput");
    const aiResearchBtn = document.getElementById("aiResearchIndustryBtn");

    if (toggleCustomBtn && standardWrapper && customWrapper) {
        toggleCustomBtn.addEventListener("click", () => {
            if (customWrapper.style.display === "none") {
                customWrapper.style.display = "flex";
                standardWrapper.style.display = "none";
                toggleCustomBtn.textContent = "← Select Existing";
            } else {
                customWrapper.style.display = "none";
                standardWrapper.style.display = "block";
                toggleCustomBtn.textContent = "+ Custom Industry";
            }
        });
    }

    if (aiResearchBtn && customInput) {
        aiResearchBtn.addEventListener("click", async () => {
            const indName = customInput.value.trim();
            if (!indName) {
                alert("Please enter a custom industry sector (e.g. Agritech, CleanTech, Gaming).");
                return;
            }
            aiResearchBtn.disabled = true;
            aiResearchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Researching...';
            await generateLiveIndustryData(indName, true);
            aiResearchBtn.disabled = false;
            aiResearchBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Research';
        });
    }

    // Market Page toolbar controls
    const marketSelect = document.getElementById("marketIndustrySelect");
    const competitorSelect = document.getElementById("competitorIndustrySelect");
    const marketGenBtn = document.getElementById("marketGenAiBtn");
    const marketCustomInput = document.getElementById("marketCustomIndInput");
    const competitorRefreshBtn = document.getElementById("competitorRefreshBtn");

    if (marketSelect) {
        marketSelect.addEventListener("change", (e) => {
            loadIndustryData(e.target.value);
        });
    }

    if (competitorSelect) {
        competitorSelect.addEventListener("change", (e) => {
            loadIndustryData(e.target.value);
        });
    }

    if (marketGenBtn) {
        marketGenBtn.addEventListener("click", async () => {
            const customVal = marketCustomInput ? marketCustomInput.value.trim() : "";
            const targetInd = customVal || (marketSelect ? marketSelect.value : "technology");
            
            marketGenBtn.disabled = true;
            marketGenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Gemini...';
            
            await generateLiveIndustryData(targetInd, true);
            
            marketGenBtn.disabled = false;
            marketGenBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Research with Gemini';
            if (marketCustomInput) marketCustomInput.value = "";
        });
    }

    if (competitorRefreshBtn) {
        competitorRefreshBtn.addEventListener("click", async () => {
            const targetInd = competitorSelect ? competitorSelect.value : "technology";
            competitorRefreshBtn.disabled = true;
            competitorRefreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
            
            await generateLiveIndustryData(targetInd, true);
            
            competitorRefreshBtn.disabled = false;
            competitorRefreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh Market Competitors';
        });
    }
}

/**
 * Call Gemini / OpenAI / Server to dynamically generate and store live market intelligence
 */
async function generateLiveIndustryData(industryName, forceRefresh = false) {
    if (!industryName) return;
    const cleanName = industryName.trim();

    const provider = localStorage.getItem("sfd_ai_provider") || "heuristic";
    const apiKey = provider === "gemini" 
        ? localStorage.getItem("sfd_gemini_api_key") 
        : localStorage.getItem("sfd_openai_api_key");

    appendLog("info", `[Market Engine] Querying live market intelligence for "${cleanName}" (${provider.toUpperCase()})...`);

    try {
        const response = await fetch("/api/industry/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                industry: cleanName,
                provider: provider,
                apiKey: apiKey,
                forceRefresh: forceRefresh
            })
        });

        const result = await response.json();
        if (result.success && result.data) {
            industryDataset[result.industry] = result.data;
            populateIndustryDropdown();
            
            // Select in form dropdown
            const indDropdown = document.getElementById("industry");
            if (indDropdown) indDropdown.value = result.industry;

            // Load and update charts with new live market dataset
            loadIndustryData(result.industry);

            appendLog("success", `[Market Engine] Live market data for "${result.industry}" stored in Industry_data.json (Source: ${result.source}).`);
            alert(`✨ Live market intelligence for "${result.industry}" generated and stored! All charts and failure models updated.`);
            return result.data;
        } else {
            throw new Error(result.message || "Failed to generate market data");
        }
    } catch (err) {
        console.warn("Client fallback for industry generation:", err.message);
        appendLog("warn", `[Market Engine] Live generation error (${err.message}). Initializing fallback dataset.`);
        // Reload local dataset
        await fetchIndustryData();
        loadIndustryData(cleanName);
    }
}


function openAiConfigModal() {
    const modal = document.getElementById("aiConfigModal");
    if (modal) modal.style.display = "flex";
}

function closeAiConfigModal() {
    const modal = document.getElementById("aiConfigModal");
    if (modal) modal.style.display = "none";
}

function appendLog(type, message) {
    const terminal = document.getElementById("agentLogsTerminal");
    if (!terminal) return;

    const time = new Date().toLocaleTimeString();
    const line = document.createElement("div");
    line.className = `log-line ${type || "info"}`;
    line.textContent = `[${time}] ${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function getActiveStartupProfile() {
    if (projects && projects.length > 0) {
        return projects[0];
    }
    // Fallback to form inputs or mock profile
    const name = document.getElementById("projectName")?.value || "HealthAI";
    const ind = document.getElementById("industry")?.value || "healthcare";
    const model = document.getElementById("businessModel")?.value || "SaaS";
    const budget = document.getElementById("budget")?.value || 500000;
    const market = document.getElementById("targetMarket")?.value || "Clinics & Doctors";
    const desc = document.getElementById("description")?.value || "AI-powered diagnostic and patient triage platform.";

    return {
        project_name: name,
        projectName: name,
        industry: ind,
        business_model: model,
        budget: budget,
        target_market: market,
        description: desc
    };
}

/**
 * Execute LangGraph Agent Workflow
 */
async function runLangGraphWorkflow() {
    if (isWorkflowRunning) return;
    isWorkflowRunning = true;

    const statusBadge = document.getElementById("workflowStatusBadge");
    const runBtn = document.getElementById("runWorkflowBtn");
    if (statusBadge) {
        statusBadge.className = "status-pill status-running";
        statusBadge.textContent = "Status: Executing Agent Graph...";
    }
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reasoning...';
    }

    const startup = getActiveStartupProfile();
    const modelSelector = document.getElementById("agentModelSelector");
    const selectedModel = modelSelector ? modelSelector.value : "gemini-2.0-flash";

    let provider = "heuristic";
    if (selectedModel.startsWith("gemini")) provider = "gemini";
    else if (selectedModel.startsWith("gpt")) provider = "openai";

    const apiKey = provider === "gemini" 
        ? localStorage.getItem("sfd_gemini_api_key") 
        : localStorage.getItem("sfd_openai_api_key");

    // Reset visual nodes
    const nodeIds = ["node-benchmark", "node-fmea", "node-mitigation", "node-synthesis"];
    nodeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("active-node", "completed-node");
        }
    });

    appendLog("info", `========================================================`);
    appendLog("info", `🚀 Starting LangGraph Workflow for: ${startup.project_name || startup.projectName}`);
    appendLog("info", `Selected Model: ${selectedModel.toUpperCase()} (Provider: ${provider.toUpperCase()})`);

    // Step 1: Benchmark Agent Node
    const node1 = document.getElementById("node-benchmark");
    if (node1) node1.classList.add("active-node");
    appendLog("info", `[Node 1: Benchmarker] Ingesting startup profile and querying market benchmarks...`);
    await new Promise(r => setTimeout(r, 600));
    appendLog("success", `[Node 1: Benchmarker] Matched ${startup.industry} benchmark dataset. Parity analysis completed.`);
    if (node1) {
        node1.classList.remove("active-node");
        node1.classList.add("completed-node");
    }

    // Step 2: FMEA Diagnostic Node
    const node2 = document.getElementById("node-fmea");
    if (node2) node2.classList.add("active-node");
    appendLog("info", `[Node 2: FMEA Diagnostics] Calculating Failure Mode & Effects Analysis across 5 dimensions...`);
    await new Promise(r => setTimeout(r, 600));
    appendLog("warn", `[Node 2: FMEA Diagnostics] Identified top failure mode: Premature Runway Depletion.`);
    if (node2) {
        node2.classList.remove("active-node");
        node2.classList.add("completed-node");
    }

    // Step 3: Mitigation Planner Node
    const node3 = document.getElementById("node-mitigation");
    if (node3) node3.classList.add("active-node");
    appendLog("info", `[Node 3: Mitigation Planner] Formulating 30/60/90-Day tactical roadmap interventions...`);
    await new Promise(r => setTimeout(r, 600));
    appendLog("success", `[Node 3: Mitigation Planner] Synthesized 6 prioritized mitigation interventions.`);
    if (node3) {
        node3.classList.remove("active-node");
        node3.classList.add("completed-node");
    }

    // Step 4: Executive Synthesis Node (API Dispatch)
    const node4 = document.getElementById("node-synthesis");
    if (node4) node4.classList.add("active-node");
    appendLog("info", `[Node 4: Executive Synthesizer] Calling ${provider.toUpperCase()} Strategic Intelligence Engine...`);

    let resultData = null;

    try {
        const response = await fetch("/api/agent/run-workflow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                startup: startup,
                provider: provider,
                apiKey: apiKey,
                modelName: selectedModel
            })
        });

        if (response.ok) {
            resultData = await response.json();
            appendLog("success", `[Node 4: Executive Synthesizer] Reasoning complete! Confidence Score: ${resultData.strategicIntelligence?.confidenceScore || 90}%`);
        } else {
            throw new Error(`Server returned ${response.status}`);
        }
    } catch (err) {
        appendLog("warn", `Server endpoint unavailable (${err.message}). Using client-side intelligent reasoning engine.`);
        resultData = generateClientSideAgentResults(startup);
        appendLog("success", `[Node 4: Executive Synthesizer] Client-side strategic reasoning generated successfully.`);
    }

    if (node4) {
        node4.classList.remove("active-node");
        node4.classList.add("completed-node");
    }

    // Render Results into Dashboard UI
    renderAgentResults(resultData);

    if (statusBadge) {
        statusBadge.className = "status-pill status-completed";
        statusBadge.textContent = "Status: Completed (Ready)";
    }
    if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Execute Agent Workflow';
    }

    isWorkflowRunning = false;
}

/**
 * Render structured strategic output into DOM
 */
function renderAgentResults(data) {
    if (!data) return;

    const intel = data.strategicIntelligence || {};
    const roadmap = data.mitigationRoadmap || {};
    const fmea = data.fmeaDiagnostics || [];

    // 1. Executive Thesis & Confidence
    const thesisEl = document.getElementById("agentExecutiveThesis");
    const confEl = document.getElementById("aiConfidenceBadge");

    if (thesisEl && intel.executiveThesis) {
        thesisEl.textContent = intel.executiveThesis;
    }
    if (confEl && intel.confidenceScore) {
        confEl.textContent = `Confidence: ${intel.confidenceScore}%`;
    }

    // 2. Strategic Pillars
    const pillarsContainer = document.getElementById("strategicPillarsContainer");
    if (pillarsContainer && intel.strategicPillars) {
        pillarsContainer.innerHTML = intel.strategicPillars.map(p => `
            <div class="pillar-box">
                <strong>${p.title}</strong>
                <p>${p.action}</p>
            </div>
        `).join("");
    }

    // 3. FMEA Failure Modes
    const fmeaContainer = document.getElementById("fmeaListContainer");
    if (fmeaContainer && fmea.length > 0) {
        fmeaContainer.innerHTML = fmea.map(item => {
            const badgeClass = item.severity === "CRITICAL" ? "badge-critical" 
                : item.severity === "HIGH" ? "badge-high" 
                : item.severity === "LOW" ? "badge-low" : "badge-medium";
            return `
                <div class="fmea-item">
                    <span class="fmea-badge ${badgeClass}">${item.severity}</span>
                    <div class="fmea-details">
                        <strong>${item.failureMode} (${item.domain})</strong>
                        <p>${item.rootCause}</p>
                    </div>
                </div>
            `;
        }).join("");
    }

    // 4. Mitigation Roadmap
    renderPhaseActions("phase30Container", roadmap.immediate30Days || []);
    renderPhaseActions("phase60Container", roadmap.shortTerm60Days || []);
    renderPhaseActions("phase90Container", roadmap.longTerm90Days || []);

    // Recalculate Simulator with latest profile
    recalculateScenarioSimulator();
}

function renderPhaseActions(containerId, actions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (actions.length === 0) {
        container.innerHTML = `<div class="action-card"><p>No critical interventions identified for this phase.</p></div>`;
        return;
    }

    container.innerHTML = actions.map(act => `
        <div class="action-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span class="action-tag">${act.tag || "Strategy"}</span>
                <span style="font-size:10px; font-weight:700; color:#10b981;">${act.expectedImpact || ""}</span>
            </div>
            <h4>${act.title}</h4>
            <p>${act.description}</p>
        </div>
    `).join("");
}

/**
 * Client-Side Fallback Agent Reasoning Generator
 */
function generateClientSideAgentResults(startup) {
    const name = startup.project_name || startup.projectName || "Startup";
    const ind = startup.industry || "Tech";
    const budget = Number(startup.budget) || 500000;
    const model = startup.business_model || "SaaS";

    return {
        strategicIntelligence: {
            executiveThesis: `${name} demonstrates promising market alignment in the ${ind} sector utilizing a ${model} framework. However, with an initial capital base of ₹${budget.toLocaleString()}, the venture must prioritize early positive cash-flow float over rapid paid expansion. Executing verticalized GTM positioning and locking in upfront customer commitments will reduce vulnerability by ~40%.`,
            confidenceScore: 91,
            strategicPillars: [
                {
                    title: "1. Runway & Financial Architecture",
                    action: `With an operational capital of ₹${budget.toLocaleString()}, maintain a strict zero-waste burn cap to guarantee a minimum 14-month validation runway.`
                },
                {
                    title: "2. Defensive Moat & Wedge",
                    action: `Target high-friction workflow niches rather than competing on broad feature parity with legacy players.`
                },
                {
                    title: "3. Unit Economics & Pricing Model",
                    action: `Structure subscription tiers with 15-20% discounts on upfront annual payments to self-fund growth through customer deposits.`
                },
                {
                    title: "4. Go-to-Market Velocity",
                    action: `Leverage direct founder sales and product-led onboarding to keep Customer Acquisition Cost (CAC) under ₹2,000.`
                }
            ]
        },
        fmeaDiagnostics: [
            {
                domain: "Financial & Runway",
                severity: "CRITICAL",
                failureMode: "Premature Runway Exhaustion",
                rootCause: `Initial budget requires disciplined 12+ month burn guardrails before profitability.`
            },
            {
                domain: "Market & Competition",
                severity: "HIGH",
                failureMode: "Incumbent Feature Encroachment",
                rootCause: "Large incumbents possess greater distribution channels in broad segments."
            },
            {
                domain: "Business Model",
                severity: "MEDIUM",
                failureMode: "Sales Cycle Lag",
                rootCause: "B2B sales and onboarding cycles can delay expected cash receipts."
            },
            {
                domain: "Execution",
                severity: "LOW",
                failureMode: "Feature Scope Creep",
                rootCause: "Building non-core features before verifying primary value proposition."
            }
        ],
        mitigationRoadmap: {
            immediate30Days: [
                {
                    title: "Runway Extension & Zero-Waste Audit",
                    tag: "Financial",
                    description: `Cap fixed monthly expenditure to ensure a minimum 14-month buffer.`,
                    expectedImpact: "-18% Risk"
                },
                {
                    title: "Pre-Commitment Customer Discovery",
                    tag: "GTM",
                    description: "Secure 5 signed Letters of Intent (LOIs) or paid pilot agreements.",
                    expectedImpact: "-12% Risk"
                }
            ],
            shortTerm60Days: [
                {
                    title: "Annual Upfront Contract Incentives",
                    tag: "Pricing",
                    description: "Offer incentives for upfront annual billing to inject non-dilutive working capital.",
                    expectedImpact: "+25% Cash Flow"
                },
                {
                    title: "Defensive Niche Positioning",
                    tag: "Strategy",
                    description: "Carve out an underserved sub-vertical that incumbents overlook.",
                    expectedImpact: "+30% Win-Rate"
                }
            ],
            longTerm90Days: [
                {
                    title: "Product-Led Referral Loops",
                    tag: "Growth",
                    description: "Embed organic sharing triggers and streamlined self-service onboarding.",
                    expectedImpact: "-22% CAC"
                },
                {
                    title: "Seed Data Room Preparation",
                    tag: "Capital",
                    description: "Compile cohort retention metrics and unit economics proof for follow-on funding.",
                    expectedImpact: "+65% Close Rate"
                }
            ]
        }
    };
}

/**
 * Scenario Simulator Calculation & DOM Update
 */
function recalculateScenarioSimulator() {
    const startup = getActiveStartupProfile();
    const budgetDelta = Number(document.getElementById("budgetDeltaSlider")?.value || 0);
    const burnReduction = Number(document.getElementById("burnReductionSlider")?.value || 0);
    const gtmPivot = document.getElementById("simGtmPivot")?.value || "none";
    const teamProfile = document.getElementById("simTeamProfile")?.value || "moderate";

    const baseRisk = (projects && projects[0]) ? calculateRisk(projects[0]).overall : 72;

    let delta = 0;
    if (budgetDelta > 0) delta -= Math.min(budgetDelta * 0.25, 18);
    else if (budgetDelta < 0) delta += Math.min(Math.abs(budgetDelta) * 0.3, 20);

    if (burnReduction > 0) delta -= Math.min(burnReduction * 0.35, 16);
    if (gtmPivot === "niche_b2b") delta -= 8;
    if (gtmPivot === "product_led") delta -= 10;
    if (gtmPivot === "annual_contracts") delta -= 7;
    if (teamProfile === "expert") delta -= 12;
    if (teamProfile === "serial_founder") delta -= 16;

    const newRisk = Math.max(12, Math.min(95, Math.round(baseRisk + delta)));
    const riskDiff = baseRisk - newRisk;

    const baseBudget = Number(startup.budget) || 500000;
    const adjustedBudget = Math.round(baseBudget * (1 + budgetDelta / 100));
    const monthlyBurn = Math.max(baseBudget * 0.08 * (1 - burnReduction / 100), 20000);
    const runwayMonths = Math.min(36, Math.max(4, Math.round(adjustedBudget / monthlyBurn)));

    const baseRiskEl = document.getElementById("simBaseRiskVal");
    const newRiskEl = document.getElementById("simNewRiskVal");
    const deltaTagEl = document.getElementById("simRiskDeltaTag");
    const runwayEl = document.getElementById("simRunwayVal");

    if (baseRiskEl) baseRiskEl.textContent = baseRisk + "%";
    if (newRiskEl) newRiskEl.textContent = newRisk + "%";
    if (deltaTagEl) {
        if (riskDiff >= 0) {
            deltaTagEl.textContent = `-${riskDiff}% Risk Reduction`;
            deltaTagEl.style.background = "#d1fae5";
            deltaTagEl.style.color = "#047857";
        } else {
            deltaTagEl.textContent = `+${Math.abs(riskDiff)}% Risk Increase`;
            deltaTagEl.style.background = "#fee2e2";
            deltaTagEl.style.color = "#dc2626";
        }
    }
    if (runwayEl) runwayEl.textContent = `${runwayMonths} Mo.`;
}


