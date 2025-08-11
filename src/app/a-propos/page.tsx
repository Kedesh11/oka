"use client"; // Force le rendu côté client

import React, { useState, useEffect } from "react";
import NavBar from "@/components/navBar";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

const accordionData = [
  {
    title: "Comment acheter un billet ?",
    content:
      "Pour acheter un billet, sélectionnez votre destination, choisissez votre date et votre compagnie de transport, puis procédez au paiement en ligne.",
  },
  {
    title: "Quels sont les moyens de paiement acceptés ?",
    content:
      "Nous acceptons les paiements via  MOOV MONEY  et AIRTEL MONEY pour un achat rapide et sécurisé.",
  },
  {
    title: "Puis-je modifier ou annuler ma réservation ?",
    content:
      "Oui, vous pouvez modifier ou annuler votre réservation jusqu'à 48h heures avant votre départ via votre espace client.",
  },
  {
    title: "Quels sont les documents nécessaires pour voyager ?",
    content:
      "Vous devez présenter une pièce d'identité valide et votre billet électronique pour embarquer dans le bus.",
  },
  {
    title: "Les billets sont-ils remboursables ?",
    content:
      "Les billets ne sont pas remboursables, mais vous pouvez les modifier sous certaines conditions en contactant notre service client.",
  },
  {
    title: "Comment contacter le service client ?",
    content:
      "Vous pouvez nous contacter via notre chat en ligne, par e-mail à support@oka-voyage.com ou par téléphone au +241 77-17-28-20.",
  },
  {
    title: "Puis-je réserver plusieurs billets en une seule commande ?",
    content:
      "Oui, vous pouvez réserver plusieurs billets en une seule transaction en ajoutant plusieurs passagers lors de la réservation.",
  },
  {
    title: "Quels sont les avantages d'acheter un billet en ligne ?",
    content:
      "Acheter un billet en ligne vous permet de gagner du temps, d'éviter les files d'attente et d'accéder à des offres exclusives.",
  },
  {
    title: "Les enfants doivent-ils avoir un billet ?",
    content:
      "Oui, chaque passager, y compris les enfants, doit avoir un billet valide pour voyager. Des réductions peuvent être disponibles pour les enfants.",
  },
  {
    title: "Y a-t-il des réductions pour les groupes ?",
    content:
      "Oui, nous proposons des réductions pour les groupes de 10 personnes ou plus. Contactez-nous pour obtenir une offre personnalisée.",
  },
];

const Page = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Assure que le composant est monté avant le rendu
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Section avec image de fond (cachée sur mobile et tablette) */}
      <section
        className="relative bg-center bg-no-repeat bg-cover h-40 md:flex items-center justify-center hidden "
        style={{ backgroundImage: "url('/images/Aéroport-Libreville.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <h1 className="relative z-10 text-3xl text-center  text-white font-bold">
          À propos de nous
        </h1>
      </section>

      {/* A propos de Oka-voyage (Visible uniquement en mode ordinateur) */}
      <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row justify-center items-center px-4 gap-5 py-10 ">
        {/* Logo (caché sur mobile et tablette) */}
        <div className="flex justify-center items-center py-10 w-1/2  bg-[#01be65] border-2 border-black">
          <Image
            src="/images/okalogo.png"
            alt="Logo de Oka-voyage"
            width={300}
            height={300}
            className=""
          />
        </div>

        {/* Texte visible sur mobile, tablette et ordinateur */}
        <div className=" max-w-lg md:w-full sm:w-full lg:w-1/2 xl:w-1/2 px-4  text-left">
          <p>
            <span className="text-green-500 font-bold text-xl">Oka-Voyage</span>{" "}
            est votre solution pratique et sécurisée pour acheter vos billets de
            voyage en ligne au Gabon. Grâce à notre plateforme intuitive,
            réservez facilement vos trajets en bus en quelques clics, sans avoir
            à vous déplacer.
          </p>

          {/* Bouton */}
          <div className="pt-5">
            <Button className="bg-green-500 h-12 w-34 hover:bg-green-700">
              <Link href="/">Acheter un billet</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Section Accordéons */}
      {isClient && (
        <div className="px-10 md:px-20 bg-slate-50  py-16 rounded  ">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Question fréquentes
          </h2>
          {accordionData.map((item, index) => (
            <div key={index} className="border-b border-gray-300">
              <button
                className="flex justify-between w-full py-4 text-left text-gray-700 font-medium focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <span>{item.title}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5L5 1 1 5"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="py-4 text-gray-600">{item.content}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* footer */}
      <Footer />
    </div>
  );
};

export default Page;
