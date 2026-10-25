import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// CORS configured intentionally[cite: 1]
app.use(cors({
    origin: true,
    credentials: true
}));

// Request payload size limits[cite: 1]
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route Imports
import authRoutes from "./modules/auth/auth.routes.js";
import campaignRoutes from "./modules/campaigns/campaign.routes.js";
import aicRoutes from "./modules/aics/aic.routes.js"
import areaRoutes from "./modules/areas/area.routes.js"
import ucmpRoutes from "./modules/ucmp/ucmp.routes.js"
import teamRoutes from "./modules/teams/team.routes.js";
import geographyRoutes from "./modules/geography/geography.routes.js";
import ampRoutes from "./modules/amp/amp.routes.js";
import ompRoutes from "./modules/omp/omp.routes.js";
import tallySheetRoutes from "./modules/tallySheet/tallySheet.routes.js";
import fixedSheetRoutes from "./modules/fixedSheet/fixedSheet.routes.js";
import transitSheetRoutes from "./modules/transitSheet/transitSheet.routes.js";
import form2ARoutes from "./modules/form2a/form2a.routes.js";
import form2BRoutes from "./modules/form2b/form2b.routes.js";
import contextRoutes from "./modules/context/context.routes.js";

// Route Declarations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/campaigns", campaignRoutes);
app.use("/api/v1/aics", aicRoutes);
app.use("/api/v1/areas", areaRoutes);
app.use("/api/v1/ucmp", ucmpRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/geography", geographyRoutes);
app.use("/api/v1/amp", ampRoutes);
app.use("/api/v1/omp", ompRoutes);
app.use("/api/v1/tally-sheets", tallySheetRoutes);
app.use("/api/v1/fixed-sheets", fixedSheetRoutes);
app.use("/api/v1/transit-sheets", transitSheetRoutes);
app.use("/api/v1/form2a", form2ARoutes);
app.use("/api/v1/form2b", form2BRoutes);
app.use("/api/v1/context", contextRoutes);

// Centralized error handling[cite: 1]
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    // Avoid exposing stack traces or internal errors to users[cite: 1]
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export { app };