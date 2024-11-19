// src/index.ts
import express, { Express, Request, Response } from "express";
// import dotenv from "dotenv";

// dotenv.config();

const app: Express = express();
const env = 'development';
const port = 3000;
const domain = env === 'development' ? 'localhost' : '';


app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, `${domain}`, () => {
    console.log(`[server]: Server is running at http://${domain}:${port}`);
});
