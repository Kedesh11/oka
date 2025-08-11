"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TicketCheck, MapPinCheck, MapPinned } from "lucide-react";
import { GiTakeMyMoney } from "react-icons/gi";
import { Clock3 } from "lucide-react";

interface AgenceProps {
  img: string;
  nomAgence: string;
  typeAgence: string;
  tarifAdulte: string;
  tarifEnfant: string;
  fraisService: string;
  convocation: string;
  depart: string;
  arrivee: string;
}

export default function CardAgence({
  img,
  nomAgence,
  typeAgence,
  tarifAdulte,
  tarifEnfant,
  fraisService,
  convocation,
  depart,
  arrivee,
}: AgenceProps) {
  return (
    <div className="w-full px-4 md:px-0 md:w-[48%]">
      {/* 💡 Layout responsive : horizontal sur desktop, vertical sur mobile */}
      <Card className="flex flex-col md:flex-row overflow-hidden shadow-md">
        {/* 🖼️ Image : au-dessus sur mobile, à gauche sur desktop */}
        <div className="relative w-full md:w-1/3 h-60 md:h-auto">
          <Image
            src={img}
            alt="Image-agence"
            fill
            className="object-cover md:rounded-l-md md:rounded-tr-none rounded-t-md"
          />
        </div>

        {/* 📝 Texte : à droite ou en dessous selon l’écran */}
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-black text-lg font-bold">
              <p className="Nom-agence text-green-500 font-light">
                {nomAgence}
              </p>
              <span className="type-agence">{typeAgence}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2 items-start">
              <TicketCheck />
              <div>
                <h4 className="font-medium">Tarifs par billets :</h4>
                <div className="statut-voyageur">
                  <p>Adulte : {tarifAdulte}</p>
                  <p>Enfant : {tarifEnfant}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <GiTakeMyMoney size={20} />
              <p>
                Frais de service :{" "}
                <span className="frais-de-service">{fraisService}</span>
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Clock3 size={20} />
              <p>
                Convocation : <span className="convocation">{convocation}</span>
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <MapPinCheck />
              <p>
                Départ : <span className="départ">{depart}</span>
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <MapPinned />
              <p>
                Arrivée : <span className="arrivé">{arrivee}</span>
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="bg-green-500 text-white w-full">Valider</Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
