-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."StatutTrajet" AS ENUM ('actif', 'inactif');

-- CreateEnum
CREATE TYPE "public"."StatutReservation" AS ENUM ('en_attente', 'confirmee', 'annulee');

-- CreateTable
CREATE TABLE "public"."Agence" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trajet" (
    "id" SERIAL NOT NULL,
    "depart" TEXT NOT NULL,
    "arrivee" TEXT NOT NULL,
    "heure" TEXT NOT NULL,
    "prixAdulte" INTEGER NOT NULL,
    "prixEnfant" INTEGER NOT NULL,
    "statut" "public"."StatutTrajet" NOT NULL DEFAULT 'actif',
    "agenceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trajet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" SERIAL NOT NULL,
    "trajetId" INTEGER NOT NULL,
    "client" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nbVoyageurs" INTEGER NOT NULL,
    "statut" "public"."StatutReservation" NOT NULL DEFAULT 'en_attente',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Trajet" ADD CONSTRAINT "Trajet_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "public"."Agence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "public"."Trajet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
