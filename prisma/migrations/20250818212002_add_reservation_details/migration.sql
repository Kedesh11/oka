/*
  Warnings:

  - You are about to drop the column `adultIdUrl` on the `Reservation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trajetId" INTEGER NOT NULL,
    "voyageId" INTEGER,
    "client" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nbVoyageurs" INTEGER NOT NULL,
    "adultCount" INTEGER NOT NULL DEFAULT 1,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "baggage" INTEGER NOT NULL DEFAULT 0,
    "identityDocumentUrl" TEXT,
    "otherDocumentUrl" TEXT,
    "subTotal" INTEGER NOT NULL DEFAULT 0,
    "serviceFee" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("baggage", "childrenCount", "client", "createdAt", "id", "nbVoyageurs", "otherDocumentUrl", "serviceFee", "statut", "subTotal", "telephone", "totalAmount", "trajetId", "voyageId") SELECT "baggage", "childrenCount", "client", "createdAt", "id", "nbVoyageurs", "otherDocumentUrl", "serviceFee", "statut", "subTotal", "telephone", "totalAmount", "trajetId", "voyageId" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
