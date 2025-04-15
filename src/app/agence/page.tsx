"use client";
import React from "react";
import NavBar from "@/components/navBar";
import { useSearchParams } from "next/navigation";
import CardAgence from "@/components/card-agences/cardAgence";

export default function PageAgence() {
  const searchParams = useSearchParams();

  const depart = searchParams.get("depart") || "";
  const arrivee = searchParams.get("arrivee") || "";
  const date = searchParams.get("date") || "";
  // const voyageurs = searchParams.get("voyageurs") || "";

  const agences = [
    {
      img: "/images/carfor.jpeg",
      nomAgence: "Okavoyage",
      typeAgence: "Agence Publique",
      tarifAdulte: "5000 FCFA",
      tarifEnfant: "2500 FCFA",
      fraisService: "1000 FCFA",
      convocation: "30 min avant",
      depart,
      arrivee,
    },
    {
      img: "/images/chauf-indé.jpeg",
      nomAgence: "TransAfrik",
      typeAgence: "Agence Publique",
      tarifAdulte: "4500 FCFA",
      tarifEnfant: "2000 FCFA",
      fraisService: "800 FCFA",
      convocation: "45 min avant",
      depart,
      arrivee,
    },
    {
      img: "/images/car-one.jpeg",
      nomAgence: "ExpressGabon",
      typeAgence: "Bus VIP",
      tarifAdulte: "6000 FCFA",
      tarifEnfant: "3000 FCFA",
      fraisService: "1200 FCFA",
      convocation: "1h avant",
      depart,
      arrivee,
    },
    {
      img: "/images/car-five.jpeg",
      nomAgence: "Tropical Cars",
      typeAgence: "Agence Privé",
      tarifAdulte: "7000 FCFA",
      tarifEnfant: "3500 FCFA",
      fraisService: "1500 FCFA",
      convocation: "20 min avant",
      depart,
      arrivee,
    },
  ];

  // On découpe en deux groupes de 2 agences
  const firstRow = agences.slice(0, 2);
  const secondRow = agences.slice(2);

  return (
    <>
      <NavBar />
      <div className="flex flex-col gap-8 pt-16">
        <div className="flex flex-wrap justify-center gap-5">
          {firstRow.map((agence, index) => (
            <CardAgence key={index} {...agence} />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {secondRow.map((agence, index) => (
            <CardAgence key={index + 2} {...agence} />
          ))}
        </div>
      </div>
    </>
  );
}
