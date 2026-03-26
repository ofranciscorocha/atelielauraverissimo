import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md glass-card rounded-l-atelier border-l-0 p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <SheetTitle className="text-display text-2xl text-foreground flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 gold-accent" />
            Sua Seleção
            <span className="font-sans text-sm text-muted-foreground font-normal">
              ({totalItems} {totalItems === 1 ? "item" : "itens"})
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence>
            {items.map((item) => {
              const custJson = item.customization ? JSON.stringify(item.customization) : undefined;
              return (
                <motion.div
                  key={`${item.product.id}-${custJson}`}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 items-center"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-border/30">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-foreground truncate">
                      {item.product.name}
                    </h4>
                    {item.customization && (
                      <p className="text-[9px] uppercase font-bold text-accent tracking-tighter leading-none mt-1">
                        {item.customization.color} • {item.customization.size}
                      </p>
                    )}
                    <p className="font-sans text-xs text-muted-foreground tabular-nums mt-1">
                      R$ {item.product.price.toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, custJson)}
                        className="p-1 rounded-full hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-sans text-sm tabular-nums w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, custJson)}
                        className="p-1 rounded-full hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-sans text-sm font-medium text-foreground tabular-nums">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id, custJson)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mb-4 opacity-30" />
              <p className="font-sans text-sm">Sua seleção está vazia</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 pb-6 pt-4 border-t border-border/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm uppercase tracking-[0.15em] text-muted-foreground">
                Subtotal
              </span>
              <span className="font-display text-2xl text-foreground tabular-nums">
                R$ {subtotal.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button onClick={goToCheckout} className="btn-primary w-full text-center">
              Finalizar Pedido
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
