import React from 'react';
import { ArrowDown, Sparkles, Feather, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onSelectCategory }) => {
  const highlights = [
    {
      title: 'Верхняя одежда',
      subtitle: 'Монгольский кашемир и тонкорунная шерсть',
      category: 'Верхняя одежда',
      image: '/images/camel_cashmere_coat.jpg',
    },
    {
      title: 'Платья & Костюмы',
      subtitle: 'Шелк Mulberry и вечерний крой',
      category: 'Платья и костюмы',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
    },
    {
      title: 'Кожа & Аксессуары',
      subtitle: 'Итальянская кожа ручной выделки',
      category: 'Кожаные сумки',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
    },
  ];

  return (
    <section className="relative">
      {/* Main Full-Bleed Editorial Banner */}
      <div className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#161614] text-[#FAF9F6]">
        {/* Background photo with subtle luxury gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="VELORA New Collection 2026"
            className="w-full h-full object-cover object-top opacity-55 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] tracking-[0.25em] uppercase text-[#E8DCC4] mb-6">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>La Collection Hiver 2026/27</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white mb-6 leading-[1.1]">
            Тихая роскошь. <br />
            <span className="italic font-light opacity-90">Безупречная форма.</span>
          </h1>

          <p className="max-w-xl text-sm sm:text-base text-[#D4D1C9] font-light leading-relaxed mb-10 tracking-wide">
            Монобрендовый дом VELORA представляет капсулу пальто из отборного кашемира,
            струящегося шелка и архитектурного трикотажа, созданных вне сезонных трендов.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#FAF9F6] text-[#111111] text-xs uppercase tracking-[0.2em] font-medium hover:bg-white hover:shadow-lg transition-all rounded-sm flex items-center justify-center gap-2"
            >
              <span>Смотреть каталог</span>
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => onSelectCategory('Верхняя одежда')}
              className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/10 transition-colors rounded-sm"
            >
              Кашемировые пальто
            </button>
          </div>
        </div>

        {/* Bottom subtle badge indicator */}
        <div className="absolute bottom-6 left-0 right-0 z-10 hidden md:flex justify-center text-[10px] tracking-[0.3em] uppercase text-[#A09D94]">
          <span>Париж · Милан · Москва</span>
        </div>
      </div>

      {/* Brand Values / Philosophy Kicker */}
      <div className="bg-[#F4F2EC] border-b border-[#E3DFD5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC] flex items-center justify-center text-[#1C1C1A] shrink-0">
                <Feather size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1C1C1A]">
                  Селекционные материалы
                </h4>
                <p className="text-xs text-[#6E6A62] mt-0.5">
                  100% монгольский кашемир и органический шелк Mulberry
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC] flex items-center justify-center text-[#1C1C1A] shrink-0">
                <ShieldCheck size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1C1C1A]">
                  Примерка перед покупкой
                </h4>
                <p className="text-xs text-[#6E6A62] mt-0.5">
                  Курьер привезет смежные размеры для идеальной посадки
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-2">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC] flex items-center justify-center text-[#1C1C1A] shrink-0">
                <Sparkles size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1C1C1A]">
                  Кутюрная упаковка
                </h4>
                <p className="text-xs text-[#6E6A62] mt-0.5">
                  Фирменный кофр, шелковая лента и памятка по уходу
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Editorial Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#807C73] font-medium mb-2">
            Ключевые направления
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal">
            Гардероб со смыслом
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item) => (
            <div
              key={item.title}
              onClick={() => onSelectCategory(item.category)}
              className="group cursor-pointer relative overflow-hidden bg-[#EAE8E1] aspect-[3/4] flex flex-col justify-end p-8 text-white rounded-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity group-hover:opacity-90" />
              
              <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D8D2C5] mb-1 font-medium">
                  {item.subtitle}
                </p>
                <h3 className="font-serif text-2xl text-white font-medium mb-3">
                  {item.title}
                </h3>
                <span className="inline-flex items-center text-xs tracking-[0.16em] uppercase font-medium text-white border-b border-white pb-0.5 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors">
                  Перейти в раздел
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
