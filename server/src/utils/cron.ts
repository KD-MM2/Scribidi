import cron from "node-cron";

import prisma from "../utils/db";

cron.schedule("0 0 * * *", async () => {
	try {
		await prisma.expiredToken.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		});
		console.log("Expired tokens cleaned");
	} catch (error) {
		console.error("Error cleaning expired tokens:", error);
	}
});
