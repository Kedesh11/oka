"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

function destinationCard() {
  return (
    <Card className="border border-green-500 rounded-lg p-6 text-center max-w-sm mx-auto">
      {/* Icône en haut */}
      <div className="flex justify-center mb-4">
        <Image
          src="/images/icone-card/destination.png"
          alt="Destination Icon"
          width={40}
          height={40}
        />
      </div>

      {/* Titre en vert */}
      <CardHeader>
        <CardTitle className="text-green-500 text-lg font-bold">
          DESTINATION MULTIPLE
        </CardTitle>
      </CardHeader>

      {/* Contenu de la carte */}
      <CardContent>
        <p className="text-black text-sm">
          Voyagez sans limites grâce à notre large gamme d’options sur un vaste
          choix de trajets.
        </p>
      </CardContent>
    </Card>
  );
}

export default destinationCard;
