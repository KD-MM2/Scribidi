import { Queue, Worker } from "bullmq";
import fs from "fs";
import path from "path";

import prisma from "./db";
import env from "./env";
import { execCommandWithLogging, generateTranscript, parseRttm } from "./utils";

const transcriptionQueue = new Queue("transcription", {
	connection: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
});

const worker = new Worker(
	"transcription",
	async (job) => {
		try {
			const { newTranscript, settings } = job.data;
			const { id, audio_file_path } = newTranscript;
			await job.log(`Starting job ${job.id} for record ${id}`);
			/*
			> path.parse('uploads/asdasdasdasdas/asdasdasdasdas.wav') 
			{
			root: '',
			dir: 'uploads/asdasdasdasdas',
			base: 'asdasdasdasdas.wav',
			ext: '.wav',
			name: 'asdasdasdasdas'
			}
			*/
			const { root, dir, base, ext, name } = path.parse(audio_file_path);
			// Download the audio file
			// const baseUrl = path.resolve(
			// 	env.SCRIBO_FILES,
			// 	"audio",
			// 	`${recordId}`
			// );
			// fs.mkdir(baseUrl, { recursive: true }, (err) => {
			// 	if (err) throw err;
			// });
			// const audioUrl = pb.files.getUrl(record, audioFilename);
			// "uploads/5cc90f323f8efd4514312712ee891873/5cc90f323f8efd4514312712ee891873.wav"
			// ffmpeg path will be: "uploads/5cc90f323f8efd4514312712ee891873/5cc90f323f8efd4514312712ee891873-ffmpeg.wav"
			const ffmpegPath = path.resolve(dir, `${name}-ffmpeg${ext}`);
			// const res = await fetch(audioUrl);
			await job.log(
				`Downloaded and saved audio file for record ${id}. Path: ${audio_file_path}, ffmpegPath: ${ffmpegPath}`
			);

			// const buffer = await res.arrayBuffer();
			// fs.writeFileSync(audioPath, Buffer.from(buffer));
			// await job.log(
			// 	`Downloaded and saved audio file for record ${recordId}`
			// );

			job.updateProgress(1.5);
			// Execute the ffmpeg command and log output
			const ffmpegCmd = `ffmpeg -i ${audio_file_path} -ar 16000 -ac 1 -c:a pcm_s16le ${ffmpegPath}`;
			await execCommandWithLogging(ffmpegCmd, job, 20);
			await job.log(`Audio file for ${id} converted successfully`);

			job.updateProgress(7.5);
			const audiowaveformCmd = `audiowaveform -i ${ffmpegPath} -o ${audio_file_path}.json`;
			await execCommandWithLogging(audiowaveformCmd, job, 80);
			await job.log(`Audiowaveform for ${id} generated`);

			// const settingsRecords = await pb
			// 	.collection("settings")
			// 	.getList(1, 1);
			// const settings = settingsRecords.items[0];
			// const settings = await prisma.setting.findFirst({
			// 	where: {
			// 		id: 1,
			// 	},
			// });

			// Execute whisper.cpp command and log output
			// const transcriptdir = path.resolve(dir, "transcripts");
			// const transcriptPath = path.resolve(
			// 	env.SCRIBO_FILES,
			// 	"transcripts",
			// 	`${recordId}`,
			// 	`${recordId}`
			// );
			const transcriptPath = path.resolve(dir, `${name}-transcript`);
			// fs.mkdir(transcriptdir, { recursive: true }, (err) => {
			// 	if (err) throw err;
			// });

			let whisperCmd;
			console.log(env.DEV_MODE);
			job.log(env.DEV_MODE);

			const isDevMode = env.DEV_MODE === "true";

			console.log("DEV MODE ----->", isDevMode);
			job.log(`DEV MODE -----> ${isDevMode}`);

			if (isDevMode) {
				whisperCmd = `./whisper.cpp/main -m ./whisper.cpp/models/ggml-${settings.model}.en.bin -f ${ffmpegPath} -oj -of ${transcriptPath} -t ${settings.threads} -p ${settings.processors} -pp`;
			} else {
				whisperCmd = `whisper -m /models/ggml-${settings.model}.en.bin -f ${ffmpegPath} -oj -of ${transcriptPath} -t ${settings.threads} -p ${settings.processors} -pp`;
			}

			let rttmContent;
			let segments;

			if (settings.diarize) {
				job.updateProgress(12);
				const rttmPath = path.resolve(dir, `${name}.rttm`);
				const diarizeCmd = `python3 ./diarize/local.py ${ffmpegPath} ${rttmPath}`;
				await execCommandWithLogging(diarizeCmd, job, 20);
				await job.log(`Diarization completed successfully`);
				// Read and parse the RTTM file
				rttmContent = fs.readFileSync(rttmPath, "utf-8");
				segments = parseRttm(rttmContent);
				await job.log(`Parsed RTTM file for record ${id}`);

				if (isDevMode) {
					whisperCmd = `./whisper.cpp/main -m ./whisper.cpp/models/ggml-${settings.model}.en.bin -f ${ffmpegPath} -oj -of ${transcriptPath} -t ${settings.threads} -p ${settings.processors} -pp -ml 1`;
				} else {
					whisperCmd = `whisper -m /models/ggml-${settings.model}.en.bin -f ${ffmpegPath} -oj -of ${transcriptPath} -t ${settings.threads} -p ${settings.processors} -pp -ml 1`;
				}
			}

			job.updateProgress(35);

			await execCommandWithLogging(whisperCmd, job, 35);
			await job.log(`Whisper transcription for ${id} completed`);

			// Read and update transcript
			const transcript = fs.readFileSync(
				`${transcriptPath}.json`,
				"utf-8"
			);
			let transcriptJson = JSON.parse(transcript);
			console.log(transcriptJson);

			const audioPeaks = fs.readFileSync(
				`${audio_file_path}.json`,
				"utf-8"
			);
			let upd;

			if (settings.diarize) {
				const diarizedTranscript = generateTranscript(
					transcriptJson.transcription,
					rttmContent || ""
				);
				const diarizedJson = { transcription: diarizedTranscript };

				// upd = await pb.collection("scribo").update(recordId, {
				// 	// transcript: '{ "test": "hi" }',
				// 	transcript: transcriptJson,
				// 	diarizedtranscript: diarizedJson,
				// 	rttm: rttmContent,
				// 	processed: true,
				// 	diarized: true,
				// 	peaks: JSON.parse(audioPeaks),
				// });

				upd = await prisma.transcript.update({
					where: {
						id: id,
					},
					data: {
						transcript: transcriptJson,
						diarized_transcript: String(diarizedJson),
						rttm: rttmContent,
						processed: true,
						diarize: true,
						peaks: JSON.parse(audioPeaks),
					},
				});
			} else {
				// upd = await pb.collection("scribo").update(recordId, {
				// 	// transcript: '{ "test": "hi" }',
				// 	transcript: transcriptJson,
				// 	processed: true,
				// 	diarized: false,
				// 	peaks: JSON.parse(audioPeaks),
				// });
				upd = await prisma.transcript.update({
					where: {
						id: id,
					},
					data: {
						transcript: transcriptJson,
						processed: true,
						diarize: false,
						peaks: JSON.parse(audioPeaks),
					},
				});
			}

			await job.log(`Updated PocketBase record for ${id}`);
			console.log("UPDATED +++++ ", upd);

			// Clean up
			// fs.unlinkSync(audioPath);
			// fs.unlinkSync(`${audioPath}.json`);
			// fs.unlinkSync(ffmpegPath);
			// fs.unlinkSync(`${transcriptPath}.json`);
			// fs.rm(baseUrl, { recursive: true, force: true }, (err) => {
			// 	if (err) throw err;
			// });
			// await job.log(`Cleaned up temporary files for ${recordId}`);

			console.log(
				`Job ${job.id} for record ${id} completed successfully`
			);
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

export { transcriptionQueue };
