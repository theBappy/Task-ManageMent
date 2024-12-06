const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and contains "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get the user from the decoded token
            req.user = await User.findById(decoded.id).select("-password");

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            // Invalid token
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    // Token not found in the authorization header
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };


