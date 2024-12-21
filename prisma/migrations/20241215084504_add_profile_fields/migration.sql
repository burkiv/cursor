/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "profilePicture" TEXT,
    "securityQuestion" TEXT,
    "securityAnswer" TEXT,
    "lastLoginAt" DATETIME,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockUntil" DATETIME,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_albums" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "coverPhotoId" TEXT,
    CONSTRAINT "albums_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_albums" ("coverPhotoId", "createdAt", "description", "id", "isPrivate", "title", "updatedAt", "userId") SELECT "coverPhotoId", "createdAt", "description", "id", "isPrivate", "title", "updatedAt", "userId" FROM "albums";
DROP TABLE "albums";
ALTER TABLE "new_albums" RENAME TO "albums";
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "comments_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("content", "createdAt", "id", "photoId", "updatedAt", "userId") SELECT "content", "createdAt", "id", "photoId", "updatedAt", "userId" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "albumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "photos_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_photos" ("albumId", "createdAt", "description", "id", "title", "url", "userId") SELECT "albumId", "createdAt", "description", "id", "title", "url", "userId" FROM "photos";
DROP TABLE "photos";
ALTER TABLE "new_photos" RENAME TO "photos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
