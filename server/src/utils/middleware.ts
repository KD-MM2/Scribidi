import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JwtPayload } from "../types/schema";
import prisma from "../utils/db";
import env from "../utils/env";

declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			throw new Error();
		}

		const expiredToken = await prisma.expiredToken.findUnique({
			where: { token },
		});
		if (expiredToken) {
			res.status(401).json({ message: "Token is blacklisted" });
			return;
		}

		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Please authenticate" });
		return;
	}
};

export default auth;
