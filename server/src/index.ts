// src/index.ts
import { login, logout, register, me } from "./routes/auth";
import { upload_file } from "./routes/files";
import { setup } from "./routes/setup";
import { app, httpServer } from "./server";
import env from "./utils/env";
import auth from "./utils/middleware";
import upload from "./utils/multer";

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", auth, logout);
app.get("/api/auth/me", auth, me);

app.post("/api/upload", auth, upload.single("audio"), upload_file);
app.post("/api/setup", auth, setup);

httpServer.listen(env.PORT, env.HOST, () => {
  console.log(`[server]: Server is running at http://${env.HOST}:${env.PORT}`);
});
