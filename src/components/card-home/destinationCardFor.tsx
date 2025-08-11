"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

function destinationCardTwo() {
  return (
    <div>
      <Card className="border border-green-500 rounded-lg p-6 text-center max-w-sm mx-auto">
        {/* Icône en haut */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/icone-card/innovation.png"
            alt="Destination Icon"
            width={40}
            height={40}
          />
        </div>

        {/* Titre en vert */}
        <CardHeader>
          <CardTitle className="text-green-500 text-lg font-bold">
            INNOVATION
          </CardTitle>
        </CardHeader>

        {/* Contenu de la carte */}
        <CardContent>
          <p className="text-black text-sm">
            Nous repoussons les limites de l’innovation pour vous offrir des
            solutions performantes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default destinationCardTwo;
