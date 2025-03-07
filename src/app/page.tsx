import Image from "next/image";
import NavBar from "@/components/navBar";
import Province from "@/components/province";
import DestinationCard from "@/components/card-home/destinationCard";

export default function Home() {
  return (
    <div className="md:px-12 md:py-2 ">
      <NavBar />
      <Province />
      <div>
        <DestinationCard />
      </div>
    </div>
  );
}
