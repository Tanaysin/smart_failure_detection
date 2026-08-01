// const { Pool } = require("pg");

// const pool = new Pool({
//     host: "localhost",
//     port: 5432,
//     user: "tanaysinha",
//     database: "smart_failure_detection",
    
// });

// module.exports = pool;



const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;