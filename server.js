const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


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

// ===============================
// START SERVER
// ===============================

 app.listen(process.env.PORT ||3000)
//  () => {

//     console.log("Server running on port 3000");

// });