'use client'
import React, { useState } from 'react';
import FormVoiture from './type-voyage-form/voiture';
import FormAvion from './type-voyage-form/avion';
import FormTrain from './type-voyage-form/train';
import FormBateau from './type-voyage-form/bateau';
import { FaCar, FaTrainSubway, FaPlane } from "react-icons/fa6";
import { IoIosBoat } from "react-icons/io";
import { Button } from './ui/button';

type TypeVoyage = {
  type: string;
  component: () => React.JSX.Element;
  image: string;
}

const type_voyage: TypeVoyage[] = [
  { type: 'voiture', component: FormVoiture, image: '/images/bus.jpg'},
  { type: 'train', component: FormTrain, image: '/images/train.jpeg'},
  { type: 'avion', component: FormAvion, image: '/images/avion.jpeg'},
  { type: 'bateau', component: FormBateau, image: '/images/bateau.jpeg'},
]

const Hero = () => {

  const [selectTypeVoyage, setSelectTypeVoyage] = useState<TypeVoyage>(type_voyage[0])

  const handleChangeTypeVoyage = (type: string) => {

    const typeVoyageFind = type_voyage.find(item => item.type.toLowerCase() === type.toLowerCase())
    if (typeVoyageFind) setSelectTypeVoyage(typeVoyageFind)

  }

  return (
    <div style={{
      backgroundImage: `url(${selectTypeVoyage.image})`,
      backgroundSize: 'cover', // Redimensionne l'image pour couvrir toute la div
      backgroundPosition: 'center', // Centre l'image dans la div
      backgroundRepeat: 'no-repeat', // Empêche la répétition de l'image
    }} 
      className='w-full h-[500px] flex flex-row items-center xl:justify-between justify-center xl:px-10 px-2'
    >
      <div className='hidden xl:flex'></div>
      <div className='bg-black/10 xl:w-[400px] w-[380px] rounded-md border border-white xl:p-8 p-3'>
         <div className='flex flex-row justify-around items-center'>
            {type_voyage.map((item, index) => (
              <button key={index} className={`${item.type === selectTypeVoyage.type ?'bg-green-500': 'bg-white'} py-1 px-2 rounded-md`} onClick={() => handleChangeTypeVoyage(item.type)}>
                {item.type==="voiture" ? (
                  <FaCar className='text-3xl'/>
                ): item.type==="train" ? (
                  <FaTrainSubway className='text-3xl'/>
                ): item.type==="avion" ? (
                  <FaPlane className='text-3xl'/>
                ): (
                  <IoIosBoat className='text-3xl'/>
                )}
              </button>
            ))}
         </div>
         <selectTypeVoyage.component/>
      </div>
    </div>
  )
}

export default Hero