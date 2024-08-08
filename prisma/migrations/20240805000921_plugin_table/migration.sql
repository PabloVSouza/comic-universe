-- CreateTable
CREATE TABLE "Plugin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "path" TEXT NOT NULL
);
