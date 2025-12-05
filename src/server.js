import express from "express";
import { swaggerDocs } from "./swagger.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser'; 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Swagger docs
swaggerDocs(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
