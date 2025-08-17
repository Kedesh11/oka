import React from "react";
import { FaFacebook } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

function Footer() {
  return (
    <div className="flex justify-center items-center w-full bg-[#01be65] h-12 px-3 py-3 xl:gap-x-6 gap-x-2 text-white">
      <div>
        <h3 className="xl:text-lg text-sm">
          Copyright by IFUMB {new Date().getFullYear()} Tous droits réservés
        </h3>

      </div>
      <Separator orientation="vertical" className="w-0.5" />
      <div className="text-2xl">
        <a href="#" target="_blank" rel="noopener noreferrer">
          <FaFacebook />
        </a>
      </div>
    </div>
  );
}

export default Footer;
