const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())

// Test route 
app.get("/api/status", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});