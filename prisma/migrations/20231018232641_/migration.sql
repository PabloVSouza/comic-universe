-- CreateTable
CREATE TABLE "Comic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "author" TEXT,
    "artist" TEXT,
    "publisher" TEXT,
    "status" TEXT,
    "genres" TEXT,
    "siteLink" TEXT,
    "synopsis" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comicId" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    "siteLink" TEXT,
    "releaseId" TEXT,
    "repo" TEXT NOT NULL,
    "name" TEXT,
    "number" TEXT NOT NULL,
    "pages" TEXT,
    "date" TEXT,
    "offline" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Chapter_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chapterId" INTEGER NOT NULL,
    "comicId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalPages" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    CONSTRAINT "ReadProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadProgress_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false
);
