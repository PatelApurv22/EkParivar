const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const familyRoutes = require("./routes/familyRoutes");
const aadhaarRoutes = require("./routes/aadhaarRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const auditRoutes = require("./routes/auditRoutes");
const seedRoutes = require("./routes/seedRoutes");
const editRoutes = require("./routes/editRoutes");
const splitRoutes = require("./routes/splitRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

app.disable("x-powered-by");

const allowedOrigins = new Set(
    (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;

    return /^(https?:\/\/localhost(?::\d+)?|https?:\/\/127\.0\.0\.1(?::\d+)?)$/.test(origin)
        || /^(https:\/\/.*\.vercel\.app|https:\/\/.*\.onrender\.com)$/.test(origin);
};

app.use(
    cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/aadhaar", aadhaarRoutes);
app.use("/api/scheme", schemeRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/split", splitRoutes);
app.use("/api/documents", documentRoutes);


const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGODB_URI;

const startServer = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGODB_URI is not defined. Set it in your environment variables.");
        }

        await mongoose.connect(MONGO_URI);

        console.log("MongoDB Atlas connected successfully");

        app.get("/", (req, res) => {
            res.json({
                success: true,
                message: "EkParivar Beneficiary Management System API is running",
                version: "1.0.0",
                mode: "Demo / Prototype"
            });
        });

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    }
};

startServer();