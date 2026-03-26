import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#304930] text-white pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-12 w-auto brightness-0 invert" />
              <div className="flex flex-col">
                <span className="text-display text-2xl">Ateliê Laura Veríssimo</span>
                <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/60">Arte em Vidro e Cristal</span>
              </div>
            </Link>
            <p className="font-sans text-sm text-white/50 leading-relaxed max-w-xs italic">
              "Transformando cristais em obras de arte através de pinceladas exclusivas e técnicas ancestrais de pintura manual."
            </p>
            <div className="flex gap-4 pt-4">
              <a href="https://instagram.com/atelielauraverissimo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-gradient hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-gradient hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-gradient hover:text-white transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] uppercase tracking-[0.4em] font-black text-gold-gradient">Navegação</h4>
            <ul className="space-y-4">
              {['Início', 'Galeria', 'Crie sua Taça', 'Sobre o Ateliê', 'Coleções'].map((item) => (
                <li key={item}>
                  <Link to="/" className="font-sans text-xs text-white/60 hover:text-gold-gradient transition-colors flex items-center gap-2 group">
                    <ArrowRight size={10} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] uppercase tracking-[0.4em] font-black text-gold-gradient">Contato</h4>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Instagram size={14} className="text-gold-gradient" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Instagram</p>
                  <a href="https://instagram.com/atelielauraverissimo" target="_blank" rel="noopener noreferrer" className="font-display text-sm hover:text-gold-gradient transition-colors">@atelielauraverissimo</a>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-gold-gradient" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Localização</p>
                  <p className="font-display text-sm">Feira de Santana, BA</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter/Action */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] uppercase tracking-[0.4em] font-black text-gold-gradient">Exclusividade</h4>
            <p className="font-sans text-xs text-white/50 leading-relaxed">
              Receba avisos antecipados sobre novos lançamentos e coleções limitadas do Ateliê.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-sans focus:outline-none focus:border-gold-gradient transition-all"
              />
              <button 
                className="absolute right-2 top-2 bottom-2 px-4 text-white rounded-xl hover:opacity-80 transition-all font-black text-[9px] uppercase tracking-widest"
                style={{ backgroundColor: "#E1AD01" }}
              >
                Assinar
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            © 2026 Ateliê Laura Veríssimo • Todos os direitos reservados
          </p>
          <div className="flex gap-8">
            <Link to="/" className="text-[8px] uppercase tracking-widest text-white/20 hover:text-white transition-all">Políticas de Privacidade</Link>
            <Link to="/" className="text-[8px] uppercase tracking-widest text-white/20 hover:text-white transition-all">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
