import React from "react";
import NavBar from "@/components/navBar";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const page = () => {
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
          A propos de nous
        </h1>
      </section>

      {/* A propos de Oka-voyage  */}
      <div className="flex justify-center items-center gap-10 py-10 px-5">
        <div className="flex justify-center items-center py-10 w-1/2 bg-green-500 border-2 border-black">
          <Image
            src="/images/okalogo.png"
            alt="le logo de Oka-voyage"
            width={400}
            height={400}
          />
        </div>
        <div className="w-1/2">
          <div>
            <p>
              <span className="text-green-500 font-bold text-xl">
                Oka-Voyage
              </span>{" "}
              est votre solution pratique et sécurisée pour acheter vos billets
              de voyage en ligne au Gabon. Grâce à notre plateforme intuitive,
              réservez facilement vos trajets en bus en quelques clics, sans
              avoir à vous déplacer. Nous vous offrons un large choix de
              compagnies, des horaires flexibles et des tarifs avantageux pour
              rendre vos déplacements plus simples et accessibles. Optez pour un
              service rapide, fiable et 100 % digital avec Oka Voyage ! 🚍✨
            </p>
          </div>
          <div className="pt-5">
            <Button className="bg-green-500 h-12 w-34 hover:bg-green-700">
              <Link href="/" className="">
                Acheter un billet
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
