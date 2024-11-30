-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "inited" BOOLEAN DEFAULT false,
    "downloadedModels" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
