"use client";
import React from "react";
import NavBar from "@/components/navBar";
import CardAgence from "@/components/card-agences/cardAgence";

const page = () => {
  return (
    <div>
      <NavBar />
      <div className="py-10">
        <h1 className="pt-10 text-2xl font-bold text-center">
          Choisissez votre compagnie de voyage
        </h1>
      </div>
      {/* card agence component */}
      <section className="flex-col px-5 gap-10 md:flex md:justify-center md:items-center">
        <div className="flex-col flex justify-between  md:flex-row lg:flex-row xl:flex-row gap-10">
          <CardAgence />
          <CardAgence />
        </div>
        <div className="flex-col flex justify-between  md:flex-row lg:flex-row xl:flex-row gap-10">
          <CardAgence />
          <CardAgence />
        </div>
      </section>
    </div>
  );
};

export default page;
