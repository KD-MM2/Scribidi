// server.ts
import cors from "cors";
import express, { type Express } from "express";
import { createServer } from "http";

import env from "./utils/env";

const app: Express = express();

// Middlewares
const corsOptions = {
	origin: env.CORS_ORIGIN
		? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
		: "*", // Fallback to allow all origins if not specified
	credentials: true,
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

const httpServer = createServer(app);

export { app, httpServer, corsOptions };
