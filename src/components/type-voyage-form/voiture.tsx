import React, { useState } from 'react';
import { Combobox } from '../combobox';
import DatePicker from '../date-picker';
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';

const lieux = [
  {label: "Franceville", value: "Franceville"},
  {label: "Lambaréné", value: "Lambaréné"},
  {label: "Libreville", value: "Libreville"},
  {label: "Oyem", value: "Oyem"},
  
]

const FormVoiture = () => {

   const [openStart, setOpenStart] = useState(false);
   const [openEnd, setOpenEnd] = useState(false);
   const [selectedValueStart, setSelectedValueStart] = useState('');
   const [selectedValueEnd, setSelectedValueEnd] = useState('');
   const [date, setDate] = useState<Date>()

   const handleDateChange = (newDate?: Date) => {
     setDate(newDate)
     console.log("Date sélectionnée :", newDate)
   }

   const handleSelectStart = (value: string) => {
    setSelectedValueStart(value);
  };

  const handleSelectEnd = (value: string) => {
    setSelectedValueEnd(value);
  };

  return (
    <form className='flex flex-col gap-y-7 mt-7'>
      <div className='flex flex-row justify-between items-center'>
        <Combobox
          options={lieux}
          open={openStart}
          onOpenChange={setOpenStart}
          onSelect={handleSelectStart}
          selectedValue={selectedValueStart}
          type='start'
        />

        <Combobox
          options={lieux}
          open={openEnd}
          onOpenChange={setOpenEnd}
          onSelect={handleSelectEnd}
          selectedValue={selectedValueEnd}
          type='end'
        />
      </div>
      <DatePicker 
        date={date}
        setDate={handleDateChange}
      />

      <Input type='number' placeholder='Nombre de voyageurs' className='bg-white h-10 text-md focus:outline-none'/>

      <Button variant={'ps'} size={'ps'} className='bg-green-500 h-10 text-white font-bold text-md'>
        Recherche
      </Button>

    </form>
  )
}

export default FormVoiture