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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="w-full">
          <DestinationCard />
        </div>
        <div className="w-full">
          <DestinationCardTwo />
        </div>
        <div className="w-full">
          <DestinationCardThree />
        </div>
        <div className="w-full">
          <DestinationCardFor />
        </div>
      </div>
    </div>
  );
}
