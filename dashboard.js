



// ==========================================
// Startup Risk Intelligence Dashboard
// ==========================================
let industryTrendChart;
let failureChart;
let investmentChart;
let fundingTrendChart;
let competitorChart;
let revenueChart;
let featureRadarChart;
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

    loadDashboard();
    

    const form = document.getElementById("submissionForm");

    if(form){

        form.addEventListener("submit", Submitproj);

    }

};

// ==========================================
// LOAD DATA FROM SERVER
// ==========================================

async function loadDashboard(){

    try{
        const jsonResponse = await fetch("data/Industry_data.json");

        industryDataset = await jsonResponse.json();

        const response =
            await fetch("http://localhost:3000/projects");

        projects =
            await response.json();

        // updateKPIs();

        // updateAssessment();

        // createCharts();

        // loadTable();

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

function loadIndustryCharts(){

    if(projects.length==0)
        return;

    const industry = projects[0].industry;

    const data = industryDataset[industry];

    if(!data){

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

function calculateRisk(project){

    const scores = {};

    // -----------------------
    // Safe values
    // -----------------------

    const budget =
        Number(project.budget || 0);

    const industry =
        project.industry || "";

    const model =
        project.business_model || project.businessModel || "";

    const description =
        project.description || "";

    const words =
        description.trim() === ""
        ? 0
        : description.trim().split(/\s+/).length;

    // ======================================
    // FINANCIAL RISK
    // ======================================

    if(budget < 100000){

        scores.financial = 85;

    }

    else if(budget < 500000){

        scores.financial = 60;

    }

    else{

        scores.financial = 25;

    }

    // ======================================
    // MARKET RISK
    // ======================================

    const riskyIndustries = [

        "Healthcare",
        "Real Estate",
        "Travel",
        "Food",
        "Construction",
        "Agriculture"

    ];

    scores.market =
        riskyIndustries.includes(industry)
        ? 80
        : 35;

    // ======================================
    // BUSINESS MODEL RISK
    // ======================================

    switch(model){

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

    // ======================================
    // EXECUTION RISK
    // ======================================

    if(words > 80){

        scores.execution = 20;

    }

    else if(words > 40){

        scores.execution = 40;

    }

    else{

        scores.execution = 70;

    }

    // ======================================
    // INNOVATION RISK
    // ======================================

    if(description.length > 250){

        scores.innovation = 20;

    }

    else if(description.length > 120){

        scores.innovation = 40;

    }

    else{

        scores.innovation = 70;

    }

    // ======================================
    // OVERALL RISK
    // ======================================

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

function calculateFeatureScores(project){

    let innovation = 50;
    let scalability = 50;
    let finance = 50;
    let market = 50;
    let execution = 50;

    // Innovation
    const words = project.description.trim().split(/\s+/).length;

    if(words > 80)
        innovation = 90;
    else if(words > 40)
        innovation = 75;
    else
        innovation = 55;

    // Scalability
    switch(project.business_model){

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

    // Financial Strength
    const budget = Number(project.budget);

    if(budget >= 1000000)
        finance = 95;
    else if(budget >= 500000)
        finance = 80;
    else if(budget >= 100000)
        finance = 65;
    else
        finance = 45;

    // Market Potential
    const goodIndustries = [
        "AI",
        "FinTech",
        "Healthcare",
        "Cybersecurity",
        "SaaS"
    ];

    market = goodIndustries.includes(project.industry)
        ? 90
        : 70;

    // Execution
    const risk = calculateRisk(project);

    execution = 100 - risk.overall;

    return {

        innovation,
        scalability,
        finance,
        market,
        execution

    };

}


// ==========================================
// KPI CARDS
// ==========================================

function updateKPIs(){

    if(projects.length === 0)
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

    const overallRisk =
        Math.round(totalOverall / projects.length);

    const successProbability =
        100 - overallRisk;

    const financialHealth =
        100 - Math.round(totalFinancial / projects.length);

    const marketRisk =
        Math.round(totalMarket / projects.length);

    const cards =
        document.querySelectorAll(".card");

    if(cards.length >= 4){

        // -------------------------
        // Overall Risk
        // -------------------------

        cards[0].querySelector("h2").textContent =
            overallRisk + "%";

        cards[0].querySelector("p").textContent =
            overallRisk > 70
            ? "High Risk"
            : overallRisk > 40
            ? "Medium Risk"
            : "Low Risk";

        // -------------------------
        // Success Probability
        // -------------------------

        cards[1].querySelector("h2").textContent =
            successProbability + "%";

        cards[1].querySelector("p").textContent =
            successProbability > 70
            ? "Excellent"
            : successProbability > 50
            ? "Moderate"
            : "Needs Improvement";

        // -------------------------
        // Financial Health
        // -------------------------

        cards[2].querySelector("h2").textContent =
            financialHealth + "%";

        cards[2].querySelector("p").textContent =
            financialHealth > 70
            ? "Stable"
            : financialHealth > 40
            ? "Average"
            : "Weak";

        // -------------------------
        // Market Risk
        // -------------------------

        cards[3].querySelector("h2").textContent =
            marketRisk + "%";

        cards[3].querySelector("p").textContent =
            marketRisk > 70
            ? "Competitive"
            : marketRisk > 40
            ? "Moderate"
            : "Favourable";

    }

}

// ==========================================
// AI ASSESSMENT PANEL
// ==========================================

function updateAssessment(){

    if(projects.length === 0)
        return;

    const project = projects[0];

    const scores =
        calculateRisk(project);

    const overall =
        scores.overall;

    let level = "Low";

    if(overall > 70)
        level = "High";

    else if(overall > 40)
        level = "Medium";

    // -------------------------
    // Dynamic Findings
    // -------------------------

    const findings = [];

    if(scores.financial > 70){

        findings.push(
            "Funding is below the recommended level."
        );

    }

    else{

        findings.push(
            "Current funding is sufficient."
        );

    }

    if(scores.market > 70){

        findings.push(
            "Industry competition is very high."
        );

    }

    else{

        findings.push(
            "Market conditions are relatively favourable."
        );

    }

    if(scores.business > 60){

        findings.push(
            "Business model requires further validation."
        );

    }

    else{

        findings.push(
            "Business model appears scalable."
        );

    }

    if(scores.execution > 60){

        findings.push(
            "Execution strategy should be strengthened."
        );

    }

    else{

        findings.push(
            "Execution planning looks promising."
        );

    }

    if(scores.innovation > 60){

        findings.push(
            "Product differentiation could be improved."
        );

    }

    else{

        findings.push(
            "Innovation level is above average."
        );

    }

    // -------------------------
    // Report
    // -------------------------

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

        industries[project.industry] =
            (industries[project.industry] || 0) + 1;

        models[project.business_model] =
            (models[project.business_model] || 0) + 1;

        budgets[project.industry] =
            (budgets[project.industry] || 0) +
            Number(project.budget);

    });

    // ======================================
    // Industry Distribution
    // ======================================

    // industryChart = new Chart(

    //     document.getElementById("industryChart"),

    //     {

    //         type: "bar",

    //         data: {

    //             labels: Object.keys(industries),

    //             datasets: [{

    //                 label: "Projects",

    //                 data: Object.values(industries),

    //                 borderWidth: 2

    //             }]

    //         },

    //         options: {

    //             responsive: true,

    //             maintainAspectRatio: false

    //         }

    //     }

    // );

    industryChart = new Chart(
    document.getElementById("industryChart"),
    {
        type: "bar",

        data: {
            labels: Object.keys(industries),

            datasets: [{
                label: "Startups",
                data: Object.values(industries),
                borderRadius: 12,
                borderWidth: 0
            }]
        },

        options: {

            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false,

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{
                x:{
                    grid:{
                        display:false
                    }
                },

                y:{
                    grid:{
                        display:false
                    }
                }
            }

        },
        animation:{

duration:1800,

easing:"easeOutQuart"

}


    }
);

    // ======================================
    // Business Model Distribution
    // ======================================

    businessChart = new Chart(

        document.getElementById("businessChart"),

        {

            type: "doughnut",
            cutout: "65%",

            plugins:{
             legend:{
             position:"bottom"
             }
            },
            animation:{

duration:1800,

easing:"easeOutQuart"

},

            data: {

                labels: Object.keys(models),

                datasets: [{

                    data: Object.values(models)

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }


        }

    );

    // ======================================
    // Budget Analysis
    // ======================================

    budgetChart = new Chart(

        document.getElementById("budgetChart"),

        {

            type: "bar",

            data: {

                labels: Object.keys(budgets),

                datasets: [{

                    label: "Budget",

                    data: Object.values(budgets)

                }],
                plugins:{
    legend:{
        display:false
    }
},



            },
            
            animation:{

duration:1800,

easing:"easeOutQuart"

},

            options: {

                // responsive: true,

                // maintainAspectRatio: false,

                // indexAxis: "y"

                responsive: true,

    scales: {

        x: {
            grid: {
                display: false,
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false
            },

            border: {
                display: false
            }
        },

        y: {
            grid: {
                display: false,
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false
            },

            border: {
                display: false
            }
        }

    }

            },
            


        }

    );

    // ======================================
    // Budget Trend
    // ======================================

    growthChart = new Chart(

        document.getElementById("growthChart"),

        {
            

            type: "line",

            data: {
                

                labels: projects.map(
                    (_, index) => "Startup " + (index + 1)
                ),

                datasets: [{

                    label: "Budget",

                    data: projects.map(project =>
                        Number(project.budget)
                    ),


                    tension: 0.35,

                    // fill: false
                    fill:true,

tension:0.45,

pointRadius:5,

pointHoverRadius:8

                }]

            },

            options: {

                // responsive: true,

                // maintainAspectRatio: false
                responsive: true,

    scales: {

        x: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        },

        y: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        }

    }

            },
            animation:{

duration:1800,

easing:"easeOutQuart"

}

        }

    );

    // ======================================
    // AI Risk Radar Chart
    // ======================================

    const latestProject = projects[0];

    if (

        latestProject &&

        document.getElementById("riskRadar")

    ) {

        const scores =
            calculateRisk(latestProject);

        radarChart = new Chart(

            document.getElementById("riskRadar"),

            {
                

                type: "radar",

                data: {

                    labels: [

                        "Financial",

                        "Market",

                        "Business",

                        "Execution",

                        "Innovation"

                    ],

                    datasets:[{

label:"Risk Profile",

data:[

scores.financial,
scores.market,
scores.business,
scores.execution,
scores.innovation

],

borderWidth:3,

pointRadius:5,

fill:true

}],
scales:{

r:{

min:0,

max:100,

ticks:{
stepSize:20
}

}

}
                },

                options: {

                    // responsive: true,

                    // maintainAspectRatio: false,

                    // scales: {

                    //     r: {

                    //         min: 0,

                    //         max: 100

                    //     }

                    // }

                    scales:{

        r:{

            grid:{
                display:false
            },

            angleLines:{
                display:false
            },

            pointLabels:{
                font:{
                    size:13
                }
            },

            ticks:{
                display:false
            }

        }

    }

                },
                animation:{

duration:1800,

easing:"easeOutQuart"

}

            }

        );

    }

}

// ==========================================
// PROJECT TABLE
// ==========================================

function loadTable() {

    const table =
        document.getElementById("projectTable");

    if (!table)
        return;

    table.innerHTML = "";

    projects.forEach(project => {

        const scores =
            calculateRisk(project);

        const risk =
            scores.overall;

        let riskLevel = "Low";

        if (risk > 70)
            riskLevel = "High";

        else if (risk > 40)
            riskLevel = "Medium";

        table.innerHTML += `

        <tr>

            <td>

                ${project.project_name}

            </td>

            <td>

                ${project.industry}

            </td>

            <td>

                ₹${Number(project.budget).toLocaleString()}

            </td>

            <td>

                ${riskLevel}

            </td>

            <td>

                ${100 - risk}% Success

            </td>

        </tr>

        `;

    });

}

// ==========================================
// AI RECOMMENDATIONS
// ==========================================

function updateRecommendations(){

    if(projects.length === 0)
        return;

    const project = projects[0];

    const scores = calculateRisk(project);

    const recommendations = [];

    // Financial

    if(scores.financial >= 70){

        recommendations.push({
            icon:"💰",
            text:"Raise additional funding to extend runway."
        });

    }
    else{

        recommendations.push({
            icon:"✅",
            text:"Current funding level appears healthy."
        });

    }

    // Market

    if(scores.market >= 70){

        recommendations.push({
            icon:"📊",
            text:"Conduct deeper market validation before scaling."
        });

    }
    else{

        recommendations.push({
            icon:"📈",
            text:"Market conditions appear favourable."
        });

    }

    // Business Model

    if(scores.business >= 60){

        recommendations.push({
            icon:"🏢",
            text:"Refine pricing strategy and business model."
        });

    }
    else{

        recommendations.push({
            icon:"🚀",
            text:"Business model demonstrates good scalability."
        });

    }

    // Execution

    if(scores.execution >= 60){

        recommendations.push({
            icon:"⚙️",
            text:"Improve execution roadmap and milestone planning."
        });

    }
    else{

        recommendations.push({
            icon:"🎯",
            text:"Execution strategy is well defined."
        });

    }

    // Innovation

    if(scores.innovation >= 60){

        recommendations.push({
            icon:"💡",
            text:"Increase product differentiation and innovation."
        });

    }
    else{

        recommendations.push({
            icon:"⭐",
            text:"Innovation score is above average."
        });

    }

    const panel =
        document.querySelector(".recommendations");

    if(!panel) return;

    panel.innerHTML = `

        <h2>

            <i class="fa-solid fa-lightbulb"></i>

            AI Recommendations

        </h2>

        <hr>

        ${recommendations.map(item=>`

            <div class="tip">

                <span style="font-size:20px;">
                    ${item.icon}
                </span>

                ${item.text}

            </div>

        `).join("")}

    `;

}

// ==========================================
// SUBMIT PROJECT
// ==========================================

async function Submitproj(e){

    e.preventDefault();

    const project = {

        projectName:
            document.getElementById("projectName").value,

        industry:
            document.getElementById("industry").value,

        businessModel:
            document.getElementById("businessModel").value,

        targetMarket:
            document.getElementById("targetMarket").value,

        budget:
            document.getElementById("budget").value,

        description:
            document.getElementById("description").value

    };

    try{

        const response =
            await fetch(
                "http://localhost:3000/projects",
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify(project)

                }
            );

        const result =
            await response.json();

        if(!response.ok){

            alert(result.message);

            return;

        }

        alert("Startup analysed successfully!");

        document
            .getElementById("submissionForm")
            .reset();

        await loadDashboard();

    }

    catch(err){

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

// Dashboard
document.getElementById("dashboardBtn").addEventListener("click", () => {

    showPage("dashboardPage", "dashboardBtn");

});

// Assessment Report
document.getElementById("reportBtn").addEventListener("click", () => {

    showPage("reportPage", "reportBtn");

});

// Market Trends
document.getElementById("marketBtn").addEventListener("click", () => {

    showPage("marketPage", "marketBtn");

});

// Competitor Analysis
document.getElementById("competitorBtn").addEventListener("click", () => {

    showPage("competitorPage", "competitorBtn");

});

// Dataset
document.getElementById("datasetBtn").addEventListener("click", () => {

    showPage("datasetPage", "datasetBtn");

});

// Show Dashboard by default
showPage("dashboardPage", "dashboardBtn");


function loadIndustryData(){

    if(projects.length==0) return;

    const latestIndustry = projects[0].industry;

    const industryInfo = industryDataset[latestIndustry];

    if(!industryInfo){

        console.log("Industry not found");

        return;

    }

    function createIndustryTrendChart(data){

    if(industryTrendChart){
        industryTrendChart.destroy();
    }

    industryTrendChart = new Chart(

        document.getElementById("industryTrendChart"),

        {

            type:"line",

            data:{

                labels:[
                    "2020",
                    "2021",
                    "2022",
                    "2023",
                    "2024",
                    "2025"
                ],

                datasets:[{

                    label:"Industry Growth (%)",

                    data:data.marketGrowth,

                    borderColor:"#3B82F6",

                    backgroundColor:"rgba(59,130,246,.15)",

                    borderWidth:3,

                    pointRadius:5,

                    pointHoverRadius:7,

                    fill:true,

                    tension:.45

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{
                        display:false
                    }

                },

                scales:{

                    x:{
                        grid:{
                            display:false
                        }
                    },

                    y:{

                        beginAtZero:true,

                        grid:{
                            color:"rgba(255,255,255,.05)"
                        }

                    }

                }

            }

        }

    );

}

    createIndustryTrendChart(industryInfo);

    function createFundingTrendChart(data){

    if(fundingTrendChart){

        fundingTrendChart.destroy();

    }

    fundingTrendChart = new Chart(

        document.getElementById("fundingTrendChart"),

        {

            type:"bar",

            data:{

                labels:[
                    "2020",
                    "2021",
                    "2022",
                    "2023",
                    "2024",
                    "2025"
                ],

                datasets:[{

                    label:"Funding (₹ Crore)",

                    data:data.funding,

                    borderRadius:10

                }]

            },

            options:{

                plugins:{

                    legend:{
                        display:false
                    }

                },
                 responsive: true,

    scales: {

        x: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        },

        y: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        }

    }
                

            }

        }

    );

}
createFundingTrendChart(industryInfo);
function createFailureChart(data){

    if(failureChart){

        failureChart.destroy();

    }

    failureChart = new Chart(

        document.getElementById("failureTrendChart"),

        {

            type:"doughnut",

            data:{

                labels:[

                    "Failure",

                    "Success"

                ],

                datasets:[{

                    data:[

                        data.failureRate,

                        100-data.failureRate

                    ]

                }]

            },

            options:{

                cutout:"70%"

            }

        }

    );

}

createFailureChart(industryInfo);

function createInvestmentChart(data){

    if(investmentChart){

        investmentChart.destroy();

    }

    investmentChart = new Chart(

        document.getElementById("investmentChart"),

        {

            type:"pie",

            data:{

                labels:[

                    "Seed",

                    "Angel",

                    "Series A",

                    "Series B",

                    "Others"

                ],

                datasets:[{

                    data:data.investmentDistribution

                }]

            },

            options:{

                plugins:{

                    legend:{

                        position:"bottom"

                    }

                }

            }

        }

    );

}
createInvestmentChart(industryInfo);


function createCompetitorChart(data){

    if(competitorChart){

        competitorChart.destroy();

    }

    competitorChart = new Chart(

        document.getElementById("marketShareChart"),

        {

            type:"pie",

            data:{

                labels:data.competitors.map(c=>c.name),

                datasets:[{

                    data:data.competitors.map(c=>c.marketShare)

                }]

            }

        }

    );

}
createCompetitorChart(industryInfo);

function createRevenueChart(data){

    if(revenueChart){

        revenueChart.destroy();

    }

    revenueChart = new Chart(

        document.getElementById("revenueChart"),

        {

            type:"bar",

            data:{

                labels:data.competitors.map(c=>c.name),

                datasets:[{

                    label:"Revenue (₹ Crore)",

                    data:data.competitors.map(c=>c.revenue),

                    borderRadius:8

                }]

            },
             options:{

                plugins:{

                    legend:{
                        display:true
                    }

                },
                 responsive: true,

    scales: {

        x: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        },

        y: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        }

    }
                

            }

        }

    );

}
createRevenueChart(industryInfo);

function createFundingComparisonChart(data){

    if(competitorFundingChart){

        competitorFundingChart.destroy();

    }

    competitorFundingChart = new Chart(

        document.getElementById("competitorFundingChart"),

        {

            type:"bar",

            data:{

                labels:data.competitors.map(c=>c.name),

                datasets:[{

                    label:"Funding (₹ Crore)",

                    data:data.competitors.map(c=>c.funding),

                    borderRadius:8

                }]

            },
             options:{

                plugins:{

                    legend:{
                        display:true
                    }

                },
                 responsive: true,

    scales: {

        x: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        },

        y: {

            grid: {
                display: false
            },

            border: {
                display: false
            }

        }

    }
                

            }


        }

    );

}
createFundingComparisonChart(industryInfo);

let featureRadarChart;

function createFeatureRadar(project, industryInfo){

    if(featureRadarChart)
        featureRadarChart.destroy();

    const startup = calculateFeatureScores(project);

    // Industry leader
    const competitor = industryInfo.competitors[0];

    featureRadarChart = new Chart(

        document.getElementById("featureRadarChart"),

        {

            type:"radar",

            data:{

                labels:[

                    "Innovation",

                    "Scalability",

                    "Finance",

                    "Market",

                    "Execution"

                ],

                datasets:[

                    {

                        label:"Your Startup",

                        data:[

                            startup.innovation,

                            startup.scalability,

                            startup.finance,

                            startup.market,

                            startup.execution

                        ],

                        borderWidth:3,

                        fill:true

                    },

                    {

                        label:competitor.name,

                        data:[

                            90,

                            90,

                            95,

                            90,

                            88

                        ],

                        borderWidth:3,

                        fill:true

                    }

                ]

            },

            // options:{

            //     responsive:true,

            //     plugins:{

            //         legend:{

            //             position:"bottom"

            //         }

            //     },

            //     scales:{

            //         r:{

            //             beginAtZero:true,

            //             max:100

            //         }

            //     }

            // }



options:{

    responsive:true,

    plugins:{

        legend:{

            position:"bottom"

        }

    },
  

    scales:{

        r:{

            beginAtZero:true,

            max:100,

            // Remove circular grid
            grid:{
                display:false
            },

            // Remove spokes (lines from center)
            angleLines:{
                display:false
            },

            // Hide the outer circular border
            border:{
                display:false
            },

            // Keep axis labels visible
            pointLabels:{
                display:true,
                font:{
                    size:13,
                    weight:"bold"
                }
            },

            // Hide the tick labels (0,20,40...)
            ticks:{
                display:false
            }

        }

        

    }

}




        }

    );

}
createFeatureRadar(projects[0], industryInfo);

}