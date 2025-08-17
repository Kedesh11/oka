"use client";

import React from "react";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export default function DashboardPage() {
  return (
    <div className="flex h-full">
      {/* Sidebar par défaut */}
      <div className="flex-shrink-0 h-full overflow-y-auto">
        <AdminSidebar />
      </div>
      {/* Contenu principal avec scroll */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#01be65]">Tableau de bord</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#01be65]">
              <h2 className="text-xl font-semibold mb-4 text-[#01be65]">Bienvenue sur Oka Voyage</h2>
              <p className="text-gray-600">
                Sélectionnez une section dans la sidebar pour commencer à gérer votre plateforme de transport.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Sections disponibles</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Admin : Gestion complète du système</li>
                <li>• Agence : Interface agence de transport</li>
                <li>• Trajets : Gestion des itinéraires</li>
                <li>• Voyages : Planification des voyages</li>
                <li>• Réservations : Suivi des réservations</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Statistiques rapides</h3>
              <div className="space-y-2 text-gray-600">
                <p>Connectez-vous à une section pour voir les statistiques détaillées.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
