const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

// Importing router
const userRoutes = require('./backend/routes/userRoutes')

dotenv.config()

const app = express()
// Middleware
app.use(express.json())

// Test route 
app.get("/api/status", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// Use user routes
app.use('/api/users', userRoutes)




const PORT = process.env.PORT || 5000

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch(()=>{
    console.error('Error connecting to MongoDB:', error.message);
})