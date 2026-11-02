import React, { useState } from 'react';
import { Shield, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#141412] text-[#FAF9F6] border-t border-[#262624] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#262624]">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-3xl tracking-[0.25em] font-medium text-white uppercase block">
              VELORA
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#A6A298] block -mt-2">
              HAUTE COUTURE &amp; READY-TO-WEAR
            </span>
            <p className="text-xs text-[#A8A59E] font-light leading-relaxed max-w-sm pt-2">
              Монобрендовый дом VELORA исследует диалог между скульптурным кроем и первозданной текстурой
              натурального кашемира, шерсти и шелка. Каждое изделие выпускается ограниченным тиражом в семейных мастерских.
            </p>
            <div className="pt-2 text-xs text-[#8A867E] space-y-1">
              <p>Москва, Столешников переулок, 14 · ежедневно 10:00 – 22:00</p>
              <p>Санкт-Петербург, Невский проспект, 48 · ежедневно 11:00 – 21:00</p>
              <p className="pt-1">Консьерж-служба: +7 (495) 120-80-00</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
              Коллекции
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A59E]">
              <li>
                <button
                  onClick={() => onSelectCategory('Верхняя одежда')}
                  className="hover:text-white transition-colors"
                >
                  Кашемировые пальто
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Платья и костюмы')}
                  className="hover:text-white transition-colors"
                >
                  Шелковые платья &amp; жакеты
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Трикотаж и кашемир')}
                  className="hover:text-white transition-colors"
                >
                  Беби-кашемир
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Кожаные сумки')}
                  className="hover:text-white transition-colors"
                >
                  Кожаные тоуты и багеты
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Аксессуары')}
                  className="hover:text-white transition-colors"
                >
                  Шелковые платки и ремни
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
              Сервис &amp; Гарантии
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A59E]">
              <li className="hover:text-white transition-colors cursor-pointer">
                Примерка перед покупкой
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Индивидуальная подгонка в ателье
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Кутюрная подарочная упаковка
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Уход и спа для кашемира
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Политика конфиденциальности
              </li>
            </ul>
          </div>

          {/* Newsletter / Club */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
              Клуб VELORA
            </h4>
            <p className="text-xs text-[#A8A59E] font-light leading-relaxed">
              Получайте приглашения на закрытые превью сезонных дропов и кутюрных показов.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ваш e-mail"
                  className="w-full bg-[#1E1E1B] border border-[#33332E] px-3.5 py-2.5 text-xs text-white placeholder-[#736F66] focus:outline-none focus:border-[#D4AF37] rounded-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#FAF9F6] text-[#111111] hover:bg-white text-xs rounded-xs transition-colors flex items-center justify-center"
                  aria-label="Подписаться"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
              {subscribed && (
                <div className="text-[11px] text-[#A3E635] flex items-center gap-1.5 pt-1">
                  <Check size={13} />
                  <span>Благодарим за интерес к бренду</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Discreet Admin Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A766F] gap-4">
          <p>© {new Date().getFullYear()} VELORA Haute Couture House. Все права защищены.</p>

          <div className="flex items-center gap-6">
            <span>Сделано с безупречным вниманием к деталям</span>
            {/* Discreet Admin Entrance Link */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[#A6A298] hover:text-[#D4AF37] transition-colors border-b border-transparent hover:border-[#D4AF37] pb-0.5"
              title="Служебная панель"
            >
              <Shield size={12} className="opacity-80" />
              <span>Служебный вход</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
