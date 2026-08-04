
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
let industryData = {};
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

window.onload = () => {

    // loadDashboard();

    // const form = document.getElementById("submissionForm");

    // if (form) {
    //     form.addEventListener("submit", Submitproj);
    // }
    loadIndustryData();

loadDashboard();

document
.getElementById("submissionForm")
.addEventListener("submit", Submitproj);

};


// ==========================================
// LOAD DATA FROM SERVER
// ==========================================
async function loadIndustryData() {

    try {

        const response = await fetch("data/Industry_data.json");

        industryData = await response.json();

        populateIndustryDropdown();

    }

    catch(err){

        console.error(err);

    }

}
function populateIndustryDropdown(){

    const dropdown =
        document.getElementById("industry");

    dropdown.innerHTML =
        '<option value="">Select Industry</option>';

    Object.keys(industryData).forEach(industry=>{

        const option =
            document.createElement("option");

        option.value = industry;

        option.textContent =
            industry.charAt(0).toUpperCase()
            + industry.slice(1);

        dropdown.appendChild(option);

    });

}
async function loadDashboard() {

    try {
        const jsonResponse = await fetch("public/Industry_data.json");
        industryDataset = await jsonResponse.json();

        const response = await fetch("https://smart-failure-detection-owp3.onrender.com/projects");
        projects = await response.json();

        updateKPIs();
        updateAssessment();
        updateRecommendations();
        createCharts();
        loadTable();
        loadIndustryData();

    } catch (err) {
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

function updateAssessment() {

    if (projects.length === 0)
        return;

    const project = projects[0];
    const scores = calculateRisk(project);
    const overall = scores.overall;

    let level = "Low";
    if (overall > 70) level = "High";
    else if (overall > 40) level = "Medium";

    const findings = [];

    findings.push(scores.financial > 70
        ? "Funding is below the recommended level."
        : "Current funding is sufficient.");

    findings.push(scores.market > 70
        ? "Industry competition is very high."
        : "Market conditions are relatively favourable.");

    findings.push(scores.business > 60
        ? "Business model requires further validation."
        : "Business model appears scalable.");

    findings.push(scores.execution > 60
        ? "Execution strategy should be strengthened."
        : "Execution planning looks promising.");

    findings.push(scores.innovation > 60
        ? "Product differentiation could be improved."
        : "Innovation level is above average.");

    const report = document.querySelector(".assessment");

    report.innerHTML = `
        <h2><i class="fa-solid fa-file-lines"></i> AI Assessment Report</h2>
        <hr>
        <p><strong>Startup:</strong> ${project.project_name}</p>
        <p><strong>Industry:</strong> ${project.industry}</p>
        <p><strong>Business Model:</strong> ${project.business_model}</p>
        <p><strong>Budget:</strong> ₹${Number(project.budget).toLocaleString()}</p>
        <p><strong>Overall Risk:</strong> ${overall}% (${level})</p>
        <br>
        <h3>Risk Breakdown</h3>
        <ul>
            <li>Financial Risk : ${scores.financial}%</li>
            <li>Market Risk : ${scores.market}%</li>
            <li>Business Model Risk : ${scores.business}%</li>
            <li>Execution Risk : ${scores.execution}%</li>
            <li>Innovation Risk : ${scores.innovation}%</li>
        </ul>
        <br>
        <h3>AI Findings</h3>
        <ul>
            ${findings.map(item => `<li>${item}</li>`).join("")}
        </ul>
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

    const project = {
        projectName: document.getElementById("projectName").value,
        industry: document.getElementById("industry").value,
        businessModel: document.getElementById("businessModel").value,
        targetMarket: document.getElementById("targetMarket").value,
        budget: document.getElementById("budget").value,
        description: document.getElementById("description").value
    };

    try {

        const response = await fetch("https://smart-failure-detection-owp3.onrender.com/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        alert("Startup analysed successfully!");
        document.getElementById("submissionForm").reset();
        await loadDashboard();

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server.");
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
    document.getElementById("datasetPage").style.display = "none";
}

function removeActive() {
    document.querySelectorAll(".sidebar ul li").forEach(item => {
        item.classList.remove("active");
    });
}

function showPage(pageId, buttonId) {
    hideAllPages();
    document.getElementById(pageId).style.display = "block";
    removeActive();
    document.getElementById(buttonId).classList.add("active");
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

document.getElementById("datasetBtn").addEventListener("click", () => {
    showPage("datasetPage", "datasetBtn");
});

showPage("dashboardPage", "dashboardBtn");

function loadIndustryData() {

    if (projects.length == 0) return;

    const latestIndustry = projects[0].industry;
    const industryInfo = industryDataset[latestIndustry];

    if (!industryInfo) {
        console.log("Industry not found");
        return;
    }

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

