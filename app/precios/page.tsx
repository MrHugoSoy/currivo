import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata = { title: "Precios — currivo" };

export default function PreciosPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 62 }}>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
