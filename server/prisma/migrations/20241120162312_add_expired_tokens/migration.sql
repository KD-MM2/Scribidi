-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "name" TEXT,
    "settingId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "audio_file_path" TEXT NOT NULL,
    "audio_file_name" TEXT NOT NULL,
    "created" TIMESTAMP(3),
    "updated" TIMESTAMP(3),
    "diarize" BOOLEAN DEFAULT false,
    "diarized_transcript" TEXT,
    "model" TEXT,
    "peaks" TEXT,
    "processed" BOOLEAN DEFAULT false,
    "rttm" TEXT,
    "summary" TEXT,
    "transcript" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "model_name" TEXT,
    "english_model" BOOLEAN DEFAULT false,
    "model_path" TEXT,
    "quantized_level" TEXT,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "diarize" BOOLEAN DEFAULT false,
    "processors" INTEGER,
    "threads" INTEGER,
    "modelId" TEXT,
    "templateId" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "prompt" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpiredToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpiredToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_id_key" ON "Transcript"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Model_id_key" ON "Model"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_id_key" ON "Setting"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Template_id_key" ON "Template"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpiredToken_token_key" ON "ExpiredToken"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
