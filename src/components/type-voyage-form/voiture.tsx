import React, { useState } from "react";
//Ajout : importation du hook useRouter de Next.js
import { useRouter } from "next/navigation";

import { Combobox } from "../combobox";
import DatePicker from "../date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

const lieux = [
  { label: "Franceville", value: "Franceville" },
  { label: "Lambaréné", value: "Lambaréné" },
  { label: "Libreville", value: "Libreville" },
  { label: "Mouila", value: "Mouila" },
  { label: "Oyem", value: "Oyem" },
  { label: "Bitam", value: "Bitam" },
];

const FormVoiture = () => {
  // Ajout : Initialisation du router pour faire une redirection
  const router = useRouter();
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [selectedValueStart, setSelectedValueStart] = useState("");
  const [selectedValueEnd, setSelectedValueEnd] = useState("");
  const [date, setDate] = useState<Date>();

  const handleDateChange = (newDate?: Date) => {
    setDate(newDate);
    console.log("Date sélectionnée :", newDate);
  };

  const handleSelectStart = (value: string) => {
    setSelectedValueStart(value);
  };

  const handleSelectEnd = (value: string) => {
    setSelectedValueEnd(value);
  };

  // Ajout : fonction pour intercepter la soumission du formulaire et rediriger vers /agence
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams({
      depart: selectedValueStart,
      arrivee: selectedValueEnd,
      date: date?.toISOString() || "",
      voyageurs: "1", // ici tu peux récupérer dynamiquement si tu veux
    });

    router.push(`/agence?${params.toString()}`);
  };

  return (
    // Ajout : onSubmit qui appelle handleSubmit lors de la soumission du formulaire
    <form className="flex flex-col gap-y-7 mt-7" onSubmit={handleSubmit}>
      <div className="flex flex-row justify-between items-center">
        <Combobox
          options={lieux}
          open={openStart}
          onOpenChange={setOpenStart}
          onSelect={handleSelectStart}
          selectedValue={selectedValueStart}
          type="start"
        />

        <Combobox
          options={lieux}
          open={openEnd}
          onOpenChange={setOpenEnd}
          onSelect={handleSelectEnd}
          selectedValue={selectedValueEnd}
          type="end"
        />
      </div>
      <DatePicker date={date} setDate={handleDateChange} />

      <Input
        type="number"
        placeholder="Nombre de voyageurs"
        className="bg-white h-10 text-md focus:outline-none"
      />

      <Button
        //Ajout : type="submit" pour déclencher la soumission du formulaire
        type="submit"
        variant={"ps"}
        size={"ps"}
        className="bg-green-500 h-10 text-white font-bold text-md"
      >
        Recherche
      </Button>
    </form>
  );
};

export default FormVoiture;
