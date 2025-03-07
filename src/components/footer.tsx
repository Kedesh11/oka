import React from "react";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  return (
    <div className="flex justify-between items-center w-full bg-[#00BF63] h-12 px-3 py-3 text-white">
      <div>
        <h3>Copyright by IFUMBA 2024 Tous droits réservés</h3>
      </div>
      <div className="text-2xl">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition-colors"
        >
          <FaFacebook />
        </a>
      </div>
    </div>
  );
}

export default Footer;
