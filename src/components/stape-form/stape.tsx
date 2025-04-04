"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { UserPlus, X, Download } from "lucide-react";

type Voyageur = {
  nom: string;
  prenom: string;
  telephone: string;
  sexe: string;
  statut: string;
};

type VoyageurField = keyof Voyageur;

const StepForm = () => {
  const [step, setStep] = useState(1);
  const [voyageurs, setVoyageurs] = useState<Voyageur[]>([
    { nom: "", prenom: "", telephone: "", sexe: "", statut: "" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ticketReady, setTicketReady] = useState(false);
  const [errors, setErrors] = useState<
    Record<number, Record<VoyageurField, boolean>>
  >({});

  const validateStep1 = () => {
    const newErrors: Record<number, Record<VoyageurField, boolean>> = {};
    let isValid = true;

    voyageurs.forEach((voyageur, index) => {
      newErrors[index] = {} as Record<VoyageurField, boolean>;
      (Object.keys(voyageur) as VoyageurField[]).forEach((key) => {
        if (!voyageur[key]) {
          newErrors[index][key] = true;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleVoyageurChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const updatedVoyageurs = [...voyageurs];
    const field = e.target.name as VoyageurField;
    updatedVoyageurs[index][field] = e.target.value;
    setVoyageurs(updatedVoyageurs);

    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      newErrors[index][field] = false;
      setErrors(newErrors);
    }
  };

  const handleAddVoyageur = () => {
    if (voyageurs.length < 5) {
      setVoyageurs([
        ...voyageurs,
        { nom: "", prenom: "", telephone: "", sexe: "", statut: "" },
      ]);
    }
  };

  const handleRemoveVoyageur = (index: number) => {
    if (voyageurs.length > 1) {
      setVoyageurs(voyageurs.filter((_, i) => i !== index));
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handlePaymentSubmit = () => {
    if (!paymentMethod || !paymentNumber) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTicketReady(true);
    }, 30000);
  };

  const generateTicket = () => {
    const ticketContent = `
      Billet de voyage
      ================
      
      Voyageurs:
      ${voyageurs
        .map(
          (v, i) => `
      Voyageur ${i + 1}:
      - Nom: ${v.nom}
      - Prénom: ${v.prenom}
      - Téléphone: ${v.telephone}
      - Sexe: ${v.sexe}
      - Statut: ${v.statut}
      `
        )
        .join("\n")}
      
      Paiement:
      - Méthode: ${paymentMethod}
      - Numéro: ${paymentNumber}
      - Date: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "billet-voyage.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center items-center h-screen p-4">
      <div className="w-full max-w-2xl p-6 bg-[#F1F1F1] text-black rounded-lg shadow-xl">
        {/* Barre de progression centrée */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            {[1, 2, 3].map((num, index) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-bold
                    ${step >= num ? "bg-green-400" : "bg-gray-600"}`}
                >
                  {num}
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      step > num ? "bg-green-400" : "bg-gray-600"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Étape 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-green-400 mb-4">Étape 1</h2>

            {voyageurs.map((voyageur, index) => (
              <div
                key={index}
                className="relative bg-white p-4 rounded-lg shadow-md mb-4"
              >
                {index > 0 && (
                  <button
                    className="absolute top-2 right-2 text-red-500"
                    onClick={() => handleRemoveVoyageur(index)}
                  >
                    <X />
                  </button>
                )}
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  {index === 0
                    ? "Information du voyageur"
                    : `Voyageur ${index + 1}`}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <input
                      type="text"
                      name="nom"
                      value={voyageur.nom}
                      onChange={(e) => handleVoyageurChange(index, e)}
                      placeholder="Nom"
                      className={`w-full p-2 border rounded-md outline-none ${
                        errors[index]?.nom
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[index]?.nom && (
                      <p className="text-red-500 text-sm mt-1">
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="prenom"
                      value={voyageur.prenom}
                      onChange={(e) => handleVoyageurChange(index, e)}
                      placeholder="Prénom"
                      className={`w-full p-2 border rounded-md outline-none ${
                        errors[index]?.prenom
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[index]?.prenom && (
                      <p className="text-red-500 text-sm mt-1">
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <input
                    type="tel"
                    name="telephone"
                    value={voyageur.telephone}
                    onChange={(e) => handleVoyageurChange(index, e)}
                    placeholder="N° Tel"
                    className={`w-full p-2 border rounded-md outline-none ${
                      errors[index]?.telephone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[index]?.telephone && (
                    <p className="text-red-500 text-sm mt-1">
                      Ce champ est requis
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      name="sexe"
                      value={voyageur.sexe}
                      onChange={(e) => handleVoyageurChange(index, e)}
                      className={`w-full p-2 border rounded-md outline-none ${
                        errors[index]?.sexe
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Sexe</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                    {errors[index]?.sexe && (
                      <p className="text-red-500 text-sm mt-1">
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                  <div>
                    <select
                      name="statut"
                      value={voyageur.statut}
                      onChange={(e) => handleVoyageurChange(index, e)}
                      className={`w-full p-2 border rounded-md outline-none ${
                        errors[index]?.statut
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Statut</option>
                      <option value="Adulte">Adulte +12ans</option>
                      <option value="Enfant">Enfant -12ans</option>
                    </select>
                    {errors[index]?.statut && (
                      <p className="text-red-500 text-sm mt-1">
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="">
              <Button
                onClick={handleAddVoyageur}
                className={`border-2 border-green-500 bg-slate-100 text-green-500 p-2 mt-3 ${
                  voyageurs.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={voyageurs.length >= 5}
              >
                <UserPlus />
                <p>Ajouter un voyageur</p>
              </Button>
            </div>

            <div className="flex justify-end mt-4 ">
              <Button
                onClick={handleNext}
                className="p-2 w-32 rounded-md border-2 border-green-500 bg-slate-100 text-green-500"
              >
                Suivant »
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-green-400 mb-4">Étape 2</h2>
            <p className="text-red-400 text-center mb-6">
              Vérifiez que vos informations sont correctes
            </p>

            <div className="space-y-4 mb-6">
              {voyageurs.map((voyageur, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold mb-2">
                    {index === 0
                      ? "Voyageur principal"
                      : `Voyageur ${index + 1}`}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      <span className="font-semibold">Nom:</span> {voyageur.nom}
                    </p>
                    <p>
                      <span className="font-semibold">Prénom:</span>{" "}
                      {voyageur.prenom}
                    </p>
                    <p>
                      <span className="font-semibold">Téléphone:</span>{" "}
                      {voyageur.telephone}
                    </p>
                    <p>
                      <span className="font-semibold">Sexe:</span>{" "}
                      {voyageur.sexe}
                    </p>
                    <p>
                      <span className="font-semibold">Statut:</span>{" "}
                      {voyageur.statut}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-5">
              <Button
                onClick={handlePrev}
                className="border-2 border-green-500 bg-slate-100 text-green-500 rounded p-2"
              >
                « Précédent
              </Button>
              <Button
                onClick={handleNext}
                className="border-2 border-green-500 bg-slate-100 text-green-500 rounded p-2"
              >
                Suivant »
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3 */}
        {step === 3 && (
          <div>
            <h2 className="text-green-400 mb-4">Étape 3</h2>

            {!ticketReady ? (
              <>
                <p className="mb-6 text-center">
                  Choisissez votre service de paiement
                </p>
                <div className="flex justify-center items-center gap-10 mb-8">
                  <button
                    onClick={() => setPaymentMethod("Airtel Money")}
                    className={`p-4 rounded-md border-2 ${
                      paymentMethod === "Airtel Money"
                        ? "border-red-500 bg-red-500"
                        : "border-red-500 bg-red-500"
                    }`}
                  >
                    <Image
                      src="/images/logo-money/Airtel.png"
                      alt="Airtel Logo"
                      width={100}
                      height={100}
                      className="cursor-pointer"
                    />
                  </button>
                  <button
                    onClick={() => setPaymentMethod("Moov Money")}
                    className={`p-4 rounded-md border-2 ${
                      paymentMethod === "Moov Money"
                        ? "border-yellow-500 bg-yellow-500"
                        : "border-yellow-500 bg-yellow-500"
                    }`}
                  >
                    <Image
                      src="/images/logo-money/moov.png"
                      alt="Moov Logo"
                      width={70}
                      height={70}
                      className="cursor-pointer"
                    />
                  </button>
                </div>

                {paymentMethod && (
                  <div className="mb-6">
                    <label className="block mb-2">
                      Numéro {paymentMethod}:
                    </label>
                    <input
                      type="tel"
                      value={paymentNumber}
                      onChange={(e) => setPaymentNumber(e.target.value)}
                      placeholder={`Entrez votre numéro ${paymentMethod}`}
                      className="w-full p-2 border border-gray-300 rounded-md outline-none"
                    />
                  </div>
                )}

                {isLoading ? (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p>Traitement du paiement en cours...</p>
                      <p>Veuillez patienter 30 secondes</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <Button
                      onClick={handlePrev}
                      className="bg-gray-400 p-2 w-32 rounded-md"
                    >
                      « Précédent
                    </Button>
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={!paymentMethod || !paymentNumber}
                      className="bg-green-500 p-2 w-32 rounded-md text-white disabled:opacity-50"
                    >
                      Valider
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  Paiement effectué avec succès!
                </div>
                <Button
                  onClick={generateTicket}
                  className="bg-green-500 text-white p-2 rounded-md flex items-center mx-auto"
                >
                  <Download className="mr-2" />
                  Télécharger le billet
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepForm;
