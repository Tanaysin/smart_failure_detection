require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { 
    LangGraphAgentWorkflow, 
    simulateWhatIfScenario, 
    generateAndSaveIndustryData,
    generateFeasibilityAndSWOT,
    loadIndustryDataset
} = require("./agent_engine");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));



// ===============================
// POST PROJECT
// ===============================

app.post("/projects", async (req, res) => {

    const {
        projectName,
        industry,
        businessModel,
        targetMarket,
        budget,
        description
    } = req.body;

    try {

        await pool.query(
            `INSERT INTO projects
            (project_name, industry, business_model, target_market, budget, description)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                projectName,
                industry,
                businessModel,
                targetMarket,
                budget,
                description
            ]
        );

        res.json({
            success: true,
            message: "Project stored successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database Error"
        });

    }

});


// ===============================
// GET ALL PROJECTS
// ===============================

app.get("/projects", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM projects ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Database Error"
        });

    }

});


// ===============================
// GET INDUSTRY DATA
// ===============================

app.get("/industry-data", (req, res) => {

    try {

        const filePath = path.join(__dirname, "Industry_data.json");

        const jsonData = fs.readFileSync(filePath, "utf8");

        res.json(JSON.parse(jsonData));

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Unable to load industry data"
        });

    }

});

// ==========================================
// DYNAMIC AI INDUSTRY GENERATION ENDPOINT
// ==========================================

app.post("/api/industry/generate", async (req, res) => {
    try {
        const { industry, provider, apiKey, modelName, forceRefresh } = req.body;

        if (!industry) {
            return res.status(400).json({ success: false, message: "Industry name is required" });
        }

        const selectedProvider = provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"));
        const activeApiKey = apiKey || (selectedProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

        const result = await generateAndSaveIndustryData(industry, {
            provider: selectedProvider,
            apiKey: activeApiKey,
            modelName,
            forceRefresh: !!forceRefresh
        });

        res.json({
            success: true,
            message: `Market intelligence for '${result.industry}' generated and stored in Industry_data.json`,
            industry: result.industry,
            data: result.data,
            source: result.source
        });
    } catch (err) {
        console.error("Generate Industry Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});



// ==========================================
// MILESTONE 3: AI AGENT & STRATEGY ENDPOINTS
// ==========================================

// 1. Get Agent Engine Status & Providers
app.get("/api/agent/status", (req, res) => {
    res.json({
        geminiConfigured: !!process.env.GEMINI_API_KEY,
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        availableProviders: ["gemini", "openai", "heuristic"],
        defaultProvider: process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"),
        availableModels: {
            gemini: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
            openai: ["gpt-4o", "gpt-4o-mini"]
        }
    });
});

// 2. Run LangGraph Multi-Agent Workflow
app.post("/api/agent/run-workflow", async (req, res) => {
    try {
        const { startup, provider, apiKey, modelName } = req.body;

        if (!startup) {
            return res.status(400).json({ success: false, message: "Startup profile is required" });
        }

        const selectedProvider = provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"));
        const activeApiKey = apiKey || (selectedProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

        const agentWorkflow = new LangGraphAgentWorkflow({
            provider: selectedProvider,
            apiKey: activeApiKey,
            modelName: modelName
        });

        const result = await agentWorkflow.run(startup);
        res.json(result);
    } catch (err) {
        console.error("LangGraph Workflow Error:", err);
        res.status(500).json({
            success: false,
            message: "Agent workflow execution failed: " + err.message
        });
    }
});

// 3. Generate Mitigation Strategy Roadmap
app.post("/api/mitigations/generate", async (req, res) => {
    try {
        const { startup } = req.body;
        if (!startup) {
            return res.status(400).json({ success: false, message: "Startup profile required" });
        }

        const agentWorkflow = new LangGraphAgentWorkflow();
        let state = { startup, benchmarkData: {}, fmeaDiagnostics: [], mitigationRoadmap: {}, executionTrace: [] };
        state = await agentWorkflow.benchmarkAgentNode(state);
        state = await agentWorkflow.fmeaDiagnosticAgentNode(state);
        state = await agentWorkflow.mitigationPlannerAgentNode(state);

        res.json({
            success: true,
            fmeaDiagnostics: state.fmeaDiagnostics,
            mitigationRoadmap: state.mitigationRoadmap
        });
    } catch (err) {
        console.error("Mitigation Engine Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Run What-If Scenario Simulator
app.post("/api/scenario/simulate", (req, res) => {
    try {
        const { startup, params } = req.body;
        if (!startup || !params) {
            return res.status(400).json({ success: false, message: "Startup and simulation parameters required" });
        }

        const result = simulateWhatIfScenario(startup, params);
        res.json({ success: true, simulation: result });
    } catch (err) {
        console.error("Scenario Simulation Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Generate Project Feasibility & SWOT Analysis with Gemini / OpenAI
app.post("/api/analysis/feasibility-swot", async (req, res) => {
    try {
        const { startup, provider, apiKey, modelName } = req.body;
        if (!startup) {
            return res.status(400).json({ success: false, message: "Startup profile is required" });
        }

        const currentDataset = loadIndustryDataset();
        const indKey = Object.keys(currentDataset).find(
            k => k.toLowerCase() === (startup.industry || "").toLowerCase()
        );
        const benchmarkData = indKey ? currentDataset[indKey] : {};

        const selectedProvider = provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "heuristic"));
        const activeApiKey = apiKey || (selectedProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

        const result = await generateFeasibilityAndSWOT(startup, benchmarkData, {
            provider: selectedProvider,
            apiKey: activeApiKey,
            modelName
        });

        res.json({
            success: true,
            feasibility: result.feasibility,
            swot: result.swot,
            source: result.source
        });
    } catch (err) {
        console.error("Feasibility/SWOT API Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});



// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Startup Risk Intelligence Dashboard Server running on port ${PORT}`);
});