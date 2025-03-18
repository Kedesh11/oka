import React from "react";
import NavBar from "@/components/navBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import Footer from "@/components/footer";

const Page = () => {
  return (
    <div>
      <NavBar />

      {/* Section avec image de fond */}
      <section
        className="relative bg-center bg-no-repeat bg-cover h-40 flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/Aéroport-Libreville.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <h1 className="relative z-10 text-3xl text-white font-bold">
          Contactez-nous
        </h1>
      </section>

      {/* Conteneur des cartes */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte Localisation */}
          <Card className="border border-green-500 rounded-lg p-6 text-center">
            <div className="flex justify-center text-green-500 mb-4">
              <MapPin size={50} />
            </div>
            <CardHeader>
              <CardTitle className="text-green-500 text-lg font-bold">
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black text-sm">
                Nous sommes situés à BICIG en ville, Rue Ange Mba.
              </p>
            </CardContent>
          </Card>

          {/* Carte Contact Téléphone */}
          <Card className="border border-green-500 rounded-lg p-6 text-center">
            <div className="flex justify-center text-green-500 mb-4">
              <Phone size={50} />
            </div>
            <CardHeader>
              <CardTitle className="text-green-500 text-lg font-bold">
                Nous sommes disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black text-sm">
                Contactez-nous par appel et sur WhatsApp : 077172820.
              </p>
            </CardContent>
          </Card>

          {/* Carte Email */}
          <Card className="border border-green-500 rounded-lg p-6 text-center">
            <div className="flex justify-center text-green-500 mb-4">
              <Mail size={50} />
            </div>
            <CardHeader>
              <CardTitle className="text-green-500 text-lg font-bold">
                Laissez-nous un mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black text-sm">
                Contactez-nous sur contact-oka@gmail.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
