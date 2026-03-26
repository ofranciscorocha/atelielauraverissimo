import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGallery from "@/components/ProductGallery";
import CartDrawer from "@/components/CartDrawer";
import ProcessSection from "@/components/ProcessSection";
import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      <Hero />
      <ProductGallery />
      <ProcessSection />
      <CategoriesSection />
      <Footer />
    </div>
  );
};

export default Index;
