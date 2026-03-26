/**
 * CHECKOUT — ATELIÊ LAURA VERÍSSIMO
 * Fluxo:
 * 1. Login/Conta  2. Entrega (CEP → Melhor Envio)  3. Pagamento (só MP)
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ChevronRight, Loader2, Check, CreditCard,
  Ticket, ChevronLeft, Zap, Gift, User, MapPin, LogIn,
  Mail, Eye, EyeOff, Tag, ChevronDown, ChevronUp, Trash2,
  Package
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createOrderAndPreference } from "@/lib/mercadopago";
import { calculateShipping } from "@/lib/melhorenvio";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Step = "login" | "entrega" | "pagamento";
type PaymentMethod = "pix" | "cc" | "boleto";

interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  delivery_time: number;
  currency: string;
}

// ─── Schema de validação ──────────────────────────────────────────────────────
const deliverySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  surname: z.string().min(2, "Sobrenome obrigatório"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().min(10, "WhatsApp obrigatório"),
  cep: z.string().min(8, "CEP obrigatório"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado obrigatório"),
  noNumber: z.boolean().optional(),
  isGift: z.boolean().optional(),
  giftRecipient: z.string().optional(),
  giftMessage: z.string().optional(),
});

type DeliveryForm = z.infer<typeof deliverySchema>;

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal: cartSubtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isFallbackShipping, setIsFallbackShipping] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { isGift: false, noNumber: false },
  });

  const watchCep = watch("cep");
  const watchIsGift = watch("isGift");
  const watchNoNumber = watch("noNumber");

  // ─── Verificar sessão ────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Preencher dados do perfil
        const meta = session.user.user_metadata;
        if (meta?.full_name) {
          const parts = meta.full_name.split(" ");
          setValue("name", parts[0] || "");
          setValue("surname", parts.slice(1).join(" ") || "");
        }
        setValue("email", session.user.email || "");
        setStep("entrega");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        const meta = session.user.user_metadata;
        if (meta?.full_name) {
          const parts = meta.full_name.split(" ");
          setValue("name", parts[0] || "");
          setValue("surname", parts.slice(1).join(" ") || "");
        }
        setValue("email", session.user.email || "");
        setStep("entrega");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Se carrinho vazio, redirecionar
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7f0]">
        <div className="text-center space-y-4">
          <Package className="w-20 h-20 mx-auto text-primary/30" />
          <p className="font-display text-2xl italic text-primary">Seu carrinho está vazio</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-primary text-white rounded-full font-sans text-sm uppercase tracking-widest"
          >
            Explorar Coleção
          </button>
        </div>
      </div>
    );
  }

  // ─── Calcular totais ─────────────────────────────────────────────────────────
  const subtotal = cartSubtotal;
  const shippingCost = selectedShipping?.price ?? 0;
  const pixDiscount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const finalTotal = subtotal + shippingCost - couponDiscount - pixDiscount;

  // ─── Buscar CEP ──────────────────────────────────────────────────────────────
  const fetchAddressFromCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue("street", data.logradouro || "");
        setValue("neighborhood", data.bairro || "");
        setValue("city", data.localidade || "");
        setValue("state", data.uf || "");
      }
    } catch {}
    // Calcular frete após buscar endereço
    await fetchShipping(clean);
  }, [setValue, items]);

  const fetchShipping = async (cep: string) => {
    setLoadingShipping(true);
    setSelectedShipping(null);
    try {
      const result = await calculateShipping({
        postal_code: cep,
        products: items.map(i => ({
          id: i.product.id,
          quantity: i.quantity,
          price: i.product.price,
          weight: 0.5,
          width: 15,
          height: 15,
          length: 15,
          insurance_value: i.product.price,
        })),
      });
      if (result.options?.length > 0) {
        setShippingOptions(result.options);
        setSelectedShipping(result.options[0]);
        setIsFallbackShipping(result.isFallback === true);
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      toast.error("Não foi possível calcular o frete para este CEP.");
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    const clean = watchCep?.replace(/\D/g, "") || "";
    if (clean.length === 8) {
      fetchAddressFromCep(clean);
    }
  }, [watchCep]);

  // ─── Aplicar cupom ───────────────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    // Mock: LAURA10 = 10% off
    if (couponCode.toUpperCase() === "LAURA10") {
      const disc = subtotal * 0.10;
      setCouponDiscount(disc);
      setCouponApplied(true);
      toast.success(`Cupom aplicado! Desconto de R$ ${disc.toFixed(2).replace(".", ",")}`);
    } else {
      toast.error("Cupom inválido ou expirado.");
    }
  };

  // ─── Finalizar pedido ────────────────────────────────────────────────────────
  const onSubmitPayment = async (formData: DeliveryForm) => {
    if (!selectedShipping) {
      toast.error("Selecione uma opção de frete antes de continuar.");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        customer: {
          name: `${formData.name} ${formData.surname}`,
          email: formData.email,
          whatsapp: formData.whatsapp,
        },
        address: {
          street: formData.street,
          number: formData.noNumber ? "S/N" : (formData.number || "S/N"),
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          cep: formData.cep,
        },
        shipping: {
          company: selectedShipping.company,
          method: selectedShipping.name,
          price: selectedShipping.price,
          days: selectedShipping.delivery_time,
        },
        payment_method: paymentMethod === "cc" ? "credit_card" : paymentMethod,
        is_gift: formData.isGift,
        gift_recipient_name: formData.giftRecipient,
        gift_message: formData.giftMessage,
        coupon_code: couponApplied ? couponCode : undefined,
        coupon_discount: couponDiscount,
        // FIX: passar desconto PIX para o Edge Function calcular total correto
        pix_discount: pixDiscount,
        user_id: user?.id,
        items: items.map(i => ({
          product_name: i.product.name,
          product_description: i.product.description,
          product_image: i.product.image,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
        observations: formData.isGift
          ? `PRESENTE para: ${formData.giftRecipient}. Mensagem: ${formData.giftMessage}`
          : "",
      };

      const result = await createOrderAndPreference(payload);

      if (result.payment_url) {
        toast.success("Redirecionando para o pagamento seguro...");
        clearCart();
        window.location.href = result.payment_url;
      } else {
        toast.info("Pedido criado! Configure o Mercado Pago para receber pagamentos.");
        clearCart();
        navigate("/perfil");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps: Step[] = ["login", "entrega", "pagamento"];
  const stepLabels = ["Conta", "Entrega", "Pagamento"];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 40%, #fdf6f0 100%)",
      }}
    >
      {/* Rosas decorativas quase transparentes */}
      <div
        className="fixed inset-0 pointer-events-none select-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='60' fill='%23304930'/%3E%3Ccircle cx='100' cy='100' r='45' fill='%23fdf6f0'/%3E%3Ccircle cx='100' cy='100' r='30' fill='%23304930'/%3E%3Ccircle cx='100' cy='100' r='15' fill='%23fdf6f0'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Header fixo com steps + total */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-primary/10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Botão voltar */}
          <button onClick={() => navigate("/")} className="text-primary/60 hover:text-primary transition-colors">
            <ChevronLeft size={22} />
          </button>

          {/* Steps */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-3">
            {steps.map((s, idx) => (
              <div key={s} className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center gap-1.5 ${idx < stepIdx ? "text-green-600" : idx === stepIdx ? "text-primary" : "text-primary/30"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                    idx < stepIdx ? "bg-green-500 border-green-500 text-white" :
                    idx === stepIdx ? "border-primary text-primary" :
                    "border-primary/20 text-primary/30"
                  }`}>
                    {idx < stepIdx ? <Check size={10} /> : idx + 1}
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-wider">{stepLabels[idx]}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 sm:w-10 h-px ${idx < stepIdx ? "bg-green-400" : "bg-primary/15"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Total com toggle */}
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5 text-xs font-black text-primary"
          >
            <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
            {showSummary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Resumo expansível */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white border-t border-primary/5"
            >
              <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-primary">R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                  </div>
                ))}
                <div className="border-t border-primary/5 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-primary/60">
                      <span>Frete ({selectedShipping?.company})</span>
                      <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  {pixDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Desconto PIX 5%</span>
                      <span>- R$ {pixDiscount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Cupom ({couponCode})</span>
                      <span>- R$ {couponDiscount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-primary text-sm pt-1 border-t border-primary/5">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-40">
        <AnimatePresence mode="wait">

          {/* ═══════════════ STEP 1: LOGIN ═══════════════ */}
          {step === "login" && (
            <motion.div key="login" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <LoginStep
                onSuccess={() => setStep("entrega")}
              />
            </motion.div>
          )}

          {/* ═══════════════ STEP 2: ENTREGA ═══════════════ */}
          {step === "entrega" && (
            <motion.div key="entrega" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">

              {/* Título */}
              <div className="text-center py-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary/50 font-black">Etapa 2 de 3</p>
                <h2 className="text-3xl font-display italic text-primary mt-1">Endereço de Entrega</h2>
              </div>

              {/* Card form */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary/5 shadow-sm p-6 sm:p-8 space-y-5">

                {/* Para mim / Presente */}
                <div className="grid grid-cols-2 gap-3">
                  {[{ val: false, label: "Para Mim", icon: <User size={16}/> }, { val: true, label: "É um Presente", icon: <Gift size={16}/> }].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setValue("isGift", opt.val)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                        watchIsGift === opt.val
                          ? "border-primary bg-primary text-white"
                          : "border-primary/10 text-primary/60 hover:border-primary/30"
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Dados do presente */}
                <AnimatePresence>
                  {watchIsGift && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                      <InputField label="Nome do Presenteado" placeholder="Nome de quem vai receber" register={register("giftRecipient")} />
                      <TextAreaField label="Mensagem do Presente" placeholder="Escreva uma mensagem especial..." register={register("giftMessage")} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nome e Sobrenome */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Nome *" placeholder="Seu nome" register={register("name")} error={errors.name?.message} />
                  <InputField label="Sobrenome *" placeholder="Seu sobrenome" register={register("surname")} error={errors.surname?.message} />
                </div>

                {/* Email e WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="E-mail *" placeholder="seu@email.com" register={register("email")} error={errors.email?.message} type="email" />
                  <InputField label="WhatsApp *" placeholder="(75) 9 9999-9999" register={register("whatsapp")} error={errors.whatsapp?.message} />
                </div>

                <hr className="border-primary/5" />

                {/* CEP */}
                <div className="relative">
                  <InputField label="CEP *" placeholder="00000-000" register={register("cep")} error={errors.cep?.message} />
                  {loadingShipping && (
                    <div className="absolute right-3 bottom-3">
                      <Loader2 size={18} className="animate-spin text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Endereço preenchido automaticamente */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <InputField label="Rua *" placeholder="Nome da rua" register={register("street")} error={errors.street?.message} />
                  </div>
                  <div>
                    <InputField
                      label="Número"
                      placeholder="000"
                      register={register("number")}
                      disabled={watchNoNumber}
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                      <input type="checkbox" {...register("noNumber")} className="accent-primary" />
                      <span className="text-[10px] text-primary/50 font-bold">S/N</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Complemento" placeholder="Apto, bloco..." register={register("complement")} />
                  <InputField label="Bairro *" placeholder="Seu bairro" register={register("neighborhood")} error={errors.neighborhood?.message} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Cidade *" placeholder="Sua cidade" register={register("city")} error={errors.city?.message} />
                  <InputField label="Estado *" placeholder="BA" register={register("state")} error={errors.state?.message} maxLength={2} />
                </div>

                {/* Opções de frete */}
                <AnimatePresence>
                  {shippingOptions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/50">Opções de Entrega</p>
                        {isFallbackShipping && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ⚠ Estimativa — valores finais no pedido
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {shippingOptions.map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedShipping(opt)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                              selectedShipping?.id === opt.id
                                ? "border-primary bg-primary/5"
                                : "border-primary/10 hover:border-primary/30 bg-white/50"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-bold text-primary">{opt.name}</p>
                              <p className="text-[10px] text-muted-foreground">{opt.company} · {opt.delivery_time} dias úteis</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary">
                                {opt.price === 0 ? "GRÁTIS" : `R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                              </span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedShipping?.id === opt.id ? "border-primary bg-primary" : "border-primary/20"
                              }`}>
                                {selectedShipping?.id === opt.id && <Check size={10} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleSubmit(() => {
                    if (!selectedShipping && shippingOptions.length === 0) {
                      toast.error("Preencha um CEP válido para calcular o frete.");
                      return;
                    }
                    if (!selectedShipping) {
                      toast.error("Selecione uma opção de frete.");
                      return;
                    }
                    setStep("pagamento");
                  })}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  Avançar para Pagamento <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STEP 3: PAGAMENTO ═══════════════ */}
          {step === "pagamento" && (
            <motion.div key="pagamento" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">

              <div className="text-center py-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary/50 font-black">Etapa 3 de 3</p>
                <h2 className="text-3xl font-display italic text-primary mt-1">Forma de Pagamento</h2>
              </div>

              {/* Resumo da entrega */}
              <div className="bg-white/70 rounded-2xl border border-primary/5 p-4 flex items-center gap-3">
                <MapPin size={18} className="text-primary/40 shrink-0" />
                <div className="text-xs text-primary/70 flex-1 min-w-0">
                  <span className="font-bold block truncate">{watch("street")}, {watchNoNumber ? "S/N" : watch("number")} — {watch("city")}/{watch("state")}</span>
                  <span>{selectedShipping?.name} · {selectedShipping?.delivery_time} dias · {selectedShipping?.price === 0 ? "Grátis" : `R$ ${selectedShipping?.price.toFixed(2).replace(".", ",")}`}</span>
                </div>
                <button onClick={() => setStep("entrega")} className="text-[10px] text-primary underline font-bold shrink-0">alterar</button>
              </div>

              {/* Métodos de pagamento — somente Mercado Pago */}
              <div className="bg-white/80 rounded-3xl border border-primary/5 shadow-sm p-6 sm:p-8 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary/50">Escolha como pagar</p>

                <div className="space-y-2">
                  {[
                    {
                      id: "pix" as PaymentMethod,
                      name: "PIX",
                      desc: "Aprovação imediata",
                      badge: "5% OFF",
                      icon: (
                        <svg viewBox="0 0 100 100" className="w-5 h-5" fill="currentColor">
                          <path d="M73.7 24.4L57.5 8.2c-4.1-4.1-10.8-4.1-14.9 0L26.3 24.4H15.7C9.3 24.4 4 29.7 4 36.1v28c0 6.4 5.3 11.7 11.7 11.7h10.6l16.2 16.2c4.1 4.1 10.8 4.1 14.9 0l16.2-16.2h10.6c6.4 0 11.7-5.3 11.7-11.7v-28c0-6.4-5.3-11.7-11.7-11.7H73.7zM47.5 14.5l13.3 13.3-13.3 13.3L34.2 27.8l13.3-13.3zM34.7 72.2L21.4 58.9l13.3-13.3 13.3 13.3-13.3 13.3zm12.7 12.7L34.2 71.6l13.3-13.3 13.3 13.3-13.3 13.3zm13-13L47.5 58.6 60.8 45.3l13.3 13.3-13.4 13.3z"/>
                        </svg>
                      ),
                    },
                    {
                      id: "cc" as PaymentMethod,
                      name: "Cartão de Crédito",
                      desc: "Até 12x | 6x sem juros",
                      badge: null,
                      icon: <CreditCard size={18} />,
                    },
                    {
                      id: "boleto" as PaymentMethod,
                      name: "Boleto Bancário",
                      desc: "Vence em 3 dias úteis",
                      badge: null,
                      icon: <Ticket size={18} />,
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all group ${
                        paymentMethod === m.id
                          ? "border-primary bg-primary/5"
                          : "border-primary/10 bg-white/50 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          paymentMethod === m.id ? "bg-primary text-white" : "bg-[#C9A84C]/15 text-[#A8892A]"
                        }`}>
                          {m.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${paymentMethod === m.id ? "text-primary" : "text-slate-600"}`}>{m.name}</p>
                            {m.badge && <span className="text-[9px] font-black uppercase bg-green-500 text-white px-2 py-0.5 rounded-full">{m.badge}</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        paymentMethod === m.id ? "border-primary bg-primary" : "border-primary/20"
                      }`}>
                        {paymentMethod === m.id && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Box desconto PIX */}
                <AnimatePresence>
                  {paymentMethod === "pix" && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Check size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-green-700 tracking-widest">Desconto PIX Ativo!</p>
                        <p className="text-xs font-bold text-green-800">
                          Economia de R$ {pixDiscount.toFixed(2).replace(".", ",")} — você paga apenas R$ {(finalTotal).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cupom de desconto */}
                <div className="pt-2 border-t border-primary/5 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-1.5">
                    <Tag size={12} /> Cupom de Desconto
                  </p>
                  {couponApplied ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm font-bold text-green-700 flex-1">{couponCode.toUpperCase()} — R$ {couponDiscount.toFixed(2).replace(".", ",")}</span>
                      <button onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(""); }} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Digite seu cupom"
                        className="flex-1 px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      />
                      <button onClick={applyCoupon} className="px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                        Aplicar
                      </button>
                    </div>
                  )}
                </div>

                {/* Selos de segurança */}
                <div className="p-4 bg-[#304930] rounded-2xl text-white flex items-center gap-4">
                  <ShieldCheck size={28} style={{ color: "#C9A84C" }} className="shrink-0" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#E8C97A" }}>Checkout 100% Seguro</p>
                    <p className="text-[10px] opacity-60 mt-0.5">Mercado Pago · Criptografia SSL · VISA · MASTER · PIX · BOLETO</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Botão fixo de ação */}
      {step !== "login" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-primary/10 p-4 shadow-[0_-8px_24px_-8px_rgba(48,73,48,0.15)] z-50">
          <div className="max-w-2xl mx-auto space-y-2">
            {step === "pagamento" && (
              <button
                onClick={handleSubmit(onSubmitPayment)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                  isProcessing ? "bg-slate-300 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : paymentMethod === "pix" ? (
                  <><Zap size={16} /> Pagar com PIX — 5% OFF</>
                ) : paymentMethod === "cc" ? (
                  <><CreditCard size={16} /> Finalizar com Cartão</>
                ) : (
                  <><Ticket size={16} /> Gerar Boleto Bancário</>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-4 text-[10px]">
              {step === "pagamento" && (
                <button onClick={() => setStep("entrega")} className="flex items-center gap-1.5 text-primary/50 hover:text-primary transition-colors font-bold uppercase tracking-wider">
                  <ChevronLeft size={12} /> Voltar à Entrega
                </button>
              )}
              <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-wider">
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente: Login ────────────────────────────────────────────────────
function LoginStep({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"options" | "email">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const handleGoogle = async () => {
    // FIX: usar sempre window.location.origin para funcionar em qualquer ambiente
    const redirectTo = `${window.location.origin}/checkout`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) toast.error("Erro ao entrar com Google: " + error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error("Digite seu e-mail para redefinir a senha."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/perfil`,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`Enviamos um link de redefinição para ${email}`);
      setForgotMode(false);
    }
    setLoading(false);
  };

  const handleEmail = async () => {
    if (!email || (!password && !forgotMode)) { 
      toast.error("Preencha e-mail e senha."); 
      return; 
    }
    
    setLoading(true);
    try {
      if (isSignup) {
        // No cadastro, tentamos criar o usuário com metadados
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Fallback simples
            }
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este e-mail já está cadastrado. Tente entrar.");
            setIsSignup(false);
          } else {
            toast.error(error.message);
          }
        } else if (data.user && data.session) {
          toast.success("Bem-vindo(a)! Cadastro realizado.");
          onSuccess();
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar o acesso.");
          // Se não houver sessão imediata, a maioria dos fluxos Supabase exige confirmação
          // Mas vamos tentar o login automático se o dashboard permitir
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials") || error.message.includes("Email not confirmed")) {
            toast.error("E-mail não confirmado ou senha incorreta.");
          } else {
            toast.error(error.message);
          }
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.error("Erro inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/50 font-black">Etapa 1 de 3</p>
        <h2 className="text-3xl font-display italic text-primary mt-1">Finalize mais rápido</h2>
        <p className="text-sm text-primary/50 mt-2">Acesse sua conta para acompanhar seu pedido</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary/5 shadow-sm p-6 sm:p-8 space-y-4">
        <AnimatePresence mode="wait">
          {mode === "options" ? (
            <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-primary/15 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-sm text-primary"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </button>

              {/* Email */}
              <button
                onClick={() => setMode("email")}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <Mail size={16} /> Entrar com E-mail
              </button>

              <p className="text-center text-xs text-primary/40 pt-2">
                Não tem conta?{" "}
                <button onClick={() => { setMode("email"); setIsSignup(true); }} className="text-primary font-bold underline">
                  Cadastre-se
                </button>
                {" "}para acompanhar seu pedido
              </p>
            </motion.div>
          ) : (
            <motion.div key="emailForm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <button onClick={() => { setMode("options"); setForgotMode(false); }} className="flex items-center gap-1.5 text-primary/50 hover:text-primary text-xs font-bold uppercase tracking-wider">
                <ChevronLeft size={12} /> Voltar
              </button>

              <h3 className="font-display text-xl italic text-primary">
                {forgotMode ? "Redefinir Senha" : isSignup ? "Criar Conta" : "Entrar com E-mail"}
              </h3>

              <div className="space-y-3">
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
                {!forgotMode && (
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full px-4 py-3 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={forgotMode ? handleForgotPassword : handleEmail}
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {forgotMode ? "Enviar Link de Redefinição" : isSignup ? "Criar Conta" : "Entrar"}
              </button>

              <div className="flex items-center justify-between text-xs text-primary/40">
                <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-bold underline">
                  {isSignup ? "Já tenho conta" : "Criar conta"}
                </button>
                {!isSignup && !forgotMode && (
                  <button onClick={() => setForgotMode(true)} className="text-primary/50 hover:text-primary font-bold underline">
                    Esqueci minha senha
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Helpers de Input ─────────────────────────────────────────────────────────
function InputField({
  label, placeholder, register, error, type = "text", disabled = false, maxLength
}: {
  label: string; placeholder: string; register: any; error?: string;
  type?: string; disabled?: boolean; maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        {...register}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
          error ? "border-red-300 focus:ring-red-200" : "border-primary/15 focus:ring-primary/20"
        } ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : ""}`}
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function TextAreaField({ label, placeholder, register }: { label: string; placeholder: string; register: any }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">{label}</label>
      <textarea
        placeholder={placeholder}
        rows={3}
        {...register}
        className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white resize-none"
      />
    </div>
  );
}
