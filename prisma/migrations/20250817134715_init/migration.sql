-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Client',
    "status" TEXT NOT NULL DEFAULT 'active',
    "phone" TEXT,
    "address" TEXT,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "zone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trajet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "depart" TEXT NOT NULL,
    "arrivee" TEXT NOT NULL,
    "heure" TEXT NOT NULL,
    "prixAdulte" INTEGER NOT NULL,
    "prixEnfant" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'actif',
    "agenceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trajet_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trajetId" INTEGER NOT NULL,
    "voyageId" INTEGER,
    "client" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nbVoyageurs" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "baggage" INTEGER NOT NULL DEFAULT 0,
    "adultIdUrl" TEXT,
    "otherDocumentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agenceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "seatsPerRow" INTEGER NOT NULL,
    "layout" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bus_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusSeat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "busId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NORMAL',
    "isWindow" BOOLEAN NOT NULL DEFAULT false,
    "isAisle" BOOLEAN NOT NULL DEFAULT false,
    "section" TEXT,
    CONSTRAINT "BusSeat_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voyage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trajetId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "busId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Voyage_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Voyage_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservationPassenger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservationId" INTEGER NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "prefWindow" BOOLEAN,
    "prefAisle" BOOLEAN,
    "prefSection" TEXT,
    CONSTRAINT "ReservationPassenger_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeatAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voyageId" INTEGER NOT NULL,
    "busSeatId" INTEGER NOT NULL,
    "passengerId" INTEGER NOT NULL,
    CONSTRAINT "SeatAssignment_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeatAssignment_busSeatId_fkey" FOREIGN KEY ("busSeatId") REFERENCES "BusSeat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeatAssignment_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "ReservationPassenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_name_key" ON "Agence"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_email_key" ON "Agence"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SeatAssignment_voyageId_busSeatId_key" ON "SeatAssignment"("voyageId", "busSeatId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatAssignment_voyageId_passengerId_key" ON "SeatAssignment"("voyageId", "passengerId");
