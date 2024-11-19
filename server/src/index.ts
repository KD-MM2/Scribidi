// src/index.ts
import express, { Express, Request, Response } from "express";

// import dotenv from "dotenv";
import prisma from "./db";

// dotenv.config();

const app: Express = express();
const env = "development";
const port = 3000;
const domain = env === "development" ? "localhost" : "";

app.get("/", async (req: Request, res: Response) => {
	const allUsers = await main();
	res.send(allUsers);
});

app.listen(port, `${domain}`, () => {
	console.log(`[server]: Server is running at http://${domain}:${port}`);
});

async function main() {
	const allUsers = await prisma.user.findMany();
	return allUsers;
}
