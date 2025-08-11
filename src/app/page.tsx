import Image from "next/image";
import NavBar from "@/components/navBar";
import Footer from "@/components/footer";
import Province from "@/components/province";
import DestinationCard from "@/components/card-home/destinationCard";
import DestinationCardTwo from "@/components/card-home/destinationCardTwo";
import DestinationCardThree from "@/components/card-home/destinationCardThree";
import DestinationCardFor from "@/components/card-home/destinationCardFor";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="">
      <NavBar />
      <Hero/>
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
      <Footer />
    </div>
  );
}
