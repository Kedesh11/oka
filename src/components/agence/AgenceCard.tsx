import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FiPhone, FiMapPin } from 'react-icons/fi';

// Définition des types pour les props du composant
interface Trajet {
  id: number;
  depart: string;
  arrivee: string;
  heure: string;
  prixAdulte: number;
  prixEnfant: number;
}

interface Agence {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  trajets: Trajet[];
  // Ajout de champs pour correspondre à la maquette
  logoUrl?: string;
  imageUrl?: string;
}

interface AgenceCardProps {
  agence: Agence;
  onSelect: (agenceName: string, trajet: Trajet) => void;
}

const AgenceCard: React.FC<AgenceCardProps> = ({ agence, onSelect }) => {
  const firstTrajet = agence.trajets?.[0];

  // Trouver le prix le plus bas parmi les trajets de l'agence
  const lowestPrice = agence.trajets.reduce((min, t) => (t.prixAdulte < min ? t.prixAdulte : min), Infinity);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out w-full font-sans group flex flex-col">
      <div className="relative">
        <Image
          src={agence.imageUrl || '/images/provinces/gabon-1.jpg'} // Image placeholder améliorée
          alt={`Image de l'agence ${agence.name}`}
          width={400}
          height={200}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-0 right-0 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-bl-lg">
          Disponible
        </div>
        <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
            <h2 className="text-white text-2xl font-bold truncate">{agence.name}</h2>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-gray-800 font-bold text-lg">
              {firstTrajet ? `${firstTrajet.depart} → ${firstTrajet.arrivee}` : 'Trajet non spécifié'}
          </p>
          <div className="text-gray-500 text-sm mt-2 space-y-1">
              {agence.address && (
                  <div className="flex items-center">
                      <FiMapPin className="mr-2 flex-shrink-0" />
                      <span>{agence.address}</span>
                  </div>
              )}
              {agence.phone && (
                  <div className="flex items-center">
                      <FiPhone className="mr-2 flex-shrink-0" />
                      <span>{agence.phone}</span>
                  </div>
              )}
          </div>

          <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-600">Départs du jour :</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                  {agence.trajets.length > 0 ? (
                      agence.trajets.map(t => (
                          <span key={t.id} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t.heure}</span>
                      ))
                  ) : (
                      <p className="text-xs text-gray-500">Aucun départ programmé.</p>
                  )}
              </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <div>
            <p className="text-gray-500 text-sm">À partir de</p>
            <p className="text-xl font-bold text-gray-900">
              {lowestPrice !== Infinity ? `${lowestPrice.toLocaleString()} FCFA` : 'N/A'}
            </p>
          </div>
          {firstTrajet && (
             <Button 
                variant="default"
                className="bg-green-600 text-white font-bold hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg rounded-lg px-6 py-2"
                onClick={() => onSelect(agence.name, firstTrajet)}>
                Choisir
             </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgenceCard;
