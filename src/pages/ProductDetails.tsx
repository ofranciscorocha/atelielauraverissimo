import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import type { CapacityVariant } from "@/data/products";
import {
  ChevronRight, Star, Minus, Plus, ShoppingBag,
  ArrowLeft, Share2, Heart, ShieldCheck, Truck, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, models } = useProducts();
  const { addItem } = useCart();

  const product = products.find((p) => p.id === id);
  const productModel = models.find((m) => m.id === product?.modelId);
  const capacityVariants = productModel?.capacityVariants ?? [];
  const hasCapacities = capacityVariants.length > 1;

  const [selectedImage, setSelectedImage] = useState(product?.image || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [selectedCapacity, setSelectedCapacity] = useState<CapacityVariant | null>(
    capacityVariants[0] ?? null
  );

  // Preço final considerando ajuste da capacidade selecionada
  const finalPrice = (product?.price ?? 0) + (selectedCapacity?.priceAdjust ?? 0);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setSelectedColor(product.colors?.[0] || "");
      const caps = models.find((m) => m.id === product.modelId)?.capacityVariants ?? [];
      setSelectedCapacity(caps[0] ?? null);
      window.scrollTo(0, 0);
    }
  }, [product, id, models]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-display text-3xl mb-4">Obra não encontrada</h2>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product.id === "custom-order") {
      navigate("/personalizar");
      return;
    }
    if (hasCapacities && !selectedCapacity?.inStock) {
      toast.error("Esta capacidade está fora de estoque.");
      return;
    }

    // Clonar produto com preço e nome ajustados pela capacidade
    const cartProduct = hasCapacities && selectedCapacity
      ? {
          ...product,
          price: finalPrice,
          name: `${product.name} — ${selectedCapacity.label}`,
          // id único por capacidade para o carrinho tratar como item separado
          id: `${product.id}__${selectedCapacity.id}`,
        }
      : product;

    addItem(cartProduct, quantity);
    toast.success(`${cartProduct.name} adicionado ao carrinho!`, {
      description: "Pronto para fazer parte da sua história.",
      style: { backgroundColor: "#304930", color: "#fff" },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <CartDrawer />
      
      <main className="container mx-auto px-6 pt-32 lg:pt-40">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-8">
           <Link to="/" className="hover:text-primary transition-colors">Início</Link>
           <ChevronRight size={10} />
           <span className="hover:text-primary transition-colors cursor-pointer">{product.category}</span>
           <ChevronRight size={10} />
           <span className="text-foreground font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Photos Section */}
          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-square rounded-[3rem] overflow-hidden bg-secondary/30 relative glass-card p-4"
            >
               <img 
                 src={selectedImage} 
                 alt={product.name} 
                 className="w-full h-full object-cover rounded-[2.5rem] transition-transform duration-700 hover:scale-110"
               />
               <button className="absolute top-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-full text-foreground hover:text-primary transition-all shadow-lg">
                  <Heart size={20} />
               </button>
            </motion.div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {[product.image, ...(product.images || [])].map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setSelectedImage(img)}
                   className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${selectedImage === img ? "border-primary scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col">
             <div className="mb-8">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground border-l-2 border-accent pl-3">
                   {product.technique}
                </span>
                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-4 leading-tight">
                   {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-6">
                   <div className="flex text-accent">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                   </div>
                   <span className="font-sans text-xs text-muted-foreground uppercase tracking-widest">({product.reviews?.length || 0} Avaliações)</span>
                </div>
                <p className="text-3xl font-display mt-8 text-primary">
                  R$ {finalPrice.toFixed(2).replace(".", ",")}
                  {selectedCapacity && selectedCapacity.priceAdjust > 0 && (
                    <span className="ml-3 text-sm font-sans text-muted-foreground line-through">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </p>
             </div>

             <div className="space-y-8 flex-1">
                <p className="font-sans text-muted-foreground leading-relaxed text-lg">
                   {product.description}
                </p>

                {/* Capacity Variants */}
                {hasCapacities && (
                  <div>
                    <p className="font-sans text-[0.65rem] uppercase font-bold tracking-widest text-muted-foreground mb-4">
                      Capacidade
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {capacityVariants.map((cap) => (
                        <button
                          key={cap.id}
                          onClick={() => cap.inStock && setSelectedCapacity(cap)}
                          disabled={!cap.inStock}
                          className={`relative px-6 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-all border
                            ${!cap.inStock
                              ? "opacity-40 cursor-not-allowed border-primary/10 text-muted-foreground"
                              : selectedCapacity?.id === cap.id
                                ? "bg-primary text-white border-primary shadow-lg"
                                : "bg-white border-primary/15 text-muted-foreground hover:border-primary/40"
                            }`}
                        >
                          {cap.label}
                          {cap.priceAdjust > 0 && (
                            <span className={`ml-1.5 text-[9px] font-bold ${selectedCapacity?.id === cap.id ? "text-white/70" : "text-accent"}`}>
                              +R${cap.priceAdjust}
                            </span>
                          )}
                          {!cap.inStock && (
                            <span className="absolute -top-2 -right-2 text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-black uppercase">
                              Esgotado
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                     <p className="font-sans text-[0.65rem] uppercase font-bold tracking-widest text-muted-foreground mb-4">Escolha a Cor / Detalhe</p>
                     <div className="flex gap-3">
                        {product.colors.map(color => (
                          <button 
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-6 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-all border ${selectedColor === color ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-primary/5 text-muted-foreground hover:border-primary/20"}`}
                          >
                            {color}
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-full border border-primary/5 min-w-[140px]">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-white rounded-full transition-all text-primary"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-display text-xl w-10 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                        className="p-3 hover:bg-white rounded-full transition-all text-primary"
                      >
                        <Plus size={18} />
                      </button>
                   </div>
                   <button 
                     onClick={handleAddToCart}
                     className="btn-gold flex-1 flex items-center justify-center gap-3 py-6 text-[0.7rem] tracking-[0.2em]"
                   >
                      <ShoppingBag size={20} /> {product.id === "custom-order" ? "PERSONALIZAR MINHA OBRA" : "ADICIONAR À MINHA HISTÓRIA"}
                   </button>
                </div>

                {/* Shipping info small */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-primary/5">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <ShieldCheck size={18} className="text-primary" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">Pintura Artesanal</span>
                   </div>
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Truck size={18} className="text-primary" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">Frete Grátis Feira/BA</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-32">
           <div className="flex items-center justify-between mb-12">
              <h2 className="text-display text-3xl">Ouvindo <span className="italic gold-accent">Corações</span></h2>
              <button className="text-[0.6rem] uppercase font-bold tracking-widest text-primary border-b border-primary pb-1">Deixar minha avaliação</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map(r => (
                  <div key={r.id} className="glass-card p-8 bg-secondary/20">
                     <div className="flex text-accent mb-4">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= r.rating ? "currentColor" : "none"} />)}
                     </div>
                     <p className="font-sans text-foreground text-sm leading-relaxed mb-6 italic">"{r.comment}"</p>
                     <div className="flex items-center justify-between">
                        <span className="font-display text-sm">{r.user}</span>
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{r.date}</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-20 text-center glass-card bg-secondary/10">
                   <p className="font-sans text-muted-foreground uppercase text-[0.65rem] tracking-widest">Ainda sem avaliações. Seja o primeiro a contar sua história.</p>
                </div>
              )}
           </div>
        </section>

        {/* Similar Products */}
        <section className="mt-32">
           <div className="mb-12">
              <h2 className="text-display text-3xl">Outras <span className="italic gold-accent">Pinturas</span> que pode amar</h2>
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mt-2">Escolhas baseadas na técnica artesanal</p>
           </div>

           <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar scroll-smooth">
              {similarProducts.map((p, i) => (
                <div key={p.id} className="min-w-[280px] md:min-w-[320px]">
                   <ProductCard product={p} index={i} />
                </div>
              ))}
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-40 py-20 bg-[#304930] text-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-display text-2xl gold-accent italic mb-2">Ateliê Laura Veríssimo</p>
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.4em] opacity-70 mb-8">Elegância em cada traço</p>
          <div className="flex justify-center gap-8 mb-12 opacity-60">
             <Share2 size={24} className="cursor-pointer hover:text-accent transition-all" />
             <Heart size={24} className="cursor-pointer hover:text-accent transition-all" />
             <RotateCcw size={24} className="cursor-pointer hover:text-accent transition-all" />
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-40">© 2024 Todos os Direitos Reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;
