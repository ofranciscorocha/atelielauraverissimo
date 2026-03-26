import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/contexts/ProductContext";
import { initialModels, initialCollections } from "@/data/products";
import ProductCard from "./ProductCard";
import { LayoutGrid, List, ArrowUpDown, ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type SortOption = "relevance" | "price-high" | "price-low";

const ProductGallery = () => {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const toggleModel = (id: string) => {
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
    setActiveCollection(null);
  };

  useEffect(() => {
    const model = searchParams.get("model");
    const collection = searchParams.get("collection");
    if (model) {
      setSelectedModels([model]);
      setActiveCollection(null);
    } else if (collection) {
      setActiveCollection(collection);
      setSelectedModels([]);
    } else {
      setSelectedModels([]);
      setActiveCollection(null);
    }
  }, [searchParams]);

  let filtered = products.filter((p) => p.inStock);

  if (selectedModels.length > 0) {
    filtered = filtered.filter((p) => selectedModels.includes(p.modelId!));
  } else if (activeCollection) {
    filtered = filtered.filter((p) => p.collectionId === activeCollection);
  }

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    // Primary rule: products with launchDate (countdown) come AFTER available ones
    const aHasCountdown = !!a.launchDate;
    const bHasCountdown = !!b.launchDate;
    
    if (aHasCountdown && !bHasCountdown) return 1;
    if (!aHasCountdown && bHasCountdown) return -1;

    // Secondary rule: User sorting
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "price-low") return a.price - b.price;
    return b.salesCount - a.salesCount; // Major Relevance
  });

  return (
    <section id="galeria" className="pt-6 pb-24 px-6 md:px-12 bg-white content-visibility-auto">
      <div className="container mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
            Coleção Exclusiva
          </span>
          <h2 className="text-display text-4xl md:text-5xl text-foreground mt-3">
            Acervo de <span className="italic gold-accent">Peças</span>
          </h2>
        </motion.div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col gap-10 mb-16">
          <div className="w-full relative px-2">
            <div className="flex items-center justify-center group/nav relative">
              <div className="relative max-w-[95vw] md:max-w-none w-full">
                {/* Scroll Indicators - Only mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden rounded-r-[3rem]" />
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden rounded-l-[3rem] opacity-0" />
                
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 md:hidden animate-bounce-x p-1">
                   <ChevronRight size={18} stroke="url(#gold-gradient)" strokeWidth={3} />
                </div>

                <div className="flex items-center gap-3 p-2 bg-secondary/20 rounded-[3rem] border border-primary/5 backdrop-blur-xl overflow-x-auto no-scrollbar scroll-smooth shadow-inner whitespace-nowrap">
                  <button
                    onClick={() => { setSelectedModels([]); setActiveCollection(null); }}
                    className={`flex-shrink-0 font-sans text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.25em] px-8 py-3.5 rounded-full transition-all duration-500 font-black ${
                      selectedModels.length === 0 && !activeCollection
                        ? "bg-gold-gradient text-white shadow-[0_10px_20px_-5px_rgba(197,162,93,0.4)] border-none"
                        : "text-primary/60 hover:text-primary hover:bg-white/40"
                    }`}
                  >
                    Todas
                  </button>
                  {initialModels.map((model) => {
                    const shortName = model.name.replace("Taça de Cristal ", "").replace("Copo de Cristal ", "");
                    const isSelected = selectedModels.includes(model.id);
                    return (
                      <button
                        key={model.id}
                        onClick={() => toggleModel(model.id)}
                        className={`flex-shrink-0 font-sans text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.25em] px-8 py-3.5 rounded-full transition-all duration-500 font-black ${
                          isSelected
                            ? "bg-gold-gradient text-white shadow-[0_10px_20px_-5px_rgba(197,162,93,0.4)] border-none"
                            : "text-primary/60 hover:text-primary hover:bg-white/40"
                        }`}
                      >
                        {shortName}
                        {isSelected && selectedModels.length > 1 && (
                          <span className="ml-2 w-4 h-4 rounded-full bg-white text-gold-gradient text-[10px] inline-flex items-center justify-center">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center mt-3 md:hidden">
               <p className="text-[0.45rem] font-black uppercase tracking-[0.3em] text-muted-foreground/60 animate-pulse">
                  Deslize para ver mais categorias
               </p>
            </div>
          </div>

          <div className="flex flex-row items-stretch justify-center gap-3 px-2">
            {/* Sorting Dropdown */}
            <div className="flex-1 flex items-center gap-3 bg-white/60 px-4 md:px-8 py-3.5 rounded-2xl border border-primary/5 shadow-premium backdrop-blur-md">
              <ArrowUpDown size={14} className="text-accent shrink-0" strokeWidth={3} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none text-[0.6rem] md:text-[0.65rem] uppercase font-black tracking-widest outline-none focus:ring-0 text-primary cursor-pointer w-full"
              >
                <option value="relevance" className="bg-white text-primary">Mais Relevantes</option>
                <option value="price-high" className="bg-white text-primary">Maior Preço</option>
                <option value="price-low" className="bg-white text-primary">Menor Preço</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl border border-primary/5 shadow-premium backdrop-blur-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all duration-500 ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-lg"
                    : "text-primary/40 hover:text-primary hover:bg-white/80"
                }`}
                title="Ver em Grade"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all duration-500 ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-lg"
                    : "text-primary/40 hover:text-primary hover:bg-white/80"
                }`}
                title="Ver em Lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div 
          className={`grid gap-6 md:gap-8 transition-all duration-500 ${
            viewMode === "grid" 
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto"
          }`}
        >
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground font-sans py-20">
            Nenhuma obra encontrada nesta categoria.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProductGallery;
