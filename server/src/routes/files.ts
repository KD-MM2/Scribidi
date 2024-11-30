import { Request, Response } from "express";

import prisma from "../utils/db";
import env from "../utils/env";
import { transcriptionQueue } from "../utils/transcriptionQueue";

const upload_file = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).send("No file uploaded");
      return;
    }

    // const audioBlob = new Blob([file.buffer], { type: file.mimetype });

    // const data = {
    // 	audio: audioBlob,
    // 	processed: false,
    // 	title: file.originalname.split(".")[0],
    // 	date: new Date().toISOString(),
    // };

    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        setting: true,
        settingId: true,
      },
    });
    console.log(user?.settingId);
    console.log(user?.setting);

    const settings = await prisma.setting.findFirst({
      where: {
        id: user?.setting?.id,
      },
    });

    const newTranscript = await prisma.transcript
      .create({
        data: {
          audio_file_path: file.path,
          audio_file_name: file.originalname,
          userId: req.user?.userId || "",
          created: new Date().toISOString(),
          processed: false,
          name: file.originalname.split(".")[0],
        },
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: "Server error" });
        return;
      });
    console.log(newTranscript);
    // const record = await req.locals.pb.collection('scribo').create(data);
    const job = await transcriptionQueue.add("processAudio", {
      newTranscript,
      settings,
    });
    // console.log('Created job:', job.id);
    res.status(201).json({ message: "File uploaded successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export { upload_file };
