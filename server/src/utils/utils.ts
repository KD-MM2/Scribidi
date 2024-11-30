import { type Job } from "bullmq";
import * as child_process from "child_process";

import {
  SpeakerSegment,
  TranscriptSegment,
  WordTimestamp,
} from "../types/schema";
import { broadcast } from "./ws";

const execCommandWithLogging = (cmd: string, job: Job, progress: number) => {
  return new Promise((resolve, reject) => {
    const process = child_process.exec(cmd);

    // Capture stdout
    process.stdout!.on("data", async (data) => {
      // const log = `stdout: ${data}`;
      // console.log(log);
      // await job.log(log);
      broadcast(data);
    });

    // Capture stderr and update progress
    process.stderr!.on("data", async (data) => {
      // const log = `stderr: ${data}`;
      // console.error(log);
      // await job.log(log);
      broadcast(data); // Send to WebSocket clients

      // Check if stderr contains a progress update from Whisper
      // const progressMatch = data
      // 	.toString()
      // 	.match(/progress\s*=\s*(\d+)%/);
      // if (progressMatch) {
      // 	const tprogress = parseInt(progressMatch[1], 10);

      // 	// if (tprogress == 100) {
      // 	// 	return;
      // 	// }

      // 	const _remaining = 95 - progress;
      // 	const _prog = (_remaining * tprogress) / 100;

      // 	await job.updateProgress(_prog);
      // }
    });

    // Handle process close event
    process.on("close", () => {
      broadcast("Process done");
      resolve(true);
      // if (code === 0) {
      //     resolve(true);
      // } else {
      //     reject(new Error(`Command failed with exit code ${code}`));
      // }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });
  });
};

// const execCommandWithLoggingSync = (cmd: string, job: any) => {
// 	return new Promise((resolve, reject) => {
// 		const process = child_process.exec(cmd, {
// 			shell: "cmd.exe",
// 			maxBuffer: 1024 * 1024 * 10,
// 		}); // Max buffer for larger outputs

// 		process.stdout!.on("data", async (data) => {
// 			console.log(`stdout: ${data}`);
// 			await job.log(`stdout: ${data}`);
// 		});

// 		process.stderr!.on("data", async (data) => {
// 			console.error(`stderr: ${data}`);
// 			await job.log(`stderr: ${data}`);
// 		});

// 		process.on("close", (code) => {
// 			if (code === 0) {
// 				resolve(true);
// 			} else {
// 				reject(
// 					new Error(
// 						`Command failed with exit code ${code !== null ? code : "unknown"}`
// 					)
// 				);
// 			}
// 		});

// 		process.on("error", (err) => {
// 			reject(new Error(`Failed to start process: ${err.message}`));
// 		});
// 	});
// };

function parseRttm(text: string): SpeakerSegment[] {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      const parts = line.split(" ");
      if (parts.length >= 5) {
        const startTime = parseFloat(parts[3]);
        const duration = parseFloat(parts[4]);
        const speaker = parts[7]; // Assuming speaker info is in column 8
        return { startTime, duration, speaker };
      }
      return null;
    })
    .filter((segment): segment is SpeakerSegment => segment !== null);
}

function preprocessWordTimestamps(
  wordTimestamps: WordTimestamp[]
): WordTimestamp[] {
  const cleanedTimestamps: WordTimestamp[] = [];
  let previousWord: WordTimestamp | null = null;

  wordTimestamps.forEach((word, index) => {
    const text = word.text.trim();

    // Handle periods and other punctuation
    if (text === ".") {
      if (previousWord) {
        // Append the period to the previous word
        previousWord.text += text;
        previousWord.timestamps.to = word.timestamps.to;
      }
    } else if (text.startsWith("'")) {
      // Append apostrophe-starting words to the previous word
      if (previousWord) {
        previousWord.text += text;
        previousWord.timestamps.to = word.timestamps.to;
      }
    } else if (
      text.length === 1 &&
      text !== "a" &&
      text !== "i" &&
      text !== "I"
    ) {
      // Handle single character words (except "a")
      // if (previousWord) {
      //     // Append single character to the previous word
      //     previousWord.text += ` ${text}`;
      //     previousWord.timestamps.to = word.timestamps.to;
      // } else if (index + 1 < wordTimestamps.length) {
      //     // If no previous word, prepend to the next word
      //     const nextWord = wordTimestamps[index + 1];
      //     nextWord.text = `${text} ${nextWord.text}`;
      //     nextWord.timestamps.from = word.timestamps.from;
      // }
      console.log("deleting char");
    } else if (
      text.length === 1 &&
      (text === "a" || text === "I" || text === "i")
    ) {
      // Keep "a" as a separate word
      cleanedTimestamps.push(word);
      previousWord = word;
    } else {
      // Remove other single-character symbols (e.g., parentheses, commas)
      if (!/^[\.,!?;:()\[\]]$/.test(text)) {
        cleanedTimestamps.push(word);
        previousWord = word;
      }
    }
  });

  return cleanedTimestamps;
}

function generateTranscript(
  wordys: WordTimestamp[],
  rttmString: string
): TranscriptSegment[] {
  const speakerSegments: SpeakerSegment[] = parseRttm(rttmString);
  const wordTimestamps: WordTimestamp[] = preprocessWordTimestamps(wordys);

  const finalTranscript: TranscriptSegment[] = [];
  let currentSegment: TranscriptSegment = {
    text: "",
    timestamps: { from: null, to: null },
    speaker: null,
  };

  wordTimestamps.forEach((word) => {
    const wordStart = word.offsets.from;
    const wordEnd = word.offsets.to;

    const matchingSpeakerSegment = speakerSegments.find((speakerSegment) => {
      const speakerStart = speakerSegment.startTime * 1000;
      const speakerEnd = speakerStart + speakerSegment.duration * 1000;
      return wordEnd >= speakerStart && wordEnd <= speakerEnd;
    });

    const assignedSpeaker = matchingSpeakerSegment
      ? matchingSpeakerSegment.speaker
      : currentSegment.speaker;

    if (!matchingSpeakerSegment) {
      console.log("---------> Speaker unknown");
    }

    // If the current segment is for the same speaker, append the word
    if (currentSegment.speaker === assignedSpeaker) {
      currentSegment.text += word.text;
      currentSegment.timestamps.to = word.timestamps.to; // Update end time
    } else if (currentSegment.speaker === null) {
      currentSegment.speaker = assignedSpeaker;
      currentSegment.text += word.text;
      currentSegment.timestamps.to = word.timestamps.to; // Update end time
    } else {
      // Push the current segment if it has text
      if (currentSegment.text.length > 0) {
        finalTranscript.push({ ...currentSegment });
      }

      // Start a new segment for the new speaker
      currentSegment = {
        text: word.text,
        timestamps: {
          from: word.timestamps.from,
          to: word.timestamps.to,
        },
        speaker: assignedSpeaker,
      };
    }
  });

  // Push the last segment if any
  if (currentSegment.text.length > 0) {
    finalTranscript.push(currentSegment);
  }

  return finalTranscript;
}
export { execCommandWithLogging, parseRttm, generateTranscript };
