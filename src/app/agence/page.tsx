"use client";
import React from "react";
import NavBar from "@/components/navBar";
import CardAgence from "@/components/card-agences/cardAgence";
import CardAgenceTwo from "@/components/card-agences/cardAgenceTwo";
import CardAgenceThree from "@/components/card-agences/cardAgenceThree";
import CardAgenceFor from "@/components/card-agences/cardAgenceFor";
import Footer from "@/components/footer";

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
      <section className="flex-col pb-5  gap-10 md:flex md:justify-center md:items-center">
        <div className="flex-col flex pb-5 justify-between  md:flex-row lg:flex-row xl:flex-row gap-10">
          <CardAgenceFor />
          <CardAgenceTwo />
        </div>
        <div className="flex-col flex justify-between  md:flex-row lg:flex-row xl:flex-row gap-10">
          <CardAgenceThree />
          <CardAgence />
        </div>
      </section>
      <div className="">
        <Footer />
      </div>
    </div>
  );
};

export default page;
