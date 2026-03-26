import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import type { Product } from "@/data/products";
import { categories } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Package, Users, TrendingUp,
  BarChart3, ArrowLeft, Save, X, Crown,
  ShoppingBag, DollarSign, Calendar, Clock, LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";

const emptyProduct: Omit<Product, "id"> = {
  name: "", description: "", technique: "", price: 0,
  category: "Taças", image: "", inStock: true,
  launchDate: "",
};

// Mock data for dashboard
const dashboardMetrics = [
  { label: "Vendas Totais", value: "R$ 12.450", icon: <DollarSign size={20} />, trend: "+12%" },
  { label: "Pedidos Ativos", value: "8", icon: <ShoppingBag size={20} />, trend: "+2" },
  { label: "Novos Clientes", value: "24", icon: <Users size={20} />, trend: "+5" },
  { label: "Obras em Lançamento", value: "3", icon: <Clock size={20} />, trend: "Especial" },
];

const mockOrders = [
  { id: "ORD-001", client: "Maria Silva", status: "Em Produção", total: 450, date: "2026-03-10" },
  { id: "ORD-002", client: "João Costa", status: "Enviado", total: 890, date: "2026-03-08" },
  { id: "ORD-003", client: "Ana Beatriz", status: "Pendente", total: 1240, date: "2026-03-13" },
];

const mockClients = [
  { name: "Ana Beatriz", ltv: 3200, orders: 5, vip: true },
  { name: "Maria Silva", ltv: 1800, orders: 3, vip: false },
  { name: "João Costa", ltv: 2450, orders: 4, vip: true },
];

type Tab = "dashboard" | "products" | "orders" | "clients";

const AdminPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => {
    setEditing({ ...emptyProduct, id: Date.now().toString() } as Product);
    setIsNew(true);
  };

  const startEdit = (p: Product) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const cancelEdit = () => { setEditing(null); setIsNew(false); };

  const saveProduct = () => {
    if (!editing) return;
    if (isNew) addProduct(editing);
    else updateProduct(editing);
    setEditing(null);
    setIsNew(false);
  };

  const statusColor = (s: string) => {
    if (s === "Enviado") return "bg-accent/20 text-accent";
    if (s === "Em Produção") return "bg-primary/10 text-primary";
    return "bg-secondary text-muted-foreground";
  };

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[0.65rem] md:text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
        tab === t 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fdfaf6]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="h-3 w-3" />
              Sair do Painel
            </Link>
            <h1 className="text-display text-4xl md:text-5xl text-foreground">
              Dashboard <span className="italic gold-accent">Exclusivo</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/40 border border-white/60 p-2 rounded-2xl backdrop-blur-md">
            <div className="text-right hidden sm:block">
              <p className="font-sans text-[0.6rem] uppercase tracking-tighter text-muted-foreground">Admin Logado</p>
              <p className="font-display text-sm text-foreground">Laura Veríssimo</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display">
              LV
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {tabBtn("dashboard", "Dashboard", <LayoutDashboard size={14} />)}
          {tabBtn("products", "Acervo", <Package size={14} />)}
          {tabBtn("orders", "Encomendas", <ShoppingBag size={14} />)}
          {tabBtn("clients", "Vips", <Users size={14} />)}
        </div>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardMetrics.map((m, i) => (
                <motion.div 
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 flex items-start justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
                     <BarChart3 size={80} />
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                      {m.icon}
                    </div>
                    <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
                    <p className="text-display text-2xl text-foreground">{m.value}</p>
                  </div>
                  <span className={`font-sans text-[0.6rem] px-2 py-0.5 rounded-full ${m.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                    {m.trend}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Chart Mock */}
              <div className="lg:col-span-2 glass-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-display text-xl text-foreground italic flex items-center gap-2">
                    <TrendingUp className="gold-accent" size={18} />
                    Desempenho de Vendas
                  </h3>
                  <div className="flex gap-2">
                    {['7d', '30d', '1y'].map(p => (
                      <button key={p} className="w-8 h-8 rounded-lg bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground hover:bg-primary hover:text-white transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[200px] w-full flex items-end justify-between gap-1">
                  {[40, 70, 45, 90, 65, 80, 55, 95, 70, 85, 60, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-primary/5 via-primary/40 to-primary rounded-t-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Recent Orders Side */}
              <div className="glass-card p-6">
                <h3 className="text-display text-xl text-foreground mb-6">Pedidos Recentes</h3>
                <div className="space-y-4">
                  {mockOrders.slice(0, 3).map(o => (
                    <div key={o.id} className="flex items-center justify-between border-b border-border/10 pb-4">
                      <div>
                        <p className="font-display text-sm">{o.client}</p>
                        <p className="font-sans text-[0.65rem] text-muted-foreground uppercase">{o.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-xs font-semibold">R$ {o.total}</p>
                        <span className="text-[0.55rem] uppercase text-primary font-bold">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setTab("orders")}
                  className="w-full mt-6 py-3 text-[0.65rem] uppercase tracking-[0.2em] font-bold text-muted-foreground border border-border/20 rounded-xl hover:bg-secondary transition-all"
                >
                  Ver Todos Pedidos
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-display text-2xl text-foreground">Gerenciar <span className="gold-accent">Acervo</span></h2>
              <button onClick={startNew} className="btn-gold flex items-center gap-2 text-xs">
                <Plus size={14} />
                Nova Obra
              </button>
            </div>

            {/* Edit form */}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-6 md:p-8 mb-8 overflow-hidden bg-white/70 border-primary/20"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-display text-2xl text-foreground">
                      {isNew ? "Criar Nova Peça" : "Refinar Detalhes"}
                    </h3>
                    <button onClick={cancelEdit} className="p-2 hover:bg-secondary rounded-full">
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Nome da Obra</label>
                      <input
                        placeholder="Ex: Taça Imperial Gold"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Categoria</label>
                      <select
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                      >
                        {categories.filter((c) => c !== "Todas").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Preço (R$)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                        <input
                          type="number" 
                          value={editing.price || ""}
                          onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                          className="w-full px-12 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Técnica Utilizada</label>
                      <input
                        placeholder="Ex: Pintura em Ouro 24k"
                        value={editing.technique}
                        onChange={(e) => setEditing({ ...editing, technique: e.target.value })}
                        className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2 flex items-center gap-1.5">
                        <Calendar size={10} className="text-primary" /> Data de Lançamento (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={editing.launchDate ? editing.launchDate.substring(0, 16) : ""}
                        onChange={(e) => setEditing({ ...editing, launchDate: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                        className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                       <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Situação de Estoque</label>
                       <div className="flex items-center gap-4 py-3">
                          <button 
                            onClick={() => setEditing({...editing, inStock: true})}
                            className={`flex-1 py-1 px-3 rounded-full text-[10px] uppercase font-bold transition-all ${editing.inStock ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
                          >
                            Em Estoque
                          </button>
                          <button 
                            onClick={() => setEditing({...editing, inStock: false})}
                            className={`flex-1 py-1 px-3 rounded-full text-[10px] uppercase font-bold transition-all ${!editing.inStock ? 'bg-destructive text-white' : 'bg-secondary text-muted-foreground'}`}
                          >
                            Indisponível
                          </button>
                       </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">URL da Fotografia</label>
                      <input
                        placeholder="Link da imagem do Unsplash ou Storage"
                        value={editing.image}
                        onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                        className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-1">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground ml-2">Narrativa / Descrição</label>
                      <textarea
                        placeholder="Conte a história desta peça..."
                        value={editing.description}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        rows={3}
                        className="w-full px-5 py-4 rounded-3xl bg-secondary/30 border border-primary/10 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border/10">
                    <button onClick={cancelEdit} className="px-8 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-all">
                      Cancelar
                    </button>
                    <button onClick={saveProduct} className="btn-gold px-10 flex items-center gap-2">
                      <Save size={16} /> Finalizar Peça
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="glass-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-all active:scale-[0.98]">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-foreground truncate">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-sans text-[0.55rem] uppercase tracking-tighter text-muted-foreground bg-secondary px-1.5 rounded">{p.category}</span>
                      {p.launchDate && (
                         <span className="font-sans text-[0.55rem] uppercase tracking-tighter text-primary bg-primary/10 px-1.5 rounded flex items-center gap-1">
                            <Clock size={8} /> Agendado
                         </span>
                      )}
                    </div>
                    <p className="font-sans text-xs font-semibold text-foreground mt-1 tabular-nums">
                      R$ {p.price.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-display text-2xl text-foreground mb-6">Controle de <span className="gold-accent">Pedidos</span></h2>
            {mockOrders.map((o) => (
              <div key={o.id} className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-primary/30">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingBag size={20} />
                   </div>
                   <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground">{o.id}</span>
                      <span className={`text-[0.55rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                    <h4 className="font-display text-lg text-foreground">{o.client}</h4>
                    <p className="font-sans text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/10 pt-4 sm:pt-0">
                  <div className="text-right">
                     <p className="font-sans text-[0.6rem] uppercase text-muted-foreground">Total do Pedido</p>
                     <p className="font-sans text-lg font-bold text-foreground tabular-nums">
                      R$ {o.total.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button className="btn-outline-atelier text-[10px] py-2 px-4">
                    Detalhes
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* CLIENTS TAB */}
        {tab === "clients" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-display text-2xl text-foreground mb-6">Nossos <span className="gold-accent">Clientes Exclusivos</span></h2>
            {mockClients.map((c) => (
              <div key={c.name} className="glass-card p-6 flex items-center justify-between flex-wrap gap-4 border-l-4 border-l-accent/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border/10 shadow-inner group overflow-hidden relative">
                    <span className="font-display text-xl text-foreground z-10">{c.name[0]}</span>
                    <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-foreground flex items-center gap-2">
                      {c.name}
                      {c.vip && (
                        <div className="flex items-center gap-1 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                           <Crown size={10} className="gold-accent" />
                           <span className="text-[0.6rem] gold-accent uppercase font-bold tracking-tighter">Gold VIP</span>
                        </div>
                      )}
                    </h4>
                    <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted-foreground">{c.orders} Encomendas realizadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground">Valor Vitalício (LTV)</p>
                  <p className="font-sans text-lg font-bold text-foreground tabular-nums">
                    R$ {c.ltv.toFixed(2).replace(".", ",")}
                  </p>
                  <button className="text-[10px] uppercase font-bold text-primary hover:underline mt-1">Ver Histórico</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
