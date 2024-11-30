import { Request, Response } from "express";

import prisma from "../utils/db";
import env from "../utils/env";
// import { execCommandWithLogging, generateTranscript, parseRttm } from "../utils/utils";
import { setupQueue } from "../utils/setupQueue";

const setup = async (req: Request, res: Response) => {
	const {
		models,
		defaultModel,
		summarizeBackend,
		templates,
		defaultTemplate,
	} = req.body;
	console.log("models", models);
	console.log("summarizeBackend", summarizeBackend);
	console.log("templates", templates);
	const job = await setupQueue.add("setup", {
		models,
		defaultModel,
		summarizeBackend,
		templates,
		defaultTemplate,
	});
	const systemConfig = await prisma.systemConfig.create({
		data: {
			downloadedModels: models,
		},
	});
	const user = await prisma.user.findUnique({
		where: { id: req.user?.userId },
	});

	const modelsRecords = [];
	for (const model of models) {
		const m = await prisma.model.create({
			data: {
				model_name: model.name,
				english_model: model.lang === "en",
				model_path: model.name,
				quantized_level: model.quant,
			},
		});
		modelsRecords.push(m);
	}

	const templatesRecords = [];
	for (const template of templates) {
		const t = await prisma.template.create({
			data: {
				name: template.name,
				prompt: template.prompt,
			},
		});
		templatesRecords.push(t);
	}

	const setting = await prisma.setting.create({
		data: {
			selectedModelId: defaultModel,
			selectedTemplateId: defaultTemplate,
			userId: user?.id,
		},
	});
};

export { setup };
