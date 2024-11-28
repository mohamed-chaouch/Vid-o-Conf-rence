import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { handleRefreshToken } from "./controllers/refreshTokenController.js";
import { handleLogout } from "./controllers/logoutController.js";
import { verifyToken } from "./utils/verifyToken.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
app.use(cors());
// Use Morgan with the custom format
app.use(morgan(":method :url :status"));
// for json Data
app.use(express.json({ limit: "10mb" }));
// for formData
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// middleware for cookies
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
import "./config/connect.js";
import { googleAuth } from "./controllers/googleAuthController.js";
app.use("/", userRouter);
app.get('/api/auth/google', googleAuth);
app.post("/refresh-token", handleRefreshToken);
app.get("/logout", verifyToken, handleLogout);
// Serve static files
const uploadsPath = path.join(__dirname, process.env.UPLOADS_PATH);
app.use("/", express.static(uploadsPath));
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
