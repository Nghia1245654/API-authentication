import express from "express";
import cors from "cors";
import { swaggerDocs } from "./swagger.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import cookieParser from 'cookie-parser'; 

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
// Swagger docs
swaggerDocs(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
