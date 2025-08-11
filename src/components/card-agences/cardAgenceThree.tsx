"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TicketCheck, MapPinCheck, MapPinned } from "lucide-react";
import { GiTakeMyMoney } from "react-icons/gi";
import { Clock3 } from "lucide-react";

export default function cardAgenceThree() {
  return (
    <div>
      <section>
        <div>
          <div className="w-96">
            <Card>
              <CardHeader>
                <Image
                  src="/images/car-two.jpeg"
                  alt="Oka Logo"
                  width={400}
                  height={80}
                  className="cursor-pointer rounded-md"
                />
                <CardTitle className="text-green-500 text-lg font-bold">
                  Trans-urb
                </CardTitle>
                <CardDescription>Agence de voyage public </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="flex gap-2">
                    <div className="flex gap-2">
                      <TicketCheck />
                      <h4>Tarifs par billets :</h4>
                    </div>
                    <div>
                      <p>Adulte : 12000 Fr</p>
                      <p>Enfant : 12000 Fr</p>
                    </div>
                  </div>
                  {/* Frais de service */}
                  <div className="">
                    <div className="flex gap-2 py-2">
                      <GiTakeMyMoney size={20} />
                      <div className="flex gap-2">
                        <p>Frais de service :</p>
                        <p>1500 Fr par billet</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Clock3 size={20} />
                      <div className="flex gap-2">
                        <p>Convocation :</p>
                        <p>
                          <span>6h 00 mn</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 py-2">
                      <MapPinCheck />
                      <div className="flex gap-2">
                        <p>Départ:</p>
                        <p>
                          <span></span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 py">
                      <MapPinned />
                      <div className="flex gap-2">
                        <p>Arrivée:</p>
                        <p>
                          <span></span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-green-500 text-white w-full">
                  Valider
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div></div>
        </div>
      </section>
    </div>
  );
}
