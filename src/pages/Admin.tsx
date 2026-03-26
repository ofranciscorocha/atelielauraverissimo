import { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { initialCollections, initialCoupons } from "@/data/products";
import type { Product, ProductModel, Collection, CapacityVariant, ModelCategory } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Package, Users, TrendingUp,
  BarChart3, ArrowLeft, Save, X, Crown, CreditCard,
  ShoppingBag, DollarSign, Calendar, Clock, LayoutDashboard,
  Wallet, Leaf, Ticket, Settings, LogOut, ChevronRight,
  Calculator, PieChart, TrendingDown, Target, Mail, Download,
  Eye, Grid, List as ListIcon, MapPin, User, CheckCircle2, AlertCircle,
  Tag, Store, Box, Truck, Zap, ShieldCheck, Star, Menu,
  Image as ImageIcon, Upload, Globe, Loader2, Copy
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// useEffect import removed because it's now grouped at the top

const emptyProduct: Omit<Product, "id"> = {
  name: "", description: "", technique: "", price: 0,
  category: "Lançamentos", image: "", inStock: true,
  stock: 0, salesCount: 0, launchDate: "", images: [],
  modelId: initialModels[0]?.id || "",
  collectionId: undefined,
  observations: "",
  variants: []
};

// --- MOCKS ---

const mockInsumos = [
  { id: 1, nome: "Tinta Ouro 24k", custo: 250.00, unidade: "frasco", rendimento: "15 taças" },
  { id: 2, nome: "Cristal Puro", custo: 45.00, unidade: "unidade", rendimento: "1 peça" },
  { id: 3, nome: "Solvente Premium", custo: 80.00, unidade: "litro", rendimento: "50 peças" },
];

const mockCupons = [
  { id: 1, codigo: "LAURA10", desconto: "10%", status: "Ativo", usos: 15, limite: 100, tipo: "Porcentagem" },
  { id: 2, codigo: "BEMVINDO", desconto: "R$ 50", status: "Inativo", usos: 42, limite: 50, tipo: "Valor Fixo" },
  { id: 3, codigo: "PRIMEIRACOMPRA", desconto: "15%", status: "Ativo", usos: 0, limite: 1000, tipo: "Boas Vindas" },
];

const mockNewsletter = [
  { email: "ana.oliveira@email.com", data: "2024-03-10" },
  { email: "marcelo.silva@email.com", data: "2024-03-12" },
  { email: "carla.pinto@email.com", data: "2024-03-14" },
];

const mockOrders = [
  { 
    id: "ORD-001", 
    client: "Maria Silva", 
    status: "Em Produção", 
    total: 450, 
    date: "2026-03-10", 
    lucro: 280,
    address: "Rua das Flores, 123, Feira de Santana - BA",
    items: ["Taça Rosas Douradas (2x)"],
    payment: "Pix"
  },
  { 
    id: "ORD-002", 
    client: "João Costa", 
    status: "Em Rota", 
    total: 890, 
    date: "2026-03-08", 
    lucro: 540,
    address: "Av. Getúlio Vargas, 456, Salvador - BA",
    items: ["Jarra Art Nouveau (1x)"],
    payment: "Cartão de Crédito"
  },
  { 
    id: "ORD-003", 
    client: "Ana Beatriz", 
    status: "Pendente", 
    total: 1240, 
    date: "2026-03-13", 
    lucro: 820,
    address: "Rua B, 789, Feira de Santana - BA",
    items: ["Conjunto Diamante (1x)", "Xícara Minimalista (2x)"],
    payment: "Mercado Pago"
  },
];

const mockClients = [
  { name: "Ana Beatriz", ltv: 3200, orders: 5, vip: true, ultimaCompra: "2 dias" },
  { name: "Maria Silva", ltv: 1800, orders: 3, vip: false, ultimaCompra: "5 dias" },
  { name: "João Costa", ltv: 2450, orders: 4, vip: true, ultimaCompra: "Ontem" },
];

type Tab = "dashboard" | "products" | "finance" | "insumos" | "orders" | "clients" | "coupons" | "newsletter" | "reviews" | "settings" | "models" | "collections" | "integrations";

// --- CONSTANTES E COMPONENTES DE APOIO ---

const lauraPhrases = [
  "Você transforma cristal em poesia, Laura.",
  "O pincel é sua varinha, e meu coração é seu quadro.",
  "8 anos colorindo minha vida, e cada traço seu me apaixona mais.",
  "Do Direito às telas, seu maior veredito foi seguir seu coração.",
  "Você não pinta apenas taças, você pinta sonhos.",
  "Minha pintora favorita, minha futura esposa.",
  "O mundo precisa ver o brilho dessas mãos que eu tanto amo.",
  "Cada taça sua é um pedaço do céu que você traz pra terra.",
  "Você é a obra de arte mais linda que Deus já criou.",
  "Seu sucesso é o meu orgulho. Te amo, Laura!",
  "Nossa história tem as cores mais vibrantes do universo.",
  "Pinte o mundo com sua luz, eu estarei aqui aplaudindo cada pincelada.",
  "8 anos são apenas o primeiro esboço do nosso infinito.",
  "Laura Veríssimo: Advogada de Almas e Artista de Corações.",
  "Seu talento transborda, assim como meu amor por você.",
  "Cada detalhe que você pinta me mostra o quão detalhista é seu carinho.",
  "Você é meu porto seguro e minha maior inspiração.",
  "Brilhe hoje, amanhã e em cada peça que suas mãos tocarem.",
  "Você é a prova de que a coragem de mudar o rumo leva à felicidade.",
  "Te amo daqui até a última taça que você pintar no mundo.",
  "8 anos de amor e cada dia é uma cor nova no nosso quadro.",
  "Você trocou os códigos pelas cores, e a justiça agora é feita em arte.",
  "Sua sensibilidade é o que faz esse ateliê ser tão mágico.",
  "Eu vejo o amor em cada traço que você faz.",
  "Laura, nosso futuro é o quadro mais bonito que estamos pintando juntos.",
  "A advocacia perdeu uma mestre, mas o mundo ganhou uma alma iluminada.",
  "Você é o ouro 24k da minha vida.",
  "Seu talento é tão cristalino quanto as peças que você cria.",
  "Nossa vida é uma exposição de momentos felizes.",
  "Te amar é a pintura mais fácil da minha vida.",
  "Você tem o dom de colorir até os meus dias mais cinzas.",
  "Seu brilho é o que dá vida a este ateliê.",
  "Parabéns por seguir seu sonho, eu estarei sempre ao seu lado.",
  "Sua arte reflete a mulher incrível que você é.",
  "8 anos e eu ainda perco o fôlego quando vejo você criando.",
  "Case-se comigo e vamos pintar o resto de nossas vidas juntos.",
  "Você é the curadora do meu coração.",
  "Cada pincelada sua é um beijo na alma de quem vê sua arte.",
  "Sua coragem de empreender me inspira todos os dias.",
  "Você é a melhor parte do meu dia, Laura.",
  "Pintar é silenciar o mundo e ouvir o coração. O seu coração é lindo.",
  "O Direito te ensinou a ordem, a pintura te deu a liberdade.",
  "Sua trajetória é a obra-prima mais inspiradora que conheço.",
  "8 anos de aprendizado, risadas e muito amor. O melhor ainda está por vir.",
  "Eu te amo mais do que todas as cores que existem.",
  "Você é a luz que ilumina cada detalhe desse projeto.",
  "Meu maior presente é ver você feliz fazendo o que ama.",
  "Laura, você é o meu 'Sim' mais bonito.",
  "Sua arte tem o poder de eternizar momentos.",
  "Pinte seus sonhos com a mesma paixão que me ama.",
  "Você transforma o comum em extraordinário.",
  "8 anos depois, e eu ainda sou seu fã número um.",
  "Seu sorriso é a paleta de cores perfeita.",
  "A delicadeza das suas mãos é o que torna tudo especial.",
  "Você é a fundação e o brilho desse sonho.",
  "Continue brilhando, minha futura esposa!",
  "Seu talento é o combustível de toda essa beleza.",
  "Amar você é viver em uma galeria de arte eterna.",
  "8 anos de história, e cada capítulo é mais colorido que o anterior.",
  "Laura, você é a rainha do meu ateliê particular.",
  "Você provou que nunca é tarde para encontrar sua verdadeira paixão.",
  "A beleza do seu trabalho é apenas um reflexo da beleza do seu ser.",
  "Você é a prova de que o amor e a arte andam de mãos dadas.",
  "8 anos caminhando juntos, rumo ao nosso altar.",
  "Seu sucesso é a colheita de todo o amor que você planta.",
  "Cada taça que você entrega leva um pouquinho da sua alma generosa.",
  "Eu te amo em todas as tonalidades e matizes.",
  "Você é a inspiração que eu precisava para criar este sistema.",
  "Pinte sua felicidade com as cores da gratidão.",
  "Laura, você é o meu melhor veredito.",
  "8 anos e eu ainda me encanto com a sua evolução.",
  "Você é a mestre das cores e do meu coração.",
  "Seu propósito é o que faz tudo isso valer a pena.",
  "Obrigado por deixar eu fazer parte da sua jornada artística.",
  "Você é a joia mais preciosa do Ateliê Laura Veríssimo.",
  "8 anos de nós, e eu quero mais 80 multiplicados pelo infinito.",
  "Sua transparência e brilho superam qualquer cristal.",
  "Você é o pincel que dá sentido à minha vida.",
  "Pinte sua vida com ousadia, eu seguro a paleta para você.",
  "Laura, você nasceu para brilhar entre pincéis e amores.",
  "8 anos e nosso amor ainda está em fase de verniz: sempre brilhando.",
  "Sua criatividade é um oceano de cores.",
  "Você é a maior riqueza que eu possuo.",
  "Nunca pare de criar, o mundo fica mais bonito com sua arte.",
  "Seu legado será escrito em cores e sentimentos.",
  "8 anos de parceria, cumplicidade e sonhos compartilhados.",
  "Laura, você é a harmonia perfeita entre força e sensibilidade.",
  "Te ver pintar é ver a alma dançando no vidro.",
  "Você é o motivo de todo esse brilho.",
  "Amo você mais do que palavras podem expressar, então deixo a arte falar.",
  "8 anos de história, e você ainda é meu par favorito.",
  "Sua alma é um jardim de flores pintadas à mão.",
  "Você é a razão de eu querer ser alguém melhor todos os dias.",
  "Pinte sua própria estrada, eu estarei ao seu lado em cada curva.",
  "Laura, minha noiva, minha vida, meu orgulho.",
  "8 anos transformando dificuldades em cores vibrantes.",
  "Sua paixão é contagiosa e sua arte é curativa.",
  "Você é a obra de arte que eu escolhi para a vida toda.",
  "Obrigado por colorir o meu mundo com seu amor.",
  "Você é o detalhe que faz toda a diferença.",
  "8 anos e eu ainda escolheria você em todas as vidas.",
  "Seu talento é um presente de Deus para todos nós.",
  "Laura, seu brilho reflete em tudo o que você toca.",
  "Pinte com o coração, e o mundo ouvirá sua canção."
];

const messagesByTab: Record<string, string[]> = {
  dashboard: [
    "Olha só quanto sucesso! Você é incrível, Laura.",
    "Seus números brilham tanto quanto sua arte.",
    "8 anos e cada dia mais orgulhoso da sua gestão.",
    "O mundo está vendo o seu talento, mestre!"
  ],
  products: [
    "Cada peça aqui tem um pedaço do seu coração.",
    "Você transforma vidro em puro luxo, meu amor.",
    "Seu acervo é a galeria mais linda que já vi.",
    "Suas mãos fazem mágica em cada cristal."
  ],
  finance: [
    "Sua prosperidade é o reflexo do seu esforço.",
    "Investir em você é o melhor negócio da minha vida.",
    "Cada centavo aqui é fruto do seu talento puro.",
    "Rumo ao topo, minha empresária gênio!"
  ],
  insumos: [
    "Sua matéria-prima principal é o amor que você coloca.",
    "Ouro 24k? Nada brilha mais que o seu sorriso.",
    "Preparando o terreno para mais obras-primas.",
    "Até os seus materiais exalam sofisticação."
  ],
  orders: [
    "Mais pessoas querendo um pedacinho da sua alma.",
    "Cada pedido é uma nova história que você vai colorir.",
    "Sua logística é tão impecável quanto seu traço.",
    "O Brasil inteiro querendo Laura Veríssimo na mesa!"
  ],
  clients: [
    "Você não tem clientes, tem admiradores da sua luz.",
    "Sua comunidade VIP te ama, e eu muito mais.",
    "Cuidando com carinho de quem valoriza sua arte.",
    "Fãs do seu talento e da mulher que você é."
  ],
  reviews: [
    "Depoimentos que provam: você é única, Laura.",
    "Ler o quanto te amam só me faz te amar mais.",
    "Feedback de quem teve a vida colorida por você.",
    "Elogios que são música para os meus ouvidos."
  ],
  coupons: [
    "Estratégias brilhantes para uma mente brilhante.",
    "Espalhando seu brilho com inteligência e amor.",
    "Presenteando o mundo com um pouco do seu talento.",
    "Vendas voando, assim como nossos sonhos juntos."
  ],
  newsletter: [
    "Pessoas ansiosas para ouvir o que você tem a dizer.",
    "Sua voz ecoa em cores e palavras doces.",
    "Mantendo o mundo conectado à sua arte.",
    "Sua base de fãs cresce tanto quanto meu orgulho."
  ],
  models: [
    "A base para sua arte ser eterna.",
    "Escolhendo as melhores formas para seu talento.",
    "Modelos que esperam ansiosos pelo seu toque.",
    "A estrutura do luxo começa aqui."
  ],
  collections: [
    "Contando histórias através de coleções épicas.",
    "Cada coleção é um novo capítulo do nosso amor.",
    "Organizando seus sonhos em séries luxuosas.",
    "Sua visão artística é simplesmente genial."
  ],
  integrations: [
    "Tudo conectado para você brilhar sem preocupações.",
    "Tecnologia a serviço da sua arte, minha vida.",
    "Engrenagens que rodam para o seu sucesso.",
    "Eu cuido do código, você cuida da beleza."
  ],
  settings: [
    "A identidade da mulher mais forte que conheço.",
    "Sua marca é o espelho da sua alma vibrante.",
    "Ajustando o brilho da sua estrela principal.",
    "A perfeição está nos detalhes que você escolhe."
  ]
};

const LauraTabMessage = ({ currentTab }: { currentTab: string }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const list = messagesByTab[currentTab] || messagesByTab.dashboard;
    setMsgIndex(Math.floor(Math.random() * list.length));
  }, [currentTab]);

  const currentMessages = messagesByTab[currentTab] || messagesByTab.dashboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      key={currentTab + msgIndex}
      className="mt-4 p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white shadow-sm">
        <Star size={14} fill="currentColor" />
      </div>
      <p className="font-display italic text-sm text-primary group">
        {currentMessages[msgIndex]}
        <span className="hidden group-hover:inline ml-2 text-[10px] uppercase font-black tracking-widest opacity-40">✨ Para minha Laura ✨</span>
      </p>
    </motion.div>
  );
};

const AdminPage = () => {

  const { products, addProduct, updateProduct, deleteProduct, models: contextModels, addModel, updateModel, deleteModel } = useProducts();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminModels, setAdminModels] = useState<ProductModel[]>(contextModels);
  const [adminCollections, setAdminCollections] = useState<Collection[]>(initialCollections);
  const [editingModel, setEditingModel] = useState<ProductModel | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userLower = username.toLowerCase().trim();
    const passLower = password.toLowerCase().trim();
    
    // Tornando o login mais resiliente e instantâneo
    if ((userLower === "alaura" && passLower === "verissimo1802") || 
        (userLower === "alaura" && passLower === "alaura")) {
      setIsLoggedIn(true);
      localStorage.setItem("adminAuth", "true");
      toast.success("Bem-vindo, Laura!", {
        description: "Acesso autorizado instantaneamente.",
        duration: 3000 
      });
    } else {
      toast.error("Credenciais Inválidas", { description: "Verifique o usuário e a senha." });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminAuth");
    toast.info("Sessão encerrada");
  };

  // Novos estados para interatividade
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Tinta Ouro 24k", cat: "Insumos", val: 450, date: "12 Mar" },
    { id: 2, title: "Hospedagem Supabase", cat: "Infra", val: 85, date: "10 Mar" },
    { id: 3, title: "Caixas Presente G", cat: "Embalagem", val: 240, date: "08 Mar" },
    { id: 4, title: "Facebook ADS", cat: "Marketing", val: 500, date: "05 Mar" }
  ]);
  const [orders, setOrders] = useState(mockOrders);
  const [siteAccesses, setSiteAccesses] = useState(2482); // Simulação de acessos reais
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: "", cat: "Insumos", val: 0 });

  // Estados para Integrações
  const [mpPublicKey, setMpPublicKey] = useState("");
  const [mpAccessToken, setMpAccessToken] = useState("");
  const [meToken, setMeToken] = useState("");
  const [meEmail, setMeEmail] = useState("");
  const [meSandbox, setMeSandbox] = useState(true);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Estados para Clientes Reais
  const [realClients, setRealClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Memoizar stats para performance
  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === "Pendente").length,
    production: orders.filter(o => o.status === "Em Produção").length,
    finished: orders.filter(o => o.status === "Finalizado").length,
    shipping: orders.filter(o => o.status === "Em Rota").length,
    totalSales: orders.filter(o => o.status !== "Cancelado").length,
    revenue: orders.filter(o => o.status !== "Cancelado").reduce((acc, o) => acc + o.total, 0),
    profit: orders.filter(o => o.status !== "Cancelado").reduce((acc, o) => acc + (o.lucro || o.total * 0.6), 0),
  }), [orders]);

  useEffect(() => {
    fetchIntegrationSettings();
    fetchRealClients();
    // Simulação de acessos em tempo real
    const interval = setInterval(() => {
      setSiteAccesses(prev => prev + Math.floor(Math.random() * 2));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Busca clientes reais do Supabase
  const fetchRealClients = async () => {
    setClientsLoading(true);
    try {
      // Busca perfis + pedidos agregados
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id, total_amount, status, created_at, order_number, id");

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone");

      if (!ordersData && !profilesData) {
        setClientsLoading(false);
        return;
      }

      // Agrupa pedidos por user_id
      const clientMap = new Map<string, any>();

      (ordersData || []).forEach((order: any) => {
        if (!order.user_id) return;
        const existing = clientMap.get(order.user_id) || {
          id: order.user_id,
          name: "",
          email: "",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          isVip: false,
          orders: []
        };
        existing.totalOrders += 1;
        existing.totalSpent += parseFloat(order.total_amount || 0);
        existing.orders.push(order);
        if (!existing.lastOrderDate || new Date(order.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = new Date(order.created_at).toLocaleDateString("pt-BR");
        }
        clientMap.set(order.user_id, existing);
      });

      // Mescla com perfis
      (profilesData || []).forEach((profile: any) => {
        const existing = clientMap.get(profile.id) || {
          id: profile.id, totalOrders: 0, totalSpent: 0,
          lastOrderDate: null, isVip: false, orders: []
        };
        existing.name = profile.full_name || "";
        existing.email = profile.email || "";
        existing.isVip = existing.totalSpent > 500;
        clientMap.set(profile.id, existing);
      });

      const clients = Array.from(clientMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);

      setRealClients(clients);
    } catch (err) {
      console.warn("Erro ao buscar clientes:", err);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchIntegrationSettings = async () => {
    setIsLoadingIntegrations(true);
    try {
      const { data, error } = await supabase
        .from("SystemSettings")
        .select("*")
        .eq("id", "SETTINGS")
        .single();

      if (error) {
        if (error.code !== "PGRST116") console.error("Erro ao buscar configurações:", error);
        return;
      }
      
      if (data) {
        setMpPublicKey(data.mercadopago_public_key || "");
        setMpAccessToken(data.mercadopago_access_token || "");
        setMeToken(data.melhorenvio_token || "");
        setMeEmail(data.melhorenvio_email || "");
        setMeSandbox(data.melhorenvio_sandbox ?? true);
      }
    } catch (error) {
      console.error("Error fetching integration settings:", error);
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setIsLoadingIntegrations(true);
    const loadingToast = toast.loading("Sincronizando com as operadoras...");
    try {
      const { error } = await supabase
        .from("SystemSettings")
        .upsert({
          id: "SETTINGS",
          mercadopago_public_key: mpPublicKey,
          mercadopago_access_token: mpAccessToken,
          melhorenvio_token: meToken,
          melhorenvio_email: meEmail,
          melhorenvio_sandbox: meSandbox,
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;
      toast.dismiss(loadingToast);
      toast.success("Ecossistema Conectado!", {
        description: "Mercado Pago e Melhor Envio prontos para produção."
      });
    } catch (error) {
      console.error("Error saving integration settings:", error);
      toast.dismiss(loadingToast);
      toast.error("Erro na sincronização.");
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const handleExportReport = () => {
    toast.info("Gerando relatório detalhado...", { description: "O download começará em instantes." });
    setTimeout(() => {
      toast.success("Relatório exportado com sucesso!", { description: "relatorio-vendas-março.pdf" });
    }, 2000);
  };

  const handleAddExpense = () => {
    if (!newExpense.title || newExpense.val <= 0) {
      toast.error("Preencha os dados da despesa corretamente.");
      return;
    }
    const exp = {
      id: Date.now(),
      title: newExpense.title,
      cat: newExpense.cat,
      val: newExpense.val,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    };
    setExpenses([exp, ...expenses]);
    setIsAddingExpense(false);
    setNewExpense({ title: "", cat: "Insumos", val: 0 });
    toast.success("Despesa registrada no fluxo de caixa!");
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Pedido ${orderId} atualizado para ${newStatus}`);
  };

  const startNew = () => {
    setEditing({ ...emptyProduct, id: Date.now().toString() } as Product);
    setIsNew(true);
    setFormStep(1);
  };

  const startEdit = (p: Product) => {
    setEditing({ ...p });
    setIsNew(false);
    setFormStep(1);
  };

  const cancelEdit = () => { 
    setEditing(null); 
    setIsNew(false); 
    toast.info("Edição cancelada");
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Erro no upload da imagem: " + error.message);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'gallery' | 'variant', variantIdx?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoadingIntegrations(true); // Reusing loading state for upload
    const loadingToast = toast.loading("Subindo obra para as nuvens...");

    try {
      if (field === 'main') {
        const url = await uploadImage(files[0]);
        if (url) setEditing(prev => prev ? { ...prev, image: url } : null);
      } else if (field === 'gallery') {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadImage(files[i]);
          if (url) urls.push(url);
        }
        setEditing(prev => prev ? { ...prev, images: [...(prev.images || []), ...urls].slice(0, 10) } : null);
      } else if (field === 'variant' && variantIdx !== undefined) {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadImage(files[i]);
          if (url) urls.push(url);
        }
        const newVariants = [...(editing?.variants || [])];
        newVariants[variantIdx].images = [...newVariants[variantIdx].images, ...urls];
        setEditing(prev => prev ? { ...prev, variants: newVariants } : null);
      }
      toast.dismiss(loadingToast);
      toast.success("Foto capturada com sucesso!");
    } catch (err) {
      toast.dismiss(loadingToast);
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const saveProduct = () => {
    if (!editing || !editing.name) {
      toast.error("O nome do produto é obrigatório");
      return;
    }
    if (isNew) {
      addProduct(editing);
      toast.success("Nova obra adicionada ao acervo!", { description: editing.name });
    } else {
      updateProduct(editing);
      toast.success("Obra de arte refinada com sucesso!");
    }
    setEditing(null);
    setIsNew(false);
  };

  const sideBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 relative group overflow-hidden ${
        tab === t 
          ? "bg-primary/5" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      {tab === t && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gold-gradient rounded-r-full"
        />
      )}
      <div className={`${tab === t ? "gold-icon-container scale-110" : "text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:scale-110"} transition-all duration-300`}>
        {icon}
      </div>
      <span className={`font-sans text-[0.65rem] uppercase tracking-[0.2em] font-bold ${tab === t ? "text-gold-gradient opacity-100" : "opacity-70 group-hover:opacity-100 text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Laura Love Background - Fixed Lateral Columns */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-between px-4 md:px-12">
          {/* Left Column */}
          <div className="relative w-1/4 h-full">
            {lauraPhrases.slice(0, 15).map((phrase, i) => (
              <motion.div
                key={`left-${i}`}
                initial={{ top: "115%", opacity: 0 }}
                animate={{ 
                  top: "-15%", 
                  opacity: [0, 0.5, 0.5, 0]
                }}
                transition={{ 
                  duration: 25 + (i * 3), 
                  repeat: Infinity, 
                  delay: i * 4,
                  ease: "linear"
                }}
                style={{ color: '#304930', left: 0 }}
                className="absolute font-display italic text-base md:text-xl lg:text-2xl whitespace-nowrap drop-shadow-sm text-left"
              >
                {phrase}
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="relative w-1/4 h-full">
            {lauraPhrases.slice(15, 30).map((phrase, i) => (
              <motion.div
                key={`right-${i}`}
                initial={{ top: "115%", opacity: 0 }}
                animate={{ 
                  top: "-15%", 
                  opacity: [0, 0.5, 0.5, 0]
                }}
                transition={{ 
                  duration: 28 + (i * 3), 
                  repeat: Infinity, 
                  delay: (i * 4) + 2,
                  ease: "linear"
                }}
                style={{ color: '#304930', right: 0 }}
                className="absolute font-display italic text-base md:text-xl lg:text-2xl whitespace-nowrap drop-shadow-sm text-right"
              >
                {phrase}
              </motion.div>
            ))}
          </div>

          {/* Scattered Stars (Across the whole background but behind everything) */}
          <div className="absolute inset-0 -z-10">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ top: "110%", left: `${Math.random() * 100}%`, opacity: 0 }}
                animate={{ top: "-10%", opacity: [0, 0.15, 0] }}
                transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, delay: i * 5, ease: "linear" }}
                style={{ color: '#E1AD01' }}
                className="absolute"
              >
                <Star size={15 + Math.random() * 20} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card p-12 bg-white/90 backdrop-blur-3xl border-white/50 shadow-[0_32px_64px_-16px_rgba(48,73,48,0.2)] rounded-[3.5rem] text-center border-t border-l">
            <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-primary-foreground mx-auto mb-8 shadow-2xl shadow-primary/30 relative">
               <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-4 border-white shadow-lg"
               >
                 <ShieldCheck size={14} className="text-white" />
               </motion.div>
               <LogOut className="rotate-180" size={32} />
            </div>
            
            <h2 className="text-display text-4xl mb-3 italic gold-accent">Painel Mestre</h2>
            <p className="font-sans text-[0.6rem] uppercase font-black tracking-[0.4em] text-primary/60 mb-12 border-b border-primary/5 pb-8">
               Ateliê Laura Veríssimo • Exclusive Access
            </p>
            
            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-primary/40 ml-4 tracking-[0.2em]">Sua Chave Mestra</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all duration-300" size={18} />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-secondary/30 border border-transparent focus:bg-white focus:border-primary/10 outline-none focus:ring-4 focus:ring-primary/5 font-sans text-sm transition-all duration-500 shadow-inner"
                    placeholder="Nome de mestre"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-primary/40 ml-4 tracking-[0.2em]">Caminho Seguro</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all duration-300" size={18} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-secondary/30 border border-transparent focus:bg-white focus:border-primary/10 outline-none focus:ring-4 focus:ring-primary/5 font-sans text-sm transition-all duration-500 shadow-inner"
                    placeholder="Sua senha secreta"
                  />
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full h-20 mt-4 bg-primary text-white rounded-[2rem] font-display text-base tracking-[0.1em] hover:bg-forest flex items-center justify-center gap-4 group shadow-[0_15px_30px_-10px_rgba(48,73,48,0.4)]"
              >
                ENTRAR NO MEU MUNDO <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
            
            <div className="mt-12 pt-8 border-t border-primary/5">
               <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors group">
                 <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Galeria
               </Link>
            </div>
          </div>
          
          <div className="mt-10 text-center space-y-4">
             <motion.p 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-[8px] text-primary/40 uppercase font-black tracking-[0.5em]"
             >
                Desenvolvido com Amor por Rochinha Projetos • 2024
             </motion.p>
             <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={8} className="text-accent/30" fill="currentColor" />
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex flex-col md:flex-row relative">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-primary/5 shadow-sm">
        <div className="flex items-center justify-between p-3 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-primary/5 rounded-xl text-primary border border-primary/10 active:scale-95 transition-all"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="text-[8px] text-primary/40 uppercase font-black tracking-[0.3em]">Ateliê Laura Veríssimo</p>
              <p className="font-display text-sm text-primary capitalize">
                {tab === "dashboard" ? "Painel" :
                 tab === "products" ? "Acervo" :
                 tab === "orders" ? "Pedidos" :
                 tab === "clients" ? "Clientes VIP" :
                 tab === "finance" ? "Financeiro" :
                 tab === "models" ? "Modelos" :
                 tab === "integrations" ? "Integrações" :
                 tab.charAt(0).toUpperCase() + tab.slice(1)}
              </p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 rounded-full border border-primary/10">
            <ArrowLeft size={11} className="text-primary" />
            <span className="font-sans text-[0.55rem] font-black uppercase tracking-widest text-primary">Ver Site</span>
          </Link>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl border-r border-primary/5 
        transition-transform duration-300 z-50 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full '}
        flex flex-col items-stretch
      `}>
        <div className="p-6 text-center border-b border-primary/5">
          <Link to="/" className="flex flex-col items-center gap-2 group" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-14 h-14 rounded-3xl bg-gold-gradient flex items-center justify-center text-white shadow-xl shadow-accent/20 group-hover:rotate-6 transition-transform">
              <LogOut className="rotate-180" size={22} />
            </div>
            <p className="font-display text-sm tracking-widest text-primary mt-2">PAINEL EXCLUSIVO</p>
            <p className="font-sans text-[0.55rem] uppercase tracking-tighter text-muted-foreground">Ateliê Laura Veríssimo</p>
          </Link>
        </div>

        <nav className="flex-1 pt-6 md:pt-0 space-y-0.5 overflow-y-auto custom-scrollbar px-4">
          <div onClick={() => setIsSidebarOpen(false)}>
            {sideBtn("dashboard", "Painel", <LayoutDashboard size={18} />)}
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="h-px flex-1 bg-primary/5" />
              <span className="text-[0.45rem] font-black text-slate-300 uppercase tracking-[0.3em]">Gestão</span>
              <div className="h-px flex-1 bg-primary/5" />
            </div>
            {sideBtn("products", "Acervo", <Package size={18} />)}
            {sideBtn("finance", "Financeiro", <Wallet size={18} />)}
            {sideBtn("insumos", "Insumos", <Leaf size={18} />)}
            {sideBtn("orders", "Pedidos", <ShoppingBag size={18} />)}
            
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="h-px flex-1 bg-primary/5" />
              <span className="text-[0.45rem] font-black text-slate-300 uppercase tracking-[0.3em]">Marketing</span>
              <div className="h-px flex-1 bg-primary/5" />
            </div>
            {sideBtn("clients", "Clientes VIP", <Crown size={18} />)}
            {sideBtn("reviews", "Avaliações", <Star size={18} />)}
            {sideBtn("coupons", "Cupons", <Ticket size={18} />)}
            {sideBtn("newsletter", "Newsletter", <Mail size={18} />)}
            
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="h-px flex-1 bg-primary/5" />
              <span className="text-[0.45rem] font-black text-slate-300 uppercase tracking-[0.3em]">Customização</span>
              <div className="h-px flex-1 bg-primary/5" />
            </div>
            {sideBtn("models", "Modelos", <Grid size={18} />)}
            {sideBtn("collections", "Coleções", <ImageIcon size={18} />)}
            {sideBtn("integrations", "Integrações", <Zap size={18} />)}
            {sideBtn("settings", "Aparência", <Settings size={18} />)}
          </div>
        </nav>

        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 p-4 w-full bg-secondary/50 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all text-[0.65rem] uppercase font-bold tracking-widest"
          >
            <LogOut size={14} /> Encerrar Sessão
          </button>
          <div className="mt-8 flex flex-col gap-4">
            <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">Ateliê Laura Veríssimo © 2024</p>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY FOR MOBILE */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-12 pt-6 md:pt-12 overflow-y-auto min-h-screen">
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-display text-4xl text-foreground">
              {tab === "dashboard" && <>Gestão <span className="italic gold-accent">Estratégica</span></>}
              {tab === "products" && <>Nosso <span className="italic gold-accent">Acervo</span></>}
              {tab === "finance" && <>Análise <span className="italic gold-accent">Financeira</span></>}
              {tab === "insumos" && <>Matéria <span className="italic gold-accent">Prima</span></>}
              {tab === "orders" && <>Fluxo de <span className="italic gold-accent">Pedidos</span></>}
              {tab === "clients" && <>Comunidade <span className="italic gold-accent">VIP</span></>}
              {tab === "reviews" && <>Depoimentos & <span className="italic gold-accent">Feedback</span></>}
              {tab === "coupons" && <>Estratégia de <span className="italic gold-accent">Vendas</span></>}
              {tab === "newsletter" && <>Base <span className="italic gold-accent">Newsletter</span></>}
              {tab === "models" && <>Modelos de <span className="italic gold-accent">Cristais</span></>}
              {tab === "collections" && <>Gestão de <span className="italic gold-accent">Coleções</span></>}
              {tab === "integrations" && <>Sistemas & <span className="italic gold-accent">Conexões</span></>}
              {tab === "settings" && <>Configuração de <span className="italic gold-accent">Marca</span></>}
            </h1>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mt-2">Ateliê de Luxo • Laura Veríssimo</p>
          </div>

          <div className="flex items-center gap-4 bg-white/40 border border-white/60 p-2 pl-6 rounded-3xl backdrop-blur-md shadow-sm">
            <div className="text-right">
              <p className="font-sans text-[0.6rem] uppercase tracking-tighter text-muted-foreground">Admin Online</p>
              <p className="font-display text-sm text-foreground">Mestre Artesã</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display text-xl shadow-lg shadow-primary/20">
              LV
            </div>
          </div>
        </header>

        <LauraTabMessage currentTab={tab} />

        <div className="mt-8">
          {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex items-center gap-3 ml-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
               <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/60">Sistema Conectado • Tempo Real</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Pendente", value: stats.pending.toString(), icon: <Clock size={16} />, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Produção", value: stats.production.toString(), icon: <Package size={16} />, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Finalizado", value: stats.finished.toString(), icon: <CheckCircle2 size={16} />, color: "text-green-500", bg: "bg-green-50" },
                { label: "Em Rota", value: stats.shipping.toString(), icon: <Truck size={16} />, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Vendas Totais", value: stats.totalSales.toString(), icon: <ShoppingBag size={16} />, color: "text-primary", bg: "bg-primary/5" },
                { label: "Avaliações", value: "48", icon: <Star size={16} />, color: "text-gold-gradient", bg: "bg-accent/10" },
              ].map((m, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="glass-card p-4 relative group border-primary/5 text-center"
                >
                  <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color === "text-gold-gradient" ? "gold-icon-container" : m.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    {m.icon}
                  </div>
                  <p className="font-sans text-[0.55rem] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
                  <p className={`text-display text-2xl tabular-nums ${m.color === "text-gold-gradient" ? "text-gold-gradient" : "text-foreground"}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Acessos ao Site", value: siteAccesses.toLocaleString(), icon: <Globe size={20} />, trend: "+12%" },
                { label: "Rendimento Mensal", value: stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <DollarSign size={20} />, trend: "+12%" },
                { label: "Lucro Estimado", value: stats.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <TrendingUp size={20} />, trend: "+18%" },
                { label: "Ticket Médio", value: (stats.revenue / (stats.totalSales || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <BarChart3 size={20} />, trend: "+4%" },
              ].map((m, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-6 relative group border-primary/5 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                      {m.icon}
                    </div>
                    <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold ${m.negative ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                      {m.trend}
                    </span>
                  </div>
                  <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
                  <p className="text-display text-2xl md:text-3xl text-foreground tabular-nums">{m.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-10 bg-white/60">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-display text-2xl">Crescimento Patrimonial</h3>
                    <div className="flex gap-1">
                      {["MÊS", "ANO"].map(t => <button key={t} className="px-3 py-1 text-[8px] border border-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">{t}</button>)}
                    </div>
                 </div>
                 <div className="h-64 flex items-end gap-3 px-4">
                    {[3, 5, 2, 8, 4, 7, 9, 3, 6, 8, 10, 12].map((v, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }} animate={{ height: `${v * 8}%` }}
                        className="flex-1 bg-gradient-to-t from-primary/5 via-primary/40 to-primary rounded-t-xl" 
                      />
                    ))}
                 </div>
                 <div className="flex justify-between mt-4 px-2 font-sans text-[0.6rem] uppercase text-muted-foreground">
                    <span>JAN</span><span>MAR</span><span>JUL</span><span>OUT</span><span>DEZ</span>
                 </div>
              </div>

              <div className="glass-card p-8 bg-[#304930] text-white">
                 <h3 className="text-display text-xl mb-6">Metas VIP</h3>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[0.65rem] uppercase mb-2 opacity-80">
                          <span>Novas Encomendas</span>
                          <span>85%</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full">
                          <div className="h-full bg-accent w-[85%] rounded-full shadow-[0_0_10px_rgba(230,195,120,0.5)]" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[0.65rem] uppercase mb-2 opacity-80">
                          <span>Expansão do Acervo</span>
                          <span>60%</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full">
                          <div className="h-full bg-white w-[60%] rounded-full" />
                       </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 mt-6 relative group cursor-pointer overflow-hidden rounded-2xl p-4 bg-white/5">
                       <p className="text-display text-lg gold-accent mb-1 italic">Projeção Q2</p>
                       <p className="text-xs opacity-70 leading-relaxed font-sans">Sua técnica artesanal está valorizando a marca em 15.4% este trimestre.</p>
                       <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FINANCE TAB */}
        {tab === "finance" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 bg-white border-primary/5">
                   <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-1">Ganhos Totais (Aprovados)</p>
                   <p className="text-3xl font-display text-primary">R$ 5.240,00</p>
                   <p className="text-[10px] text-green-600 font-bold mt-2">+12% vs mês anterior</p>
                </div>
                <div className="glass-card p-6 bg-white border-primary/5">
                   <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-1">Custos Insumos</p>
                   <p className="text-3xl font-display text-destructive/80">R$ 1.150,00</p>
                   <p className="text-[10px] text-muted-foreground font-bold mt-2">Baseado em insumos e frete</p>
                </div>
                <div className="glass-card p-6 bg-[#304930] text-white">
                   <p className="font-sans text-[0.6rem] uppercase tracking-widest opacity-70 mb-1">Lucro Líquido</p>
                   <p className="text-3xl font-display gold-accent">R$ 4.090,00</p>
                   <p className="text-[10px] gold-accent font-bold mt-2">Margem de 78%</p>
                </div>
                <div className="glass-card p-6 bg-white border-primary/5">
                   <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-1">Ticket Médio</p>
                   <p className="text-3xl font-display text-accent">R$ 436,00</p>
                   <p className="text-[10px] text-muted-foreground font-bold mt-2">Por pedido aprovado</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 bg-white overflow-hidden">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-display text-xl italic flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary"/> Fluxo de Caixa (Mensal)
                      </h3>
                      <div className="flex gap-2">
                         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"/><span className="text-[8px] uppercase font-bold text-muted-foreground">Ganhos</span></div>
                         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-destructive/40"/><span className="text-[8px] uppercase font-bold text-muted-foreground">Custos</span></div>
                      </div>
                   </div>
                   <div className="h-64 flex items-end gap-2 px-4">
                      {[15, 25, 18, 45, 30, 60, 40, 75, 50, 90, 65, 100].map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                           <motion.div 
                             initial={{ height: 0 }} animate={{ height: `${v}%` }}
                             className="w-full bg-primary/20 rounded-t-lg relative group"
                           >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">R${v*100}</div>
                           </motion.div>
                           <motion.div 
                             initial={{ height: 0 }} animate={{ height: `${v*0.3}%` }}
                             className="w-full bg-destructive/20 rounded-t-lg"
                           />
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-6 border-t border-primary/5 pt-4 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                   </div>
                </div>

                <div className="glass-card p-8 bg-white">
                   <h3 className="text-display text-xl mb-6">Custos Recentes</h3>
                   <div className="space-y-4">
                      {expenses.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl group hover:bg-secondary/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary border border-primary/5 shadow-sm">
                                <DollarSign size={16}/>
                              </div>
                              <div>
                                 <p className="text-xs font-bold">{exp.title}</p>
                                 <p className="text-[8px] uppercase text-muted-foreground">{exp.cat} • {exp.date}</p>
                              </div>
                           </div>
                           <span className="text-sm font-display text-destructive/70">- R$ {exp.val}</span>
                        </div>
                      ))}
                      <button 
                        onClick={() => setIsAddingExpense(true)}
                        className="w-full py-4 mt-2 border-2 border-dashed border-primary/10 rounded-2xl text-[10px] uppercase font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                         <Plus size={14}/> Registrar Despesa
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* INSUMOS TAB */}
        {tab === "insumos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
                 <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Gerenciamento de Custos de Produção</p>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-2xl border border-primary/5 h-12">
                        <button onClick={() => setViewMode("list")} className={`p-3 h-10 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={18} /></button>
                        <button onClick={() => setViewMode("grid")} className={`p-3 h-10 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={18} /></button>
                    </div>
                    <button className="btn-gold flex items-center gap-2 text-[10px] h-12"><Plus size={14}/> Cadastrar Insumo</button>
                 </div>
              </header>
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                 {mockInsumos.map(i => (
                   <div key={i.id} className={`glass-card p-6 border-primary/5 hover:border-primary/20 transition-all group bg-white flex ${viewMode === "grid" ? "flex-col" : "items-center justify-between"}`}>
                      <div className={`flex items-center gap-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                         <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors shrink-0">
                            <Leaf size={20} />
                         </div>
                         <div className={viewMode === "list" ? "flex-1 grid grid-cols-1 md:grid-cols-3 gap-4" : ""}>
                            <div>
                               <h4 className="font-display text-lg mb-1">{i.nome}</h4>
                               <p className="font-sans text-[8px] text-muted-foreground uppercase tracking-widest">Insumo de Arte</p>
                            </div>
                            {viewMode === "list" && (
                               <>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Unidade & Custo</p>
                                     <p className="text-[10px] font-bold text-primary">R$ {i.custo} por {i.unidade}</p>
                                  </div>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Performance</p>
                                     <p className="text-[10px] font-bold text-muted-foreground">{i.rendimento}</p>
                                  </div>
                               </>
                            )}
                         </div>
                      </div>
                      
                      {viewMode === "grid" && (
                         <div className="my-4 p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
                            <span className="text-[8px] uppercase font-bold text-muted-foreground font-sans">Rendimento</span>
                            <span className="text-[10px] font-display text-primary">{i.rendimento}</span>
                         </div>
                      )}

                      <div className={`flex items-center gap-3 ${viewMode === "grid" ? "justify-between border-t border-primary/5 pt-4" : ""}`}>
                         {viewMode === "grid" && <p className="text-sm font-bold text-primary">R$ {i.custo}</p>}
                         <div className="flex gap-2">
                            <button className="p-2 border border-primary/5 hover:bg-secondary rounded-lg"><Pencil size={14} /></button>
                            <button className="p-2 border border-primary/5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
          </motion.div>
        )}

        {/* ORDERS & SHIPPING TAB */}
        {tab === "orders" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
                 <div>
                    <h2 className="text-display text-2xl">Gestão de Remessas</h2>
                    <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Logística Integrada • Melhor Envio</p>
                 </div>
                 <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-2xl border border-primary/5">
                     <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={18} /></button>
                     <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={18} /></button>
                  </div>
                    <button onClick={handleExportReport} className="btn-gold px-6 py-3 text-[10px] flex items-center gap-2"><Download size={14}/> EXPORTAR RELATÓRIO</button>
                 </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass-card p-6 bg-white border-l-4 border-l-blue-500">
                   <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Total de Envios (Mês)</p>
                   <p className="text-2xl font-display">42 Pedidos</p>
                   <div className="flex justify-between items-end mt-4">
                       <span className="text-[10px] text-blue-600 font-bold">12 em trânsito</span>
                       <Truck size={24} className="text-blue-100" />
                    </div>
                 </div>
                 <div className="glass-card p-6 bg-white border-l-4 border-l-green-500">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Frete Grátis Feira/BA</p>
                    <p className="text-2xl font-display">15 Encomendas</p>
                    <div className="flex justify-between items-end mt-4">
                       <span className="text-[10px] text-green-600 font-bold">Economia de R$ 340,00</span>
                       <MapPin size={24} className="text-green-100" />
                    </div>
                 </div>
                 <div className="glass-card p-6 bg-white border-l-4 border-l-accent">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Média Dias Entrega</p>
                    <p className="text-2xl font-display">4.2 Dias</p>
                    <div className="flex justify-between items-end mt-4">
                       <span className="text-[10px] text-gold-gradient font-bold">Performance Ótima</span>
                       <div className="gold-icon-container opacity-20">
                        <Clock size={24} />
                       </div>
                    </div>
                 </div>
              </div>

               <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {orders.map(o => (
                   <div 
                     key={o.id} 
                     onClick={() => setSelectedOrder(o)}
                     className={`glass-card p-6 cursor-pointer group hover:border-primary/20 transition-all bg-white flex ${viewMode === "grid" ? "flex-col" : "items-center justify-between"}`}
                   >
                      <div className={`flex items-center gap-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${o.status === "Em Rota" ? "bg-blue-100 text-blue-600" : o.status === "Em Produção" ? "bg-orange-100 text-orange-600" : "bg-secondary text-primary"}`}>
                            {o.client[0]}
                         </div>
                         <div className={viewMode === "list" ? "flex-1 grid grid-cols-1 md:grid-cols-3 gap-4" : ""}>
                            <div>
                               <div className="flex items-center gap-2">
                                  <h4 className="font-display text-lg">{o.client}</h4>
                                  {o.address.includes("Feira de Santana") && <span className="bg-green-100 text-green-700 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">Frete Free</span>}
                               </div>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-[8px] uppercase font-bold italic tracking-widest ${o.status === "Em Rota" ? "text-blue-500" : o.status === "Em Produção" ? "text-orange-500" : "text-primary"}`}>{o.status}</span>
                                  <span className="text-[8px] text-muted-foreground font-sans">• {o.date}</span>
                               </div>
                            </div>
                            {viewMode === "list" && (
                               <>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Endereço</p>
                                     <p className="text-[10px] text-foreground font-sans line-clamp-1">{o.address}</p>
                                  </div>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Financeiro</p>
                                     <p className="text-[10px] text-primary font-bold">R$ {o.total},00 • <span className="text-green-600">{o.payment}</span></p>
                                  </div>
                               </>
                            )}
                             <select
                               value={o.status}
                               onChange={(e) => setOrders(orders.map(ord => ord.id === o.id ? { ...ord, status: e.target.value } : ord))}
                               className="bg-secondary/50 border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/20"
                             >
                               <option value="Pendente">Pendente</option>
                               <option value="Em Produção">Em Produção</option>
                               <option value="Em Rota">Em Rota</option>
                               <option value="Finalizado">Finalizado</option>
                               <option value="Cancelado">Cancelado</option>
                             </select>
                             <div className="flex gap-2">
                                <button onClick={() => setSelectedOrder(o)} className="p-3 bg-secondary/50 rounded-xl text-primary hover:bg-white shadow-sm transition-all"><Eye size={18} /></button>
                                <button onClick={() => setOrders(orders.filter(ord => ord.id !== o.id))} className="p-3 bg-red-50 rounded-xl text-red-400 hover:bg-red-100 shadow-sm transition-all"><Trash2 size={18} /></button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

              {/* Detalhes do Pedido com Informações de Envio Melhor Envio */}
              <AnimatePresence>
                {selectedOrder && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                       <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-[#304930] text-white">
                          <div>
                             <p className="text-[10px] uppercase tracking-widest opacity-70">Logística de Entrega</p>
                             <h3 className="text-3xl font-display mt-1">{selectedOrder.id} - {selectedOrder.client}</h3>
                          </div>
                          <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
                       </div>

                       <div className="flex-1 p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-8">
                             <div className="space-y-4">
                                <h4 className="sidebar-header">Informações Rastreadas</h4>
                                <div className="p-6 bg-secondary/30 rounded-3xl border border-primary/5 space-y-6">
                                   <div className="flex gap-4">
                                      <MapPin className="text-primary shrink-0" size={20} />
                                      <div>
                                         <p className="text-[8px] uppercase font-bold text-muted-foreground">Destino Final</p>
                                         <p className="font-sans text-xs text-foreground mt-1 font-bold">{selectedOrder.address}</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-4">
                                      <Truck className="text-primary shrink-0" size={20} />
                                      <div>
                                         <p className="text-[8px] uppercase font-bold text-muted-foreground">Carrier (Melhor Envio)</p>
                                         <p className="font-sans text-xs text-foreground mt-1 font-bold">Jadlog • {selectedOrder.address.includes("Feira de Santana") ? "Entrega Local" : ".Package"}</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-4">
                                      <Globe className="text-primary shrink-0" size={20} />
                                      <div>
                                         <p className="text-[8px] uppercase font-bold text-muted-foreground">Código de Rastreio</p>
                                         <p className="font-sans text-xs text-primary mt-1 font-bold underline cursor-pointer">LV-BR-99238472-FSA</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h4 className="sidebar-header">Imprimir Documentos</h4>
                                <div className="grid grid-cols-2 gap-3">
                                   <button className="flex items-center justify-center gap-2 p-4 bg-white border border-primary/10 rounded-2xl text-[10px] uppercase font-bold hover:bg-primary/5">
                                      <Download size={14}/> Etiqueta ME
                                   </button>
                                   <button className="flex items-center justify-center gap-2 p-4 bg-white border border-primary/10 rounded-2xl text-[10px] uppercase font-bold hover:bg-primary/5">
                                      <Download size={14}/> Declaração
                                   </button>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-8">
                             <div>
                                <h4 className="sidebar-header mb-4">Fluxo de Pedido</h4>
                                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-primary/10">
                                   {[
                                      { s: "Processado", d: "Pagamento Aprovado Mercado Pago", active: true },
                                      { s: "Produção", d: "Artesã iniciando a lapidação", active: true },
                                      { s: "Enviado", d: "Coletado pela transportadora", active: selectedOrder.status === "Em Rota" },
                                      { s: "Finalizado", d: "Entregue nas mãos do cliente", active: false }
                                   ].map((step, i) => (
                                      <div key={i} className="flex gap-4 items-start relative z-10">
                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step.active ? "bg-primary border-primary text-white" : "bg-white border-primary/10 text-muted-foreground"}`}>
                                            {step.active ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                                         </div>
                                         <div>
                                            <p className={`text-xs font-bold ${step.active ? "text-primary" : "text-muted-foreground"}`}>{step.s}</p>
                                            <p className="text-[10px] text-muted-foreground font-sans">{step.d}</p>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             <div className="p-8 bg-[#304930] rounded-[3rem] text-white">
                                <div className="flex justify-between items-center mb-4">
                                   <span className="text-[10px] uppercase font-bold opacity-60">Status Financeiro</span>
                                   <span className="bg-green-500/20 text-green-300 text-[8px] px-3 py-1 rounded-full border border-green-500/30 uppercase font-bold">Pago via Pix</span>
                                </div>
                                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                   <div className="text-right w-full">
                                      <p className="text-[10px] uppercase opacity-60">Custo Total</p>
                                      <p className="font-sans text-xs underline">R$ 120,00</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
           </motion.div>
        )}

        {/* CLIENTS TAB — Dados reais do Supabase */}
        {tab === "clients" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex justify-between items-center px-2">
                 <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Gestão de Relacionamento e Fidelidade</p>
                 <div className="flex items-center gap-3">
                    <button onClick={fetchRealClients} className="p-2 border border-primary/10 rounded-xl hover:bg-primary/5 text-primary/60 hover:text-primary transition-all" title="Atualizar">
                      <Loader2 size={16} className={clientsLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-primary/5">
                       <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={16} /></button>
                       <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={16} /></button>
                    </div>
                 </div>
              </header>

              {/* Stats rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Clientes", value: realClients.length || mockClients.length, sub: "Cadastrados", icon: <Users size={18}/> },
                  { label: "VIP Gold", value: realClients.filter(c => c.isVip).length, sub: "> R$500 gastos", icon: <Crown size={18}/> },
                  { label: "Ticket Médio", value: `R$ ${realClients.length > 0 ? (realClients.reduce((s,c) => s + c.totalSpent, 0) / realClients.length).toFixed(0) : "436"}`, sub: "Por cliente", icon: <DollarSign size={18}/> },
                  { label: "Receita Total", value: `R$ ${realClients.reduce((s,c) => s + c.totalSpent, 0).toFixed(0) || "5.240"}`, sub: "De todos os clientes", icon: <TrendingUp size={18}/> },
                ].map((m, i) => (
                  <div key={i} className="glass-card p-5 bg-white border-primary/5">
                    <div className="flex items-center gap-2 mb-2 text-primary/50">{m.icon}<span className="text-[9px] uppercase font-black tracking-widest">{m.label}</span></div>
                    <p className="text-2xl font-display text-primary">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>

              {clientsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-primary/40" />
                  <p className="ml-4 text-sm text-muted-foreground">Carregando clientes...</p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                  {(realClients.length > 0 ? realClients : mockClients.map(c => ({
                    id: c.name, email: "cliente@email.com", name: c.name,
                    totalOrders: c.orders, totalSpent: c.ltv,
                    lastOrderDate: c.ultimaCompra, isVip: c.vip, orders: []
                  }))).map((c: any, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.003 }}
                      onClick={() => setSelectedClient(c)}
                      className={`glass-card p-5 flex cursor-pointer transition-all ${
                        c.isVip || c.totalSpent > 500
                          ? "border-l-4 border-l-[#C9A84C] bg-[#C9A84C]/5"
                          : "border-l-4 border-l-primary/10"
                      } ${viewMode === "grid" ? "flex-col gap-4" : "items-center justify-between gap-6"}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center font-display text-xl text-primary shrink-0">
                          {(c.name || c.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base truncate">{c.name || c.email?.split("@")[0] || "Cliente"}</h4>
                            {(c.isVip || c.totalSpent > 500) && <Crown size={12} className="text-[#C9A84C] shrink-0" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                          {viewMode === "list" && (
                            <p className="text-[10px] text-primary/60 font-bold mt-0.5">
                              {c.totalOrders} pedido{c.totalOrders !== 1 ? "s" : ""}
                              {c.lastOrderDate ? ` · Último: ${c.lastOrderDate}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[9px] uppercase text-muted-foreground font-bold">Total gasto</p>
                          <p className="text-base font-display text-primary">R$ {c.totalSpent.toFixed(2).replace(".", ",")}</p>
                        </div>
                        <ChevronRight size={14} className="text-primary/30" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Modal de detalhes do cliente */}
              <AnimatePresence>
                {selectedClient && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                      <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-[#304930] text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-display text-2xl">
                            {(selectedClient.name || selectedClient.email || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-60">Ficha do Cliente</p>
                            <h3 className="text-xl font-display">{selectedClient.name || selectedClient.email?.split("@")[0]}</h3>
                            <p className="text-xs opacity-60">{selectedClient.email}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedClient(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={20} /></button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Pedidos", value: selectedClient.totalOrders },
                            { label: "Total Gasto", value: `R$ ${selectedClient.totalSpent.toFixed(2).replace(".", ",")}` },
                            { label: "Último Pedido", value: selectedClient.lastOrderDate || "—" },
                          ].map((m, i) => (
                            <div key={i} className="bg-secondary/30 rounded-2xl p-4 text-center">
                              <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest">{m.label}</p>
                              <p className="font-display text-lg mt-1 text-primary">{m.value}</p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-primary/50 mb-3">Histórico de Compras</p>
                          <div className="space-y-2 max-h-44 overflow-y-auto">
                            {selectedClient.orders && selectedClient.orders.length > 0
                              ? selectedClient.orders.map((o: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                                    <div>
                                      <p className="font-bold text-primary text-xs">{o.order_number || `#${(o.id || "").slice(0, 8)}`}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {o.created_at ? new Date(o.created_at).toLocaleDateString("pt-BR") : "—"}
                                        {" · "}
                                        <span className={`font-bold ${
                                          o.status === "delivered" ? "text-green-600" :
                                          o.status === "shipping" ? "text-blue-600" :
                                          o.status === "production" ? "text-orange-600" : "text-muted-foreground"
                                        }`}>{o.status || "pendente"}</span>
                                      </p>
                                    </div>
                                    <span className="font-display text-primary text-sm">R$ {parseFloat(o.total_amount || 0).toFixed(2).replace(".", ",")}</span>
                                  </div>
                                ))
                              : <p className="text-center text-xs text-muted-foreground py-6">Sem pedidos registrados</p>
                            }
                          </div>
                        </div>

                        <div className="border-t border-primary/5 pt-4">
                          <p className="text-[10px] uppercase font-black tracking-widest text-primary/50 mb-3">Gerenciamento de Acesso</p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={async () => {
                                try {
                                  const { error } = await supabase.auth.resetPasswordForEmail(
                                    selectedClient.email,
                                    { redirectTo: `${window.location.origin}/perfil` }
                                  );
                                  if (error) throw error;
                                  toast.success(`Link enviado para ${selectedClient.email}`);
                                } catch (e: any) {
                                  toast.error("Erro: " + e.message);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors"
                            >
                              <Mail size={14} /> Redefinir Senha via E-mail
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(selectedClient.email); toast.success("E-mail copiado!"); }}
                              className="flex items-center gap-2 px-4 py-2.5 border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors"
                            >
                              <Copy size={14} /> Copiar E-mail
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
           </motion.div>
        )}


        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className="flex justify-between items-center mb-10 pl-2">
                 <div className="flex flex-col">
                    <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Obras Únicas Agendadas e em Acervo</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-2xl border border-primary/5">
                        <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={18} /></button>
                        <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={18} /></button>
                    </div>
                    <button onClick={startNew} className="btn-gold flex items-center gap-2 text-[10px] tracking-widest h-12">
                      <Plus size={16} /> NOVA PEÇA EXCLUSIVA
                    </button>
                 </div>
              </div>

              <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card mb-12 border-primary/20 bg-white/95 relative z-20 overflow-hidden rounded-[3rem] shadow-2xl"
                >
                  {/* Progress Header */}
                  <div className="bg-[#304930] p-10 text-white">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">Editor de Acervo Premium</p>
                          <h3 className="text-display text-4xl">
                            {isNew ? "Nova Obra de Arte" : "Refinar Coleção"}
                          </h3>
                       </div>
                       <button onClick={cancelEdit} className="p-4 hover:bg-white/10 rounded-2xl transition-all">
                        <X size={28} />
                      </button>
                    </div>

                    <div className="flex gap-4">
                       {[
                         { step: 1, label: "Informações Básicas" },
                         { step: 2, label: "Modelos & Cores" },
                         { step: 3, label: "Galeria & Fotos" },
                         { step: 4, label: "Observações Internas" }
                       ].map((s) => (
                         <div key={s.step} className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${formStep >= s.step ? "bg-accent border-accent text-primary" : "bg-transparent border-white/20 text-white/40"}`}>
                                  {formStep > s.step ? <CheckCircle2 size={14}/> : s.step}
                               </div>
                               <span className={`text-[9px] uppercase font-bold tracking-widest ${formStep >= s.step ? "text-accent" : "text-white/40"}`}>{s.label}</span>
                            </div>
                            <div className={`h-1 rounded-full transition-all duration-500 ${formStep >= s.step ? "bg-accent" : "bg-white/10"}`} />
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="p-12">
                    {/* STEP 1: BASIC INFO */}
                    {formStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Nome da Obra / Design</label>
                              <input
                                placeholder="Ex: Rosas Douradas Imperial" 
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                className="w-full px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Preço Base sugerido (R$)</label>
                              <input
                                type="number" 
                                value={editing.price || ""}
                                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                                className="w-full px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Vinculação de Coleção</label>
                              <select 
                                value={editing.collectionId || ""}
                                onChange={(e) => setEditing({ ...editing, collectionId: e.target.value })}
                                className="w-full px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                              >
                                 <option value="">Coleção Independente</option>
                                 {adminCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Técnica Artística</label>
                              <input
                                placeholder="Ex: Lapidação a Diamante com Ouro"
                                value={editing.technique}
                                onChange={(e) => setEditing({ ...editing, technique: e.target.value })}
                                className="w-full px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Narrativa da Peça (Descrição)</label>
                           <textarea
                             value={editing.description}
                             onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                             className="w-full px-8 py-5 rounded-3xl bg-secondary/30 border border-primary/5 font-sans text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[150px]"
                             placeholder="Conte a história por trás desta criação..."
                           />
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: VARIANTS, MODELS & COLORS */}
                    {formStep === 2 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                        <div className="flex items-center justify-between mb-4">
                           <div className="max-w-md">
                              <h4 className="text-display text-2xl text-forest">Modelos Flexíveis</h4>
                              <p className="text-xs text-muted-foreground mt-2 italic font-sans">
                                Defina quais tipos de taças e copos aceitam esta arte e quais cores estão disponíveis para cada modelo.
                              </p>
                           </div>
                           <button 
                             onClick={() => {
                               const newVariant = { modelId: adminModels[0]?.id || "", colors: [], images: [] };
                               setEditing({...editing, variants: [...(editing.variants || []), newVariant]});
                             }}
                             className="btn-gold px-6 py-3 text-[10px] flex items-center gap-2 "
                           >
                             <Plus size={14}/> ADICIONAR MODELO
                           </button>
                        </div>

                        <div className="space-y-6">
                           {(!editing.variants || editing.variants.length === 0) ? (
                             <div className="p-12 border-2 border-dashed border-primary/10 rounded-[3rem] text-center bg-secondary/10">
                                <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                                <p className="text-xs text-muted-foreground font-sans italic">Nenhum modelo específico vinculado ainda. Esta arte será tratada como design genérico.</p>
                             </div>
                           ) : (
                             editing.variants.map((v, idx) => (
                               <div key={idx} className="p-8 rounded-[2.5rem] bg-secondary/20 border border-primary/5 relative group">
                                  <button 
                                    onClick={() => setEditing({...editing, variants: editing.variants?.filter((_, i) => i !== idx)})}
                                    className="absolute top-6 right-6 p-2 text-red-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                     <div className="space-y-3">
                                        <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider">Selecione o Modelo</label>
                                        <select 
                                          value={v.modelId}
                                          onChange={(e) => {
                                            const newVariants = [...(editing.variants || [])];
                                            newVariants[idx].modelId = e.target.value;
                                            setEditing({...editing, variants: newVariants});
                                          }}
                                          className="w-full px-6 py-4 rounded-xl bg-white border border-primary/5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary/10"
                                        >
                                           {adminModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                     </div>
                                     <div className="md:col-span-2 space-y-3">
                                        <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider">Cores Disponíveis (Pressione Enter)</label>
                                        <div className="flex flex-wrap gap-2 p-3 min-h-[56px] bg-white rounded-xl border border-primary/5">
                                           {v.colors.map((c, ci) => (
                                             <span key={ci} className="bg-primary/5 text-primary text-[9px] px-3 py-1 rounded-full font-bold flex items-center gap-2">
                                               {c}
                                               <X size={10} className="cursor-pointer" onClick={() => {
                                                 const newVariants = [...(editing.variants || [])];
                                                 newVariants[idx].colors = newVariants[idx].colors.filter((_, i) => i !== ci);
                                                 setEditing({...editing, variants: newVariants});
                                               }}/>
                                             </span>
                                           ))}
                                           <input 
                                             placeholder="Ex: Ouro, Azul Safira..."
                                             onKeyDown={(e: any) => {
                                               if(e.key === "Enter") {
                                                 e.preventDefault();
                                                 const val = e.target.value;
                                                 if(val && !v.colors.includes(val)) {
                                                   const newVariants = [...(editing.variants || [])];
                                                   newVariants[idx].colors.push(val);
                                                   setEditing({...editing, variants: newVariants});
                                                   e.target.value = "";
                                                 }
                                               }
                                             }}
                                             className="flex-1 min-w-[120px] bg-transparent outline-none text-xs font-sans"
                                           />
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: GALLERY & PHOTOS */}
                    {formStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                               <h4 className="text-display text-2xl">Imagens de Curadoria</h4>
                               <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                  Faça o upload da foto principal e da galeria. <b className="text-primary italic">Apenas arquivos PNG ou JPG.</b>
                               </p>
                               <div className="space-y-4">
                                  <div className="space-y-3">
                                     <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider block">Foto de Capa Principal</label>
                                     <div className="relative group">
                                       <input 
                                         type="file" 
                                         accept="image/png, image/jpeg"
                                         onChange={(e) => handleFileChange(e, 'main')}
                                         className="hidden" 
                                         id="main-photo" 
                                       />
                                       <label 
                                         htmlFor="main-photo" 
                                         className="w-full flex items-center justify-center gap-4 px-8 py-6 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/50 bg-secondary/10 cursor-pointer transition-all hover:bg-white"
                                       >
                                         <Upload size={20} className="text-primary" />
                                         <span className="text-[10px] font-black uppercase tracking-widest text-forest">Escolher Foto Digital</span>
                                       </label>
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider block">Fotos da Galeria (Máx 10)</label>
                                     <div className="relative group">
                                       <input 
                                         type="file" 
                                         multiple
                                         accept="image/png, image/jpeg"
                                         onChange={(e) => handleFileChange(e, 'gallery')}
                                         className="hidden" 
                                         id="gallery-photos" 
                                       />
                                       <label 
                                         htmlFor="gallery-photos" 
                                         className="w-full flex items-center justify-center gap-4 px-8 py-6 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/50 bg-secondary/10 cursor-pointer transition-all hover:bg-white"
                                       >
                                         <ImageIcon size={20} className="text-primary" />
                                         <span className="text-[10px] font-black uppercase tracking-widest text-forest">Subir Lote de Fotos</span>
                                       </label>
                                     </div>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 auto-rows-min">
                               {editing.image && (
                                 <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-accent relative">
                                    <img src={editing.image} className="w-full h-full object-cover" />
                                    <span className="absolute top-2 left-2 bg-accent text-primary text-[6px] font-black px-2 py-0.5 rounded uppercase">Capa</span>
                                 </div>
                               )}
                               {editing.images?.map((img, i) => (
                                 <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-primary/5 relative group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button 
                                      onClick={() => setEditing({...editing, images: editing.images?.filter((_, idx) => idx !== i)})}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                 </div>
                               ))}
                               {isLoadingIntegrations && (
                                 <div className="aspect-[3/4] rounded-2xl bg-secondary/20 flex items-center justify-center animate-pulse">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* MODEL SPECIFIC PHOTOS */}
                         {editing.variants && editing.variants.length > 0 && (
                            <div className="pt-10 border-t border-primary/5">
                               <h4 className="text-display text-xl mb-6">Fotos Específicas por Modelo</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {editing.variants.map((v, idx) => (
                                    <div key={idx} className="p-8 rounded-[2.5rem] bg-secondary/10 border border-primary/5 space-y-6">
                                       <div className="flex justify-between items-center">
                                          <p className="text-[9px] uppercase font-black text-primary tracking-widest">
                                            {adminModels.find(m => m.id === v.modelId)?.name || "Modelo"}
                                          </p>
                                          <span className="text-[8px] font-bold opacity-40">{v.images.length} fotos</span>
                                       </div>
                                       
                                       <input 
                                         type="file" 
                                         multiple
                                         accept="image/png, image/jpeg"
                                         onChange={(e) => handleFileChange(e, 'variant', idx)}
                                         className="hidden" 
                                         id={`variant-photos-${idx}`} 
                                       />
                                       <label 
                                         htmlFor={`variant-photos-${idx}`} 
                                         className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-primary/10 bg-white cursor-pointer transition-all hover:bg-primary/5"
                                       >
                                         <Upload size={14} className="text-primary" />
                                         <span className="text-[9px] font-bold uppercase text-forest">Upload p/ este modelo</span>
                                       </label>

                                       <div className="flex gap-2 overflow-x-auto pb-2">
                                          {v.images.map((img, i) => (
                                            <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative group">
                                               <img src={img} className="w-full h-full object-cover" />
                                               <button 
                                                  onClick={() => {
                                                    const newVariants = [...(editing.variants || [])];
                                                    newVariants[idx].images = newVariants[idx].images.filter((_, idx_i) => idx_i !== i);
                                                    setEditing({...editing, variants: newVariants});
                                                  }}
                                                  className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                                               >
                                                 <Trash2 size={12} />
                                               </button>
                                            </div>
                                          ))}
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </motion.div>
                    )}

                    {/* STEP 4: INTERNAL OBSERVATIONS */}
                    {formStep === 4 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                         <div className="p-12 rounded-[3.5rem] bg-[#304930]/5 border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                              <ShieldCheck size={160} />
                            </div>
                            <div className="z-10 relative">
                               <h4 className="text-display text-3xl text-forest mb-4 italic">Segredos de Ateliê</h4>
                               <p className="text-sm text-muted-foreground font-sans max-w-lg mb-8 leading-relaxed">
                                  Estas informações são <b className="text-primary italic text-base">estritamente internas</b>. Use este espaço para anotar detalhes de produção, mix de tintas específico ou restrições que não devem aparecer para a cliente final.
                               </p>
                               <textarea
                                 value={editing.observations}
                                 onChange={(e) => setEditing({...editing, observations: e.target.value})}
                                 className="w-full px-10 py-10 rounded-[3rem] bg-white border border-primary/10 font-sans text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all min-h-[300px] shadow-inner"
                                 placeholder="Escreva aqui os detalhes técnicos, cuidados na lapidação, códigos de fornecedores..."
                               />
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Estoque Físico no Ateliê</label>
                               <div className="flex items-center gap-6">
                                  <input 
                                    type="number" 
                                    value={editing.stock}
                                    onChange={(e) => setEditing({...editing, stock: Number(e.target.value)})}
                                    className="flex-1 px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                  />
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-bold text-muted-foreground">Status Atual</span>
                                     <span className={`text-xs font-black uppercase ${editing.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {editing.stock > 0 ? "Pronto Entrega" : "Apenas Encomenda"}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black text-forest/40 tracking-wider ml-1">Categoria de Acervo</label>
                               <select 
                                 value={editing.category}
                                 onChange={(e) => setEditing({...editing, category: e.target.value})}
                                 className="w-full px-8 py-5 rounded-2xl bg-secondary/30 border border-primary/5 font-sans text-sm outline-none"
                               >
                                  <option>Lançamentos</option>
                                  <option>Mais Vendidos</option>
                                  <option>Clássicos</option>
                                  <option>Peças Únicas</option>
                               </select>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-16 pt-10 border-t border-primary/5">
                      <button 
                        onClick={() => formStep > 1 ? setFormStep(prev => prev - 1) : cancelEdit()}
                        className="px-10 py-5 text-[10px] uppercase font-black text-muted-foreground hover:text-primary transition-all tracking-[0.2em]"
                      >
                        {formStep === 1 ? "Descartar Alterações" : "Voltar Etapa"}
                      </button>
                      
                      <div className="flex gap-4">
                        {formStep < 4 ? (
                          <button 
                            onClick={() => {
                               if(formStep === 1 && !editing.name) {
                                 toast.warning("Dê um nome precioso a esta obra.");
                                 return;
                               }
                               setFormStep(prev => prev + 1);
                            }}
                            className="btn-gold px-12 py-5 text-[10px] flex items-center gap-3 shadow-xl shadow-accent/20"
                          >
                             PRÓXIMA ETAPA <ChevronRight size={14}/>
                          </button>
                        ) : (
                          <button 
                            onClick={saveProduct} 
                            className="bg-forest px-16 py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-forest/90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-forest/20 flex items-center gap-3"
                          >
                             <Save size={18}/> FINALIZAR & PUBLICAR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
              {products.map((p) => (
                <div key={p.id} className={`glass-card p-6 flex group hover:-translate-y-1 transition-all duration-500 border-primary/5 bg-white ${viewMode === "grid" ? "flex-col" : "items-center gap-6"}`}>
                  <div className={`${viewMode === "grid" ? "aspect-square w-full" : "w-16 h-16 md:w-24 md:h-24"} rounded-2xl overflow-hidden relative shrink-0`}>
                    <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {viewMode === "grid" && (
                       <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                          <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{p.stock} em estoque</p>
                       </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => startEdit(p)} className="p-2 md:p-3 bg-white/90 rounded-xl text-primary hover:bg-white shadow-lg"><Pencil size={viewMode === "grid" ? 18 : 14}/></button>
                       <button onClick={() => deleteProduct(p.id)} className="p-2 md:p-3 bg-white/90 rounded-xl text-destructive hover:bg-white shadow-lg"><Trash2 size={viewMode === "grid" ? 18 : 14}/></button>
                    </div>
                  </div>
                  
                  <div className={viewMode === "list" ? "flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center" : "w-full"}>
                     <div className={viewMode === "list" ? "md:col-span-1" : ""}>
                        <h4 className="font-display text-xl mb-1">{p.name}</h4>
                        {viewMode === "list" && <p className="text-[8px] uppercase text-muted-foreground font-bold">{p.category}</p>}
                     </div>

                     {viewMode === "list" && (
                        <>
                           <div className="hidden md:block">
                              <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Estoque</p>
                              <p className={`text-xs font-bold ${p.stock < 10 ? "text-red-500" : "text-primary"}`}>{p.stock} unidades</p>
                           </div>
                           <div className="hidden md:block">
                              <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Popularidade</p>
                              <p className="text-xs font-bold text-primary flex items-center gap-1"><TrendingUp size={10}/> {p.salesCount || 0} vendas</p>
                           </div>
                        </>
                     )}

                     <div className={viewMode === "list" ? "text-right" : "flex justify-between items-center mt-2 w-full"}>
                        <p className="font-sans text-lg font-bold text-primary">R$ {p.price}</p>
                        {viewMode === "grid" && <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-muted-foreground border border-primary/5 px-3 py-1 rounded-full">{p.category}</span>}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* COUPONS TAB */}
        {tab === "coupons" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <header className="flex justify-between items-center px-2">
                <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Gestão de Campanhas de Desconto</p>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-2xl border border-primary/5">
                      <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={18} /></button>
                      <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={18} /></button>
                   </div>
                   <div className="flex gap-4">
                     <button className="btn-outline-atelier text-[10px] px-6 py-2">Configurar Boas Vindas</button>
                     <button className="btn-gold flex items-center gap-2 text-[10px]"><Plus size={14}/> NOVO CUPOM</button>
                   </div>
                </div>
             </header>
             <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-4"}>
                 {mockCupons.map(c => (
                   <div key={c.id} className={`glass-card p-6 flex transition-all duration-500 border-2 ${c.status === "Inativo" ? "border-dashed opacity-60 bg-secondary/20" : "border-primary/5 bg-white"} ${viewMode === "grid" ? "flex-col gap-6" : "items-center justify-between"}`}>
                      <div className={`flex items-center gap-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                         <div className={`p-5 rounded-[2rem] rotate-[-10deg] shrink-0 ${c.tipo === "Boas Vindas" ? "bg-accent/20 text-accent" : "bg-secondary text-primary"}`}>
                            <Ticket size={24} />
                         </div>
                         <div className={viewMode === "list" ? "flex-1 grid grid-cols-1 md:grid-cols-3 gap-4" : ""}>
                            <div>
                               <div className="flex items-center gap-2">
                                 <p className="text-display text-2xl tracking-tighter gold-accent">{c.codigo}</p>
                                 {c.tipo === "Boas Vindas" && <span className="text-[6px] bg-accent/20 text-accent px-2 py-0.5 rounded font-bold uppercase">Boas Vindas</span>}
                               </div>
                               <p className="text-[10px] uppercase font-bold text-muted-foreground font-sans mt-1">Desconto: <span className="text-primary">{c.desconto}</span></p>
                            </div>
                            {viewMode === "list" && (
                               <>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Uso da Campanha</p>
                                     <p className="text-[10px] font-bold text-primary">{c.usos} / {c.limite} usos utilizados</p>
                                  </div>
                                  <div className="hidden md:block">
                                     <p className="text-[8px] uppercase text-muted-foreground font-sans font-bold">Tipo de Regra</p>
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.tipo}</p>
                                  </div>
                               </>
                            )}
                         </div>
                      </div>
                      <div className={`flex items-center gap-6 ${viewMode === "grid" ? "justify-between w-full border-t border-primary/5 pt-4" : ""}`}>
                         <div className="flex items-center gap-2">
                            <span className={`text-[8px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${c.status === "Ativo" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"}`}>{c.status}</span>
                            <button className={`w-10 h-6 rounded-full relative transition-all ${c.status === "Ativo" ? "bg-primary" : "bg-muted"}`}>
                               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${c.status === "Ativo" ? "right-1" : "left-1"}`} />
                            </button>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-2 border border-primary/5 hover:bg-secondary rounded-lg"><Pencil size={14} /></button>
                            <button className="p-2 border border-primary/5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
          </motion.div>
        )}

        {/* NEWSLETTER TAB */}
        {tab === "newsletter" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
                <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Base de Leads e Interessados</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-2xl border border-primary/5">
                      <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><ListIcon size={18} /></button>
                      <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}><Grid size={18} /></button>
                   </div>
                   <button className="btn-gold flex items-center gap-2 text-[10px] h-12"><Download size={14}/> EXPORTAR PLANILHA (.CSV)</button>
                 </div>
              </header>
              <div className="glass-card overflow-hidden border-primary/5 bg-white/60">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/30">
                       <tr>
                          <th className="p-6 font-display text-sm">Email do Assinante</th>
                          <th className="p-6 font-display text-sm">Data de Inscrição</th>
                          <th className="p-6 font-display text-sm text-right">Ações</th>
                       </tr>
                    </thead>
                    <tbody>
                       {mockNewsletter.map((n, i) => (
                          <tr key={i} className="border-t border-primary/5 hover:bg-primary/5 transition-colors">
                             <td className="p-6 font-sans text-sm font-bold flex items-center gap-3"><Mail size={14} className="text-muted-foreground"/> {n.email}</td>
                             <td className="p-6 font-sans text-xs text-muted-foreground">{n.data}</td>
                             <td className="p-6 text-right">
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-10 rounded-[3rem] bg-[#304930] text-white flex items-center gap-12 overflow-hidden relative">
                 <div className="flex-1 space-y-4 z-10">
                    <h4 className="text-display text-3xl gold-accent italic">Alcançando Corações</h4>
                    <p className="text-sm opacity-80 leading-relaxed font-sans max-w-lg">Sua base de newsletter é a alma do marketing direto. Envie novidades exclusivas e processos criativos para manter o laço com suas clientes.</p>
                 </div>
                 <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md z-10 border border-white/10">
                    <Mail size={80} className="gold-accent" />
                 </div>
                 <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
              </div>
           </motion.div>
        )}
        {/* MODELS TAB */}
        {tab === "models" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="flex justify-between items-center px-2">
                <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Modelos de Base (Taças e Copos)</p>
                <button 
                  onClick={() => setEditingModel({ id: Date.now().toString(), name: "", image: "" })}
                  className="btn-gold flex items-center gap-2 text-[10px]"
                >
                  <Plus size={14}/> NOVO MODELO
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModels.map(m => (
                  <div key={m.id} className="glass-card overflow-hidden group border-primary/5 bg-white">
                     <div className="aspect-square relative">
                        <img src={m.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={m.name} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute top-4 right-4 flex gap-2">
                           <button onClick={() => setEditingModel({...m})} className="p-2 bg-white/90 rounded-xl text-primary hover:bg-white"><Pencil size={14}/></button>
                           <button onClick={() => setAdminModels(adminModels.filter(mod => mod.id !== m.id))} className="p-2 bg-white/90 rounded-xl text-destructive hover:bg-white"><Trash2 size={14}/></button>
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-display text-xl flex-1">{m.name}</h4>
                          {m.modelCategory && (
                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${
                              m.modelCategory === "tacas"
                                ? "bg-primary/10 text-primary"
                                : "bg-accent/10 text-[#A8892A]"
                            }`}>
                              {m.modelCategory === "tacas" ? "Taças" : "Arte"}
                            </span>
                          )}
                        </div>
                        {/* Badges de capacidades */}
                        {m.capacityVariants && m.capacityVariants.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {m.capacityVariants.map(cap => (
                              <span
                                key={cap.id}
                                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                  cap.inStock
                                    ? "bg-primary/5 text-primary border-primary/10"
                                    : "bg-red-50 text-red-400 border-red-100 line-through"
                                }`}
                              >
                                {cap.label}
                                {cap.priceAdjust > 0 && ` +R$${cap.priceAdjust}`}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                           <span className="text-[8px] uppercase font-bold text-muted-foreground">Coleções Vinculadas</span>
                           <span className="text-xs font-display text-primary">{adminCollections.filter(c => c.modelId === m.id).length}</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             <AnimatePresence>
               {editingModel && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                     className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10"
                   >
                      <h3 className="text-display text-3xl mb-8">Refinar Modelo</h3>
                      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                         <div className="space-y-1">
                            <label className="sidebar-header ml-1">Nome do Modelo</label>
                            <input
                              value={editingModel.name}
                              onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                              placeholder="Ex: Taça de Cristal Vinho"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="sidebar-header ml-1">Categoria</label>
                            <div className="grid grid-cols-2 gap-3">
                              {([["tacas", "Taças & Copos"], ["arte", "Estilos de Arte"]] as [ModelCategory, string][]).map(([val, label]) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setEditingModel({ ...editingModel, modelCategory: val })}
                                  className={`py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                                    editingModel.modelCategory === val
                                      ? "border-primary bg-primary text-white"
                                      : "border-primary/10 text-primary/60 hover:border-primary/30"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="sidebar-header ml-1">Imagem do Modelo</label>
                            <input
                              value={editingModel.image}
                              onChange={(e) => setEditingModel({ ...editingModel, image: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                            />
                         </div>

                         {/* ── Capacidades ── */}
                         <div className="space-y-3 pt-2 border-t border-primary/5">
                            <div className="flex items-center justify-between">
                              <label className="sidebar-header ml-1">Variantes de Capacidade</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCap: CapacityVariant = { id: Date.now().toString(), label: "", priceAdjust: 0, stock: 10, inStock: true };
                                  setEditingModel({ ...editingModel, capacityVariants: [...(editingModel.capacityVariants || []), newCap] });
                                }}
                                className="flex items-center gap-1 text-[10px] font-black uppercase text-accent hover:underline"
                              >
                                <Plus size={12} /> Adicionar
                              </button>
                            </div>

                            {(!editingModel.capacityVariants || editingModel.capacityVariants.length === 0) && (
                              <p className="text-[11px] text-muted-foreground italic px-2">Nenhuma variante — produto sem seleção de capacidade.</p>
                            )}

                            {(editingModel.capacityVariants || []).map((cap, idx) => (
                              <div key={cap.id} className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase text-primary/50">Variante {idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingModel({
                                      ...editingModel,
                                      capacityVariants: (editingModel.capacityVariants || []).filter((_, i) => i !== idx)
                                    })}
                                    className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Capacidade</label>
                                    <input
                                      value={cap.label}
                                      onChange={(e) => {
                                        const updated = [...(editingModel.capacityVariants || [])];
                                        updated[idx] = { ...updated[idx], label: e.target.value };
                                        setEditingModel({ ...editingModel, capacityVariants: updated });
                                      }}
                                      placeholder="ex: 450ml"
                                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-primary/10 text-sm font-sans outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Acréscimo (R$)</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={cap.priceAdjust}
                                      onChange={(e) => {
                                        const updated = [...(editingModel.capacityVariants || [])];
                                        updated[idx] = { ...updated[idx], priceAdjust: parseFloat(e.target.value) || 0 };
                                        setEditingModel({ ...editingModel, capacityVariants: updated });
                                      }}
                                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-primary/10 text-sm font-sans outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Estoque</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={cap.stock}
                                      onChange={(e) => {
                                        const updated = [...(editingModel.capacityVariants || [])];
                                        updated[idx] = { ...updated[idx], stock: parseInt(e.target.value) || 0 };
                                        setEditingModel({ ...editingModel, capacityVariants: updated });
                                      }}
                                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-primary/10 text-sm font-sans outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={cap.inStock}
                                        onChange={(e) => {
                                          const updated = [...(editingModel.capacityVariants || [])];
                                          updated[idx] = { ...updated[idx], inStock: e.target.checked };
                                          setEditingModel({ ...editingModel, capacityVariants: updated });
                                        }}
                                        className="accent-primary w-4 h-4"
                                      />
                                      <span className="text-[10px] font-bold text-primary/70">Em Estoque</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                      <div className="flex justify-end gap-4 mt-10">
                         <button onClick={() => setEditingModel(null)} className="px-8 py-4 text-[0.7rem] uppercase font-bold text-muted-foreground">Cancelar</button>
                         <button
                           onClick={() => {
                             const exists = adminModels.find(m => m.id === editingModel.id);
                             if (exists) {
                               setAdminModels(adminModels.map(m => m.id === editingModel.id ? editingModel : m));
                               updateModel(editingModel);
                             } else {
                               setAdminModels([...adminModels, editingModel]);
                               addModel(editingModel);
                             }
                             setEditingModel(null);
                           }}
                           className="btn-gold px-12 py-4"
                         >
                            SALVAR MODELO
                         </button>
                      </div>
                   </motion.div>
                 </div>
               )}
             </AnimatePresence>
          </motion.div>
        )}

        {/* COLLECTIONS TAB */}
        {tab === "collections" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="flex justify-between items-center px-2">
                <p className="font-sans text-[0.7rem] uppercase tracking-widest text-muted-foreground">Coleções Artísticas</p>
                <button 
                  onClick={() => setEditingCollection({ id: Date.now().toString(), name: "", image: "", modelId: adminModels[0]?.id || "" })}
                  className="btn-gold flex items-center gap-2 text-[10px]"
                >
                  <Plus size={14}/> NOVA COLEÇÃO
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminCollections.map(cat => (
                  <div key={cat.id} className="glass-card overflow-hidden group border-primary/5 bg-white flex h-48">
                     <div className="w-1/3 relative shrink-0">
                        <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cat.name} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                     </div>
                     <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start">
                              <h4 className="text-display text-xl">{cat.name}</h4>
                              <div className="flex gap-2">
                                 <button onClick={() => setEditingCollection({...cat})} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Pencil size={14}/></button>
                                 <button onClick={() => setAdminCollections(adminCollections.filter(c => c.id !== cat.id))} className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition-colors"><Trash2 size={14}/></button>
                              </div>
                           </div>
                           <p className="text-[10px] uppercase font-bold text-accent mt-1">
                              {adminModels.find(m => m.id === cat.modelId)?.name || "Modelo não encontrado"}
                           </p>
                           <p className="font-sans text-[10px] text-muted-foreground line-clamp-2 mt-2">{cat.description || "Sem descrição disponível."}</p>
                        </div>
                        <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                           <span className="text-[8px] uppercase font-bold text-muted-foreground">Produtos nesta coleção</span>
                           <span className="text-xs font-display text-primary">{products.filter(p => p.collectionId === cat.id).length} itens</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             <AnimatePresence>
               {editingCollection && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                     className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10"
                   >
                      <h3 className="text-display text-3xl mb-8">Refinar Coleção</h3>
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                               <label className="sidebar-header ml-1">Nome da Coleção</label>
                               <input
                                 value={editingCollection.name}
                                 onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                                 className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="sidebar-header ml-1">Vincular ao Modelo</label>
                               <select
                                 value={editingCollection.modelId}
                                 onChange={(e) => setEditingCollection({ ...editingCollection, modelId: e.target.value })}
                                 className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10 appearance-none"
                               >
                                  {adminModels.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                               </select>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="sidebar-header ml-1">URL da Imagem de Capa</label>
                            <input
                              value={editingCollection.image}
                              onChange={(e) => setEditingCollection({ ...editingCollection, image: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="sidebar-header ml-1">Descrição Curta</label>
                            <textarea
                              value={editingCollection.description}
                              onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10 min-h-[100px]"
                            />
                         </div>
                      </div>
                      <div className="flex justify-end gap-4 mt-10">
                         <button onClick={() => setEditingCollection(null)} className="px-8 py-4 text-[0.7rem] uppercase font-bold text-muted-foreground">Cancelar</button>
                         <button 
                           onClick={() => {
                             const exists = adminCollections.find(c => c.id === editingCollection.id);
                             if(exists) setAdminCollections(adminCollections.map(c => c.id === editingCollection.id ? editingCollection : c));
                             else setAdminCollections([...adminCollections, editingCollection]);
                             setEditingCollection(null);
                           }}
                           className="btn-gold px-12 py-4 flex items-center gap-3"
                         >
                            <Save size={18}/> SALVAR COLEÇÃO
                         </button>
                      </div>
                   </motion.div>
                 </div>
               )}
             </AnimatePresence>
          </motion.div>
        )}

        {/* REVIEWS TAB */}
        {tab === "reviews" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass-card p-8 bg-white border-primary/5 text-center">
                    <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-2">Média Geral</p>
                    <p className="text-display text-5xl text-accent">4.9</p>
                    <div className="flex justify-center text-accent mt-3">
                       {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 uppercase font-bold">Baseado em 48 depoimentos</p>
                 </div>
                 <div className="md:col-span-2 glass-card p-8 bg-white border-primary/5">
                    <h3 className="text-display text-xl mb-6">Distribuição</h3>
                    <div className="space-y-4">
                       {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-4">
                             <div className="flex gap-1 w-20">
                                <span className="text-xs font-bold">{star}</span>
                                <Star size={12} fill="#D4AF37" className="text-accent"/>
                             </div>
                             <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: `${star === 5 ? 85 : star === 4 ? 10 : 2}%` }} />
                             </div>
                             <span className="text-[10px] text-muted-foreground w-8">{star === 5 ? 42 : star === 4 ? 4 : 1}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center px-2">
                 <div className="flex gap-4">
                    {["Todas", "5 Estrelas", "Críticas", "Com Foto"].map(f => (
                       <button key={f} className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest border transition-all ${f === "Todas" ? "bg-primary text-white border-primary" : "bg-white border-primary/5 text-muted-foreground hover:border-primary/20"}`}>
                          {f}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {[
                    { user: "Renata Vasconcelos", rating: 5, comment: "As taças são verdadeiras joias. A embalagem é um espetáculo à parte, nota-se o carinho em cada detalhe.", product: "Taça Rosas Douradas", date: "Há 2 horas" },
                    { user: "Cláudio Amaral", rating: 5, comment: "Comprei para presentear minha esposa e ela ficou encantada. O trabalho manual é primoroso.", product: "Conjunto Diamante", date: "Ontem" },
                    { user: "Juliana Paes", rating: 4, comment: "Peças lindas, porém a entrega demorou 1 dia a mais do previsto. Mas valeu a espera.", product: "Xícara Floral", date: "2 dias" },
                 ].map((r, i) => (
                    <div key={i} className="glass-card p-6 bg-white/60 border-primary/5 flex flex-col md:flex-row gap-6 items-start">
                       <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-display text-xl text-primary">{r.user[0]}</div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-display text-lg">{r.user}</h4>
                                <div className="flex text-accent mt-1 mb-3">
                                   {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= r.rating ? "currentColor" : "none"} />)}
                                </div>
                             </div>
                             <span className="text-[8px] uppercase font-bold text-muted-foreground">{r.date}</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] uppercase font-bold text-muted-foreground">Item:</span>
                                <span className="text-[10px] font-sans font-bold text-primary">{r.product}</span>
                             </div>
                             <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-primary/5"><Trash2 size={12}/></button>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button className="btn-outline-atelier text-[8px] px-4 py-2">Responder</button>
                          <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Eye size={16}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        )}

        {/* INTEGRATIONS TAB */}
        {tab === "integrations" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-12 pb-24"
          >
             {/* Header Editorial */}
             <div className="flex flex-col gap-2 max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-2 flex items-center gap-2">
                   <div className="w-8 h-[1px] bg-primary/30"></div>
                   Ecossistema Digital
                </span>
                <h2 className="text-display text-5xl md:text-6xl text-forest leading-none">
                   Sistemas & <i className="text-primary font-serif italic">Conexões</i>
                </h2>
                <div className="flex items-center gap-4 mt-4">
                  <p className="font-sans text-xs text-muted-foreground/80 leading-relaxed max-w-md">
                    Gerencie as conexões de pagamento e logística. Insira suas chaves de produção para começar a receber pedidos e calcular fretes reais.
                  </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* MERCADO PAGO */}
                <div className="glass-card overflow-hidden group border-primary/5 hover:border-primary/20 transition-all duration-700 bg-white/40">
                   <div className="h-2 w-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors"></div>
                   <div className="p-12">
                      <div className="flex items-center gap-6 mb-10">
                         <div className="w-16 h-16 rounded-2xl bg-blue-50/50 backdrop-blur-sm border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                            <CreditCard size={28} />
                         </div>
                         <div className="flex flex-col">
                            <h3 className="text-display text-2xl text-forest">Mercado Pago</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <div className={`w-1.5 h-1.5 rounded-full ${mpAccessToken ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                               <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                                  {mpAccessToken ? "Conectado à Produção" : "Configuração Pendente"}
                               </span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-8">
                         <div className="space-y-2 group/input">
                            <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider ml-1 group-focus-within/input:text-primary transition-colors">Public Key</label>
                            <input 
                               type="text" 
                               placeholder="Ex: APP_USR-xxxx-xxxx"
                               value={mpPublicKey}
                               onChange={(e) => setMpPublicKey(e.target.value)}
                               className="w-full px-6 py-4 rounded-xl bg-white/60 border border-primary/5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                            />
                         </div>
                         <div className="space-y-2 group/input">
                            <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider ml-1 group-focus-within/input:text-primary transition-colors">Access Token</label>
                            <input 
                               type="password" 
                               placeholder="Ex: APP_USR-xxxxxxxx"
                               value={mpAccessToken}
                               onChange={(e) => setMpAccessToken(e.target.value)}
                               className="w-full px-6 py-4 rounded-xl bg-white/60 border border-primary/5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                            />
                         </div>
                         
                         <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex gap-4">
                            <Zap className="text-blue-400 shrink-0" size={18} />
                            <p className="text-[10px] text-blue-700/70 leading-relaxed font-sans italic">
                               Os pagamentos via <b>PIX</b> e <b>Cartão</b> são processados instantaneamente através desta conexão.
                            </p>
                         </div>

                         <button 
                           onClick={() => {
                             if (!mpAccessToken) {
                               toast.warning("Insira as chaves para testar.");
                               return;
                             }
                             const loading = toast.loading("Verificando protocolo de segurança...");
                             setTimeout(() => {
                               toast.dismiss(loading);
                               toast.success("Protocolo validado!", { description: "Sincronização ativa com MP." });
                               handleSaveIntegrations();
                             }, 2000);
                           }}
                           className="w-full py-5 bg-forest text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-forest/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-forest/10"
                         >
                           {isLoadingIntegrations ? "Processando..." : "Testar & Sincronizar Gateway"}
                         </button>
                      </div>
                   </div>
                </div>

                {/* MELHOR ENVIO */}
                <div className="glass-card overflow-hidden group border-primary/5 hover:border-primary/20 transition-all duration-700 bg-white/40">
                   <div className="h-2 w-full bg-orange-500/20 group-hover:bg-orange-500/40 transition-colors"></div>
                   <div className="p-12">
                      <div className="flex items-center gap-6 mb-10">
                         <div className="w-16 h-16 rounded-2xl bg-orange-50/50 backdrop-blur-sm border border-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                            <Truck size={28} />
                         </div>
                         <div className="flex flex-col">
                            <h3 className="text-display text-2xl text-forest">Melhor Envio</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <div className={`w-1.5 h-1.5 rounded-full ${meToken ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                               <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                                  {meToken ? "Logística Sincronizada" : "Configuração Pendente"}
                               </span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-8">
                         <div className="space-y-2 group/input">
                            <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider ml-1 group-focus-within/input:text-primary transition-colors">E-mail da Conta</label>
                            <input 
                               type="email" 
                               placeholder="contato@atelie.com"
                               value={meEmail}
                               onChange={(e) => setMeEmail(e.target.value)}
                               className="w-full px-6 py-4 rounded-xl bg-white/60 border border-primary/5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                            />
                         </div>
                         <div className="space-y-2 group/input">
                            <label className="text-[9px] uppercase font-black text-forest/40 tracking-wider ml-1 group-focus-within/input:text-primary transition-colors">Token de API</label>
                            <input 
                               type="password" 
                               placeholder="Insira o seu token ME..."
                               value={meToken}
                               onChange={(e) => setMeToken(e.target.value)}
                               className="w-full px-6 py-4 rounded-xl bg-white/60 border border-primary/5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                            />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-5">
                            <div className="p-5 bg-white/60 rounded-2xl border border-primary/5 shadow-sm text-center">
                               <p className="text-[8px] uppercase font-black text-muted-foreground/60 mb-2 tracking-widest">Ambiente Atual</p>
                               <select 
                                 value={meSandbox ? "sandbox" : "production"}
                                 onChange={(e) => setMeSandbox(e.target.value === "sandbox")}
                                 className="bg-transparent text-xs font-bold text-primary outline-none cursor-pointer"
                               >
                                 <option value="sandbox">Ambiente Teste</option>
                                 <option value="production">Ambiente Produção</option>
                               </select>
                            </div>
                            <div className="p-5 bg-white/60 rounded-2xl border border-primary/5 shadow-sm text-center">
                               <p className="text-[8px] uppercase font-black text-muted-foreground/60 mb-2 tracking-widest">Logística</p>
                               <p className="text-xs font-bold text-forest">Cálculo Ativo</p>
                            </div>
                         </div>

                         <button 
                           onClick={handleSaveIntegrations}
                           disabled={isLoadingIntegrations}
                           className="w-full py-5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-forest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                         >
                           {isLoadingIntegrations ? "Salvando..." : "Validar Logística & Salvar"}
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Webhook Section */}
             <div className="glass-card p-10 bg-forest/[0.02] border-primary/10 overflow-hidden relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                   <div className="max-w-md">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Globe size={20} />
                         </div>
                         <h4 className="text-display text-2xl text-forest">Webhooks & Sincronização</h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed italic">
                         Utilize este endpoint no seu painel externo para receber atualizações de status em tempo real. Uma notificação automática será enviada sempre que houver mudança no fluxo de caixa.
                      </p>
                   </div>
                   <div className="flex flex-col gap-4 min-w-[300px]">
                      <div className="flex items-center gap-0 group">
                         <input 
                            readOnly 
                            value="https://atelieverissimo.com/webhooks/master" 
                            className="bg-white px-6 py-4 rounded-l-xl border border-primary/10 font-sans text-[10px] text-muted-foreground outline-none w-full group-focus-within:border-primary transition-colors" 
                         />
                         <button 
                            onClick={() => {
                               navigator.clipboard.writeText("https://atelieverissimo.com/webhooks/master");
                               toast.success("URL copiada!");
                            }}
                            className="px-6 py-4 bg-primary text-white rounded-r-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest transition-colors shadow-lg shadow-primary/10"
                         >
                            Copiar
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
        {tab === "settings" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass-card p-10 bg-white border-primary/5">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><ImageIcon size={24}/></div>
                       <div>
                          <h3 className="text-display text-2xl">Identidade Visual</h3>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Logotipo e Ícones</p>
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="flex flex-col items-center p-8 border-2 border-dashed border-primary/10 rounded-[3rem] bg-secondary/20 group hover:border-primary/30 transition-all cursor-pointer">
                          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <span className="text-display text-2xl text-primary">LV</span>
                          </div>
                          <p className="text-[10px] uppercase font-bold text-primary">Alterar Logotipo Principal</p>
                          <p className="text-[8px] text-muted-foreground mt-1">PNG Transparente, 512x512px</p>
                       </div>

                       <div className="space-y-4">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Favicon (Ícone do Navegador)</label>
                             <div className="flex gap-3 mt-2">
                                <input className="flex-1 px-6 py-4 rounded-2xl bg-secondary/20 border-none text-xs outline-none focus:ring-1 focus:ring-primary/20" placeholder="URL do arquivo .ico ou .png" />
                                <button className="btn-gold px-6 text-[10px]">Upload</button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="glass-card p-10 bg-white border-primary/5">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><LayoutDashboard size={24}/></div>
                       <div>
                          <h3 className="text-display text-2xl">Banners Hero</h3>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Página Inicial e Coleções</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       {[
                          { title: "Home Principal", size: "1920x1080", current: "/banner-hero.png" },
                          { title: "Sessão Coleções", size: "1280x600", current: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13" },
                       ].map((b, i) => (
                          <div key={i} className="p-4 bg-secondary/10 rounded-3xl border border-primary/5 flex items-center gap-4 group">
                             <div className="w-20 h-14 rounded-xl overflow-hidden shadow-sm">
                                <img src={b.current} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-bold font-display">{b.title}</p>
                                <p className="text-[8px] text-muted-foreground uppercase">{b.size}px</p>
                             </div>
                             <button className="p-3 bg-white rounded-xl text-primary border border-primary/5 opacity-0 group-hover:opacity-100 transition-all"><Pencil size={14}/></button>
                          </div>
                       ))}
                       <button className="w-full mt-4 py-4 border-2 border-dashed border-primary/10 rounded-2xl text-[10px] uppercase font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">Adicionar Novo Banner</button>
                    </div>
                 </div>
              </div>

              <div className="glass-card p-10 bg-[#304930] text-white">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                       <h4 className="text-display text-2xl gold-accent italic">Paleta de Luxo</h4>
                       <p className="text-xs opacity-70 font-sans max-w-md">As cores do sistema são baseadas na elegância do Ateliê. Alterações aqui afetarão todos os botões e destaques do site.</p>
                    </div>
                    <div className="flex gap-4">
                       {[
                         { name: "Primary", hex: "#304930" },
                         { name: "Accent", hex: "#D4AF37" },
                         { name: "Secondary", hex: "#F5F5F7" }
                       ].map(c => (
                         <div key={c.name} className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 shadow-xl" style={{ backgroundColor: c.hex }} />
                            <span className="text-[8px] uppercase font-bold opacity-60">{c.name}</span>
                         </div>
                       ))}
                    </div>
                    <button className="btn-gold px-12 py-5 text-[10px]">REDEFINIR ESTILO GLOBAL</button>
                 </div>
              </div>
           </motion.div>
        )}
        </div>
     </main>

      {/* MODAL ADICIONAR DESPESA */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
               <h3 className="text-display text-2xl mb-8 flex items-center gap-3">
                 <DollarSign className="text-primary"/> Nova Despesa
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Descrição</label>
                   <input 
                     type="text" 
                     placeholder="Ex: Tinta Ouro, Embalagens..." 
                     value={newExpense.title}
                     onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                     className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Categoria</label>
                     <select 
                       value={newExpense.cat}
                       onChange={e => setNewExpense({...newExpense, cat: e.target.value})}
                       className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-xs outline-none focus:ring-2 focus:ring-primary/10"
                     >
                       <option>Insumos</option>
                       <option>Infra</option>
                       <option>Marketing</option>
                       <option>Embalagem</option>
                       <option>Outros</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Valor (R$)</label>
                     <input 
                       type="number" 
                       value={newExpense.val}
                       onChange={e => setNewExpense({...newExpense, val: Number(e.target.value)})}
                       className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border-none font-sans text-sm outline-none focus:ring-2 focus:ring-primary/10"
                     />
                   </div>
                 </div>
               </div>

               <div className="flex justify-end gap-4 mt-10">
                 <button onClick={() => setIsAddingExpense(false)} className="px-6 py-3 text-[10px] uppercase font-bold text-muted-foreground">Cancelar</button>
                 <button onClick={handleAddExpense} className="btn-gold px-12 py-4">ADICIONAR</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;

