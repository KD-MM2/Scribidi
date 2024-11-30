import { Request, Response } from "express";

import prisma from "../utils/db";
import env from "../utils/env";

const setup = async (req: Request, res: Response) => {
	try {
		const {
			models,
			summarizeBackend,
			templates,
		} = req.body;

		const user = await prisma.user.findUnique({
			where: {
				id: req.user?.userId,
			},
			select: {
				id: true,
				email: true,
				name: true,
				setting: true,
			},
		});

		// const newSettings = await prisma.setting.create({
		// 	data: {
		// 		selected_template: selected_template,
		// 		selected_model: selected_model,
		// 		processors: processors || 1,
		// 		threads: threads || 4,
		// 		diarize: diarize || false,
		// 	},
		// });

		// const updatedUser = await prisma.user.update({
		// 	where: {
		// 		id: req.user?.userId,
		// 	},
		// 	data: {
		// 		settingId: newSettings.id,
		// 	},
		// });

		res.status(200).json({ message: "Settings updated successfully" });
		return;
	} catch (error) {
		res.status(500).json({ error: "Server error" });
		return;
	}
};

export { setup };
