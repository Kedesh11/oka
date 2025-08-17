-- Fleet & Seating models migration (Supabase Postgres)

-- Enums (idempotent)
DO $$ BEGIN
  CREATE TYPE "public"."SeatType" AS ENUM ('NORMAL','HANDICAP','VIP','DRIVER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."SeatSection" AS ENUM ('FRONT','MIDDLE','BACK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "public"."Bus" (
  "id" SERIAL PRIMARY KEY,
  "agenceId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "seatCount" INTEGER NOT NULL,
  "seatsPerRow" INTEGER NOT NULL,
  "layout" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."BusSeat" (
  "id" SERIAL PRIMARY KEY,
  "busId" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "row" INTEGER NOT NULL,
  "col" INTEGER NOT NULL,
  "type" "public"."SeatType" NOT NULL DEFAULT 'NORMAL',
  "isWindow" BOOLEAN NOT NULL DEFAULT FALSE,
  "isAisle" BOOLEAN NOT NULL DEFAULT FALSE,
  "section" "public"."SeatSection"
);

CREATE TABLE IF NOT EXISTS "public"."Voyage" (
  "id" SERIAL PRIMARY KEY,
  "trajetId" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "busId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."ReservationPassenger" (
  "id" SERIAL PRIMARY KEY,
  "reservationId" INTEGER NOT NULL,
  "name" TEXT,
  "age" INTEGER,
  "prefWindow" BOOLEAN,
  "prefAisle" BOOLEAN,
  "prefSection" "public"."SeatSection"
);

CREATE TABLE IF NOT EXISTS "public"."SeatAssignment" (
  "id" SERIAL PRIMARY KEY,
  "voyageId" INTEGER NOT NULL,
  "busSeatId" INTEGER NOT NULL,
  "passengerId" INTEGER NOT NULL,
  CONSTRAINT "SeatAssignment_voyageId_busSeatId_key" UNIQUE ("voyageId","busSeatId"),
  CONSTRAINT "SeatAssignment_voyageId_passengerId_key" UNIQUE ("voyageId","passengerId")
);

-- Foreign keys
ALTER TABLE "public"."Bus"
  ADD CONSTRAINT "Bus_agenceId_fkey"
  FOREIGN KEY ("agenceId") REFERENCES "public"."Agence"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."BusSeat"
  ADD CONSTRAINT "BusSeat_busId_fkey"
  FOREIGN KEY ("busId") REFERENCES "public"."Bus"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Voyage"
  ADD CONSTRAINT "Voyage_trajetId_fkey"
  FOREIGN KEY ("trajetId") REFERENCES "public"."Trajet"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Voyage"
  ADD CONSTRAINT "Voyage_busId_fkey"
  FOREIGN KEY ("busId") REFERENCES "public"."Bus"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."ReservationPassenger"
  ADD CONSTRAINT "ReservationPassenger_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."SeatAssignment"
  ADD CONSTRAINT "SeatAssignment_voyageId_fkey"
  FOREIGN KEY ("voyageId") REFERENCES "public"."Voyage"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."SeatAssignment"
  ADD CONSTRAINT "SeatAssignment_busSeatId_fkey"
  FOREIGN KEY ("busSeatId") REFERENCES "public"."BusSeat"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."SeatAssignment"
  ADD CONSTRAINT "SeatAssignment_passengerId_fkey"
  FOREIGN KEY ("passengerId") REFERENCES "public"."ReservationPassenger"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Optional seed to ensure Agence exists for FK usage
INSERT INTO "public"."Agence" ("name")
SELECT 'Agence Démo'
WHERE NOT EXISTS (SELECT 1 FROM "public"."Agence");
