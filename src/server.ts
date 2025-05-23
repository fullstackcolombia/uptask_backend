import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRouter from "./routes/auth-routes";
import projectRouter from "./routes/project-routes";
import { corsOptions } from "./config/cors";
import cors from "cors";

dotenv.config();

connectDB();
const server = express();
server.use(express.json());

server.use(cors(corsOptions));

//Routes
server.use("/api/auth", authRouter);
server.use("/api/projects", projectRouter);

export default server;
