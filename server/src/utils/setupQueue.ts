import { Queue, Worker } from "bullmq";
import fs from "fs";
import path from "path";

import prisma from "./db";
import env from "./env";
import { execCommandWithLogging, generateTranscript, parseRttm } from "./utils";
import { broadcast } from "./ws";

const setupQueue = new Queue("setup", {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

const worker = new Worker(
  "setup",
  async (job) => {
    try {
      const { models, summarizeBackend, templates } = job.data;
      await job.log(`Models: ${models}`);
      await job.log(`Summarize Backend: ${summarizeBackend}`);
      await job.log(`Templates: ${templates}`);

      models.forEach(async (model: string) => {
        const cmd = `sh ./whisper.cpp/models/download-ggml-model.sh ${model}`;
        execCommandWithLogging(cmd, job, 100);
      });
      let cmd = "cd whisper.cpp && ";
      // cmd = "cd whisper.cpp";
      // await execCommandWithLogging(cmd, job, 100);

      if (eval(env.NVIDIA) === true) {
        // cmd = "GGML_CUDA=1 make -j";
        cmd += "GGML_CUDA=1 make -j";
      } else {
        // cmd = "make -j";
        cmd += "make -j";
      }
      await execCommandWithLogging(cmd, job, 100);

      broadcast("Whisper setup complete");

      job.updateProgress(100); // Mark job progress as complete
    } catch (error) {
      await job.log(`Error: ${error}`);
      console.error(error);
    }
  },
  {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT }, // Redis connection
    concurrency: 1, // Allows multiple jobs to run concurrently
  }
);

export { setupQueue };
