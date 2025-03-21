"use client";
import React from "react";
import NavBar from "@/components/navBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import Footer from "@/components/footer";

const Page = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* Section Contact */}
      <section className="flex flex-col md:flex-row h-[100vh]">
        {/* Partie Image de contact */}
        <div
          className="hidden w-full h-full md:w-1/2 md:flex md:justify-center md:items-center bg-cover bg-center relative text-white p-8"
          style={{
            backgroundImage: "url('/images/Aéroport-Libreville.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <h2 className="relative z-10 text-3xl font-bold">Nous contacter</h2>
        </div>

        {/* Partie Informations */}
        <div className="w-full h-full md:w-1/2 flex flex-col justify-center items-center bg-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Nos coordonnées
          </h2>

          {/* Disposition des cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
            {/* Localisation */}
            <Card className="border border-green-500 rounded-lg p-4 text-center shadow-md">
              <div className="flex justify-center text-green-500 mb-2">
                <MapPin size={40} />
              </div>
              <CardHeader>
                <CardTitle className="text-green-500 text-md font-bold">
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Rue Ange Mba, Libreville
                </p>
              </CardContent>
            </Card>

            {/* Téléphone */}
            <Card className="border border-green-500 rounded-lg p-4 text-center shadow-md">
              <div className="flex justify-center text-green-500 mb-2">
                <Phone size={40} />
              </div>
              <CardHeader>
                <CardTitle className="text-green-500 text-md font-bold">
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">+241 07 71 72 820</p>
              </CardContent>
            </Card>

            {/* Carte Email (Occupe toute la largeur sur desktop) */}
            <Card className="border border-green-500 rounded-lg p-4 text-center shadow-md md:col-span-2">
              <div className="flex justify-center text-green-500 mb-2">
                <Mail size={40} />
              </div>
              <CardHeader>
                <CardTitle className="text-green-500 text-md font-bold">
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">contact-oka@gmail.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer qui occupe toute la largeur */}
      <Footer />
    </div>
  );
};

export default Page;
