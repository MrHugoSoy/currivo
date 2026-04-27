import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import HowItWorks from "@/components/HowItWorks";
import Generator from "@/components/Generator";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBand />
        <HowItWorks />
        <Generator />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
