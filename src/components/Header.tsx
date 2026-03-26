import { ShoppingBag, ChevronDown, Menu, X, ArrowRight, User, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { initialCollections } from "@/data/products";
import { useProducts } from "@/contexts/ProductContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const { openCart, totalItems } = useCart();
  const { models } = useProducts();
  const [showModels, setShowModels] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<"main" | "models">("main");
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileSubmenu("main");
  }, [location]);

  // Verifica se o usuário está logado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error("Erro ao entrar com Google: " + error.message);
  };

  const handleEmailLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error("Preencha e-mail e senha."); return; }
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      toast.error("E-mail ou senha incorretos.");
    } else {
      toast.success("Bem-vindo!");
      setShowLoginModal(false);
    }
    setLoginLoading(false);
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) { toast.error("Preencha todos os campos."); return; }
    if (signupPassword.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupName } },
    });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        toast.error("E-mail já cadastrado. Tente entrar.");
      } else {
        toast.error(error.message);
      }
      setLoginLoading(false);
      return;
    }
    // If session returned immediately (email confirmation disabled), we're done
    if (data.session) {
      toast.success("Conta criada! Bem-vindo(a)!");
      setShowLoginModal(false);
      setLoginLoading(false);
      return;
    }
    // Email confirmation may be required — try signing in to confirm
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signupEmail,
      password: signupPassword,
    });
    if (!signInError) {
      toast.success("Conta criada! Bem-vindo(a)!");
      setShowLoginModal(false);
    } else {
      // Email confirmation is required
      toast.success("Conta criada! Confirme seu e-mail para entrar.", { duration: 6000 });
      setShowLoginModal(false);
    }
    setLoginLoading(false);
  };

  const switchMode = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setLoginEmail(""); setLoginPassword("");
    setSignupName(""); setSignupEmail(""); setSignupPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/");
  };

  const handleModelClick = (modelId: string) => {
    navigate(`/?model=${modelId}#gallery`);
    setShowModels(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 shadow-lg"
      style={{ backgroundColor: "hsl(var(--primary))" }}
    >
      {/* FRETE GRÁTIS TOP BAR */}
      <div 
        className="py-1 px-4 text-center overflow-hidden whitespace-nowrap"
        style={{ backgroundColor: "#e2ede2" }}
      >
        <div className="flex animate-[marquee_30s_linear_infinite] w-max gap-32 px-4 items-center h-full">
          <p 
            className="text-[0.45rem] md:text-[0.5rem] font-sans font-black uppercase tracking-[0.5em] flex items-center gap-4"
            style={{ color: "#304930" }}
          >
            <span>FRETE GRÁTIS PARA FEIRA DE SANTANA</span>
            <span className="w-1 h-1 rounded-full bg-[#304930]/30" />
            <span>COLEÇÃO DE LANÇAMENTO</span>
            <span className="w-1 h-1 rounded-full bg-[#304930]/30" />
            <span>SEJA BEM VINDO</span>
          </p>
          <p 
            className="text-[0.45rem] md:text-[0.5rem] font-sans font-black uppercase tracking-[0.5em] flex items-center gap-4"
            style={{ color: "#304930" }}
          >
            <span>FRETE GRÁTIS PARA FEIRA DE SANTANA</span>
            <span className="w-1 h-1 rounded-full bg-[#304930]/30" />
            <span>COLEÇÃO DE LANÇAMENTO</span>
            <span className="w-1 h-1 rounded-full bg-[#304930]/30" />
            <span>SEJA BEM VINDO</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo Laura Veríssimo" className="h-10 w-auto" />
          <div className="flex flex-col items-start">
            <span className="text-display text-lg md:text-3xl text-white leading-tight">
              Ateliê Laura Veríssimo
            </span>
            <span className="text-[0.45rem] md:text-[0.5rem] font-sans uppercase tracking-[0.5em] text-white/50 -mt-0.5">
              Arte em Vidro e Cristal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="font-sans text-sm uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors duration-300"
          >
            Acervo
          </Link>

          {/* DROPDOWN MODELOS */}
          <div
            className="group py-4"
            onMouseEnter={() => setShowModels(true)}
            onMouseLeave={() => setShowModels(false)}
          >
            <button className="flex items-center gap-1 font-sans text-sm uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors duration-300">
              Modelos <ChevronDown size={14} className={`transition-transform duration-300 text-accent ${showModels ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showModels && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed left-1/2 -translate-x-1/2 top-[90px] md:top-[125px] w-[95vw] max-w-5xl bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.25)] overflow-hidden border border-primary/5 p-10 z-[100]"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/5">
                    <div className="flex flex-col">
                      <h3 className="text-display text-3xl md:text-4xl text-primary italic">Modelos</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30">Taças e Pinturas Artesanais</p>
                    </div>
                    <Link to="/" className="text-[10px] uppercase tracking-widest font-black text-accent hover:underline">Ver Acervo Completo</Link>
                  </div>

                  {/* Duas colunas: Taças | Arte */}
                  <div className="grid grid-cols-2 gap-8">
                    {(["tacas", "arte"] as const).map((cat) => {
                      const catModels = models.filter(m => m.modelCategory === cat && m.id !== "personalizar");
                      return (
                        <div key={cat}>
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-accent mb-4 flex items-center gap-2">
                            <span className="w-5 h-px bg-accent/40" />
                            {cat === "tacas" ? "Taças & Copos" : "Estilos de Arte"}
                          </p>
                          <div className="space-y-2">
                            {catModels.map(model => (
                              <motion.button
                                key={model.id}
                                whileHover={{ x: 4 }}
                                onClick={() => handleModelClick(model.id)}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-all group/item text-left"
                              >
                                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-primary/5">
                                  <img src={model.image} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display text-base text-primary group-hover/item:text-accent transition-colors leading-tight">{model.name}</p>
                                  {model.capacityVariants && model.capacityVariants.length > 1 && (
                                    <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">
                                      {model.capacityVariants.map(v => v.label).join(" · ")}
                                    </p>
                                  )}
                                  {model.description && (
                                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{model.description}</p>
                                  )}
                                </div>
                                <ArrowRight size={14} className="text-primary/20 group-hover/item:text-accent transition-colors shrink-0" />
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Personalizar */}
                  <div className="mt-6 pt-5 border-t border-primary/5">
                    <div
                      onClick={() => { navigate('/personalizar'); setShowModels(false); }}
                      className="flex items-center justify-between bg-accent/5 rounded-2xl px-6 py-4 border border-accent/10 cursor-pointer hover:bg-accent/10 transition-colors group"
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-accent text-white px-2.5 py-1 rounded-lg">Exclusividade LV</span>
                        <p className="font-display text-lg text-primary mt-2 italic">Sua Imaginação é o Limite</p>
                      </div>
                      <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                        Criar agora <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link
            to="/personalizar"
            className="flex items-center"
          >
            <div className="bg-[#C9A84C] border border-[#304930] px-3.5 py-1.5 rounded-full shadow-sm hover:bg-[#E8C97A] transition-all duration-300 group">
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.1em] text-[#304930]">Crie sua Taça</span>
            </div>
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          {/* Botão Entrar/Conta — visível em TODOS os tamanhos */}
          {loggedUser ? (
            <Link
              to="/perfil"
              className="p-2 text-white/70 hover:text-accent transition-colors"
              title="Minha Conta"
            >
              <User size={20} className="text-accent" />
            </Link>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="p-2 text-white/70 hover:text-accent transition-colors"
              title="Entrar"
            >
              <User size={20} className="text-accent" />
            </button>
          )}

          <button
            onClick={openCart}
            className="relative p-2 text-white hover:text-accent transition-colors duration-300"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="h-5 w-5" stroke="hsl(var(--mustard))" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A84C] text-[0.6rem] font-sans font-black text-[hsl(var(--primary))] shadow-lg border border-[hsl(var(--primary))]"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-accent transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} className="text-accent" /> : <Menu size={24} className="text-accent" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#1a2b1a] flex flex-col overflow-hidden"
          >
            {/* Header do Menu Mobile */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
               <img src={logo} alt="Logo" className="h-8 w-auto brightness-0 invert opacity-50" />
               <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors gold-icon-container"
               >
                 <X size={24} />
               </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">
              <AnimatePresence mode="wait">
                {mobileSubmenu === "main" ? (
                  <motion.div
                    key="main-menu"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col gap-8"
                  >
                    {[
                      { label: "Acervo", path: "/" },
                      {
                        label: "Modelos",
                        onClick: () => setMobileSubmenu("models"),
                        isSub: true
                      },
                      { label: "Crie sua Taça", path: "/personalizar", highlight: true },
                      { label: "Sobre o Ateliê", path: "/" },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {item.path ? (
                          <Link 
                            to={item.path} 
                            className={`text-4xl font-display leading-none tracking-tight ${item.highlight ? 'gold-accent' : 'text-white/90'}`}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <button 
                            onClick={item.onClick}
                            className="text-4xl font-display text-white/90 flex items-center gap-4 group text-left"
                          >
                            {item.label}
                            {item.isSub && <ArrowRight size={24} className="text-accent/40" />}
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="models-menu"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <button 
                      onClick={() => setMobileSubmenu("main")}
                      className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                    >
                      <ChevronDown className="rotate-90" size={14} /> Voltar ao Menu
                    </button>
                    
                    <h3 className="text-display text-2xl text-white mb-4 italic">Modelos</h3>

                    {(["tacas", "arte"] as const).map((cat) => {
                      const catModels = models.filter(m => m.modelCategory === cat && m.id !== "personalizar");
                      if (catModels.length === 0) return null;
                      return (
                        <div key={cat} className="mb-5">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-accent mb-3 flex items-center gap-2">
                            <span className="w-4 h-px bg-accent/40" />
                            {cat === "tacas" ? "Taças & Copos" : "Estilos de Arte"}
                          </p>
                          <div className="space-y-2">
                            {catModels.map((model, idx) => (
                              <motion.button
                                key={model.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleModelClick(model.id)}
                                className="w-full bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center gap-3 group active:scale-[0.98] transition-all"
                              >
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                  <img src={model.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left flex-1">
                                  <p className="text-white/90 font-display text-base leading-tight">{model.name}</p>
                                  {model.capacityVariants && model.capacityVariants.length > 1 && (
                                    <p className="text-[8px] text-white/30 mt-0.5">{model.capacityVariants.map(v => v.label).join(" · ")}</p>
                                  )}
                                </div>
                                <ArrowRight size={14} className="text-white/20 group-hover:text-accent transition-colors shrink-0" />
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-12 space-y-6">
                {/* Login / Conta no mobile */}
                {loggedUser && (
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl px-6 py-4">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Logado como</p>
                      <p className="text-sm text-white/80 font-display">{loggedUser.user_metadata?.full_name || loggedUser.email}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link to="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black uppercase text-accent">Minha Conta</Link>
                      <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-[10px] font-black uppercase text-white/30 hover:text-red-400">Sair</button>
                    </div>
                  </div>
                )}
                <div className="text-center space-y-2">
                  <div className="flex justify-center gap-6">
                    <a href="https://instagram.com/atelielauraverissimo" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors">Instagram</a>
                    <a href="#" className="text-white/40 hover:text-accent transition-colors">Facebook</a>
                  </div>
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black">Design Original ROCHINHA PROJETOS • 2026</p>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    {/* Dropdown de Login — aparece no topo alinhado ao botão Entrar */}
    <AnimatePresence>
      {showLoginModal && (
        <>
          {/* Overlay transparente para fechar ao clicar fora */}
          <div className="fixed inset-0 z-[150]" onClick={() => setShowLoginModal(false)} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[90px] md:top-[125px] left-3 right-3 md:left-auto md:right-8 z-[160] md:w-[340px] bg-white rounded-3xl shadow-2xl border border-primary/5 p-7 space-y-4"
          >
            {/* Setinha */}
            <div className="absolute -top-2.5 right-6 w-5 h-5 bg-white border-l border-t border-primary/5 rotate-45 hidden md:block" />

            {/* Abas Entrar / Cadastrar */}
            <div className="flex bg-secondary/30 rounded-2xl p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    authMode === m ? "bg-white text-primary shadow-sm" : "text-primary/40 hover:text-primary/70"
                  }`}
                >
                  {m === "login" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 border-2 border-primary/15 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-sm text-primary"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {authMode === "login" ? "Entrar com Google" : "Cadastrar com Google"}
            </button>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-primary/10" />
              <span className="text-[9px] uppercase font-black text-primary/30">ou</span>
              <hr className="flex-1 border-primary/10" />
            </div>

            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-2.5">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Senha"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                    className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <button
                    onClick={handleEmailLogin}
                    disabled={loginLoading}
                    className="w-full py-2.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    {loginLoading ? "Entrando..." : "Entrar"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2.5">
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Senha (mín. 6 caracteres)"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full px-4 py-2.5 border border-primary/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <button
                    onClick={handleSignup}
                    disabled={loginLoading}
                    className="w-full py-2.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    {loginLoading ? "Criando conta..." : "Criar Conta"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;
