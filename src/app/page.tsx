import Image from "next/image";
import NavBar from "@/components/navBar";
import Province from "@/components/province";
import DestinationCard from "@/components/card-home/destinationCard";
import DestinationCardTwo from "@/components/card-home/destinationCardTwo";
import DestinationCardThree from "@/components/card-home/destinationCardThree";
import DestinationCardFor from "@/components/card-home/destinationCardFor";

export default function Home() {
  return (
    <div className="md:px-12 md:py-2 ">
      <NavBar />
      <Province />
      <div className="flex justify-center items-center gap-4 p-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/4">
          <DestinationCard />
        </div>
        <div className="w-full md:w-1/4">
          <DestinationCardTwo />
        </div>
        <div className="w-full md:w-1/4">
          <DestinationCardThree />
        </div>
        <div className="w-full md:w-1/4">
          <DestinationCardFor />
        </div>
      </div>
    </div>
  );
}
