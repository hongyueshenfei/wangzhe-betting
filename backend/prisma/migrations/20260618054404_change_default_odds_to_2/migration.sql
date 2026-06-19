-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "seasonId" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "groupName" TEXT,
    "round" TEXT,
    "matchOrder" INTEGER,
    "teamAId" INTEGER NOT NULL,
    "teamBId" INTEGER NOT NULL,
    "teamAScore" INTEGER,
    "teamBScore" INTEGER,
    "matchTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "forfeitTeamId" INTEGER,
    "winnerTeamId" INTEGER,
    "oddsA" REAL NOT NULL DEFAULT 2.0,
    "oddsB" REAL NOT NULL DEFAULT 2.0,
    "betTotalA" INTEGER NOT NULL DEFAULT 0,
    "betTotalB" INTEGER NOT NULL DEFAULT 0,
    "betCountA" INTEGER NOT NULL DEFAULT 0,
    "betCountB" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_forfeitTeamId_fkey" FOREIGN KEY ("forfeitTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("betCountA", "betCountB", "betTotalA", "betTotalB", "createdAt", "forfeitTeamId", "groupName", "id", "matchOrder", "matchTime", "oddsA", "oddsB", "round", "seasonId", "stage", "status", "teamAId", "teamAScore", "teamBId", "teamBScore", "updatedAt", "winnerTeamId") SELECT "betCountA", "betCountB", "betTotalA", "betTotalB", "createdAt", "forfeitTeamId", "groupName", "id", "matchOrder", "matchTime", "oddsA", "oddsB", "round", "seasonId", "stage", "status", "teamAId", "teamAScore", "teamBId", "teamBScore", "updatedAt", "winnerTeamId" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
