import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";

import { CustomRequest } from "../types/schema";
import env from "./env";

const storage = multer.diskStorage({
  destination: function (req: CustomRequest, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err, "");
      const hex = raw.toString("hex");
      const dir = path.join(env.UPLOAD_DIR, hex);
      fs.mkdirSync(dir, { recursive: true });
      req.hexName = hex; // Store hex in the request object
      cb(null, dir);
    });
  },
  filename: function (req: CustomRequest, file, cb) {
    const hex = req.hexName; // Retrieve hex from the request object
    cb(null, hex + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export default upload;
