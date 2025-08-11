"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Import des icônes

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="w-full fixed top-0 left-0  z-50 bg-[#01be65] shadow-md px-6 py-2">
      <div className="flex justify-between items-center">
        {/* Logo avec fond blanc et padding */}
        <Link href="/">
          <div className="">
            <Image
              src="/images/okalogo.png"
              alt="Oka Logo"
              width={100}
              height={100}
              className="cursor-pointer"
            />
          </div>
        </Link>

        {/* Bouton Menu Hamburger (Mobile) */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu Principal (Desktop) */}
        <ul className="hidden md:flex gap-6 text-white font-medium">
          <li>
            <Link href="/" className="hover:text-green-200 transition">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/a-propos" className="hover:text-green-200 transition">
              À propos
            </Link>
          </li>
          <li>
            <Link href="/faq" className="hover:text-green-200 transition">
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/conctact" className="hover:text-green-200 transition">
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Menu Mobile (affiché si isOpen est true) */}
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-full left-0 w-full bg-white shadow-md transition-all duration-300 ease-in-out"
        >
          <ul className="flex flex-col gap-4 p-4 text-gray-700 font-medium">
            <li>
              <Link
                href="/"
                className="block py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href="/a-propos"
                className="block py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="block py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/conctact"
                className="block py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
