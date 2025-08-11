"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Province() {
  const images = [
    "/images/provinces/prov1.jpg",
    "/images/provinces/prov2.jpg",
    "/images/provinces/prov3.jpg",
    "/images/provinces/prov4.jpg",
    "/images/provinces/prov5.jpg",
    "/images/provinces/prov6.jpg",
    "/images/provinces/prov7.jpg",
    "/images/provinces/prov8.jpg",
    "/images/provinces/prov9.jpg",
  ];
  console.log(images);

  return (
    <div className="bg-gray-100 pb-7 px-5">
      {/* Titre de la section */}
      <div className="text-center sm:text-xl md:text-3xl text-green-500 font-bold py-5">
        <h2>Voyagez vers toutes les destinations au Gabon</h2>
      </div>

      {/* Conteneur principal avec fond blanc */}
      <div className="bg-white p-5 rounded-lg shadow-lg overflow-hidden">
        {/* Affichage en flex sur desktop uniquement (lg et plus) */}
        <div className="hidden lg:flex justify-center items-center gap-3 px-10">
          {images.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Province ${index + 1}`}
              width={150}
              height={150}
              className="lg:w-[150px] lg:h-[150px]"
            />
          ))}
        </div>

        {/* Slider Swiper pour mobile et tablette (md et moins) */}
        <div className="lg:hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className="w-full max-w-xs mx-auto"
          >
            {images.map((src, index) => (
              <SwiperSlide key={index}>
                <div className="flex justify-center bg-white p-3 rounded-lg shadow-md">
                  <Image
                    src={src}
                    alt={`Province ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-[80px] h-[80px]"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default Province;
