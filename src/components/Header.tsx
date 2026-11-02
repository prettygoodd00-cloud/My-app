import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenCabinet: () => void;
  onOpenAdmin: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenCabinet,
  onOpenAdmin,
  onOpenWishlist,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { user, isAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen, wishlist } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    'Все',
    'Верхняя одежда',
    'Платья и костюмы',
    'Трикотаж и кашемир',
    'Кожаные сумки',
    'Аксессуары',
  ];

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setIsMobileMenuOpen(false);
    const catalogElem = document.getElementById('catalog-section');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E8E6E1] transition-all">
      {/* Announcement Bar */}
      <div className="bg-[#1C1C1A] text-[#FAF9F6] text-[11px] tracking-[0.2em] uppercase py-2 px-4 text-center font-medium">
        <span className="opacity-90">Бесплатная курьерская доставка с примеркой при заказе от 150 000 ₸</span>
        <span className="hidden md:inline mx-3 opacity-40">|</span>
        <span className="hidden md:inline opacity-70">Новая коллекция Winter 26/27 уже в бутиках</span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1C1C1A] hover:opacity-70 transition-opacity"
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Left: Desktop Nav links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium uppercase tracking-[0.16em] text-[#2C2C2A]">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`py-1 transition-colors relative hover:text-black ${
                  selectedCategory === cat
                    ? 'text-black font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black'
                    : 'text-[#66645F]'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => handleCategoryClick('Кожаные сумки')}
              className={`py-1 transition-colors relative hover:text-black ${
                selectedCategory === 'Кожаные сумки'
                  ? 'text-black font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black'
                  : 'text-[#66645F]'
              }`}
            >
              Сумки
            </button>
          </nav>

          {/* Center: Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('Все');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block group"
            >
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-medium text-[#111111] uppercase block transition-transform group-hover:scale-[1.01]">
                VELORA
              </span>
              <span className="block text-[8px] tracking-[0.38em] uppercase text-[#737069] -mt-1 font-sans">
                Haute Couture &amp; RTW
              </span>
            </a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#1C1C1A] hover:text-[#7A6B53] transition-colors relative"
              title="Поиск товаров"
              aria-label="Поиск"
            >
              <Search size={20} strokeWidth={1.75} />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-[#1C1C1A] hover:text-[#7A6B53] transition-colors relative"
              title="Избранное"
              aria-label="Избранное"
            >
              <Heart size={20} strokeWidth={1.75} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8C2D19] rounded-full" />
              )}
            </button>

            {/* User Profile / Admin or Auth */}
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1A] text-[#FAF9F6] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors rounded-sm"
                    title="Панель администратора"
                  >
                    <Shield size={13} className="text-[#D4AF37]" />
                    <span className="hidden sm:inline">Админ-панель</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenCabinet}
                    className="flex items-center gap-1.5 p-2 text-[#1C1C1A] hover:text-[#7A6B53] transition-colors"
                    title="Личный кабинет"
                  >
                    <UserIcon size={20} strokeWidth={1.75} />
                    <span className="hidden md:inline text-xs font-medium tracking-wide">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 p-2 text-[#1C1C1A] hover:text-[#7A6B53] transition-colors text-xs font-medium tracking-wider uppercase"
                title="Войти в аккаунт"
              >
                <UserIcon size={20} strokeWidth={1.75} />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 p-2 text-[#1C1C1A] hover:text-[#7A6B53] transition-colors relative"
              aria-label="Корзина"
            >
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={1.75} />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#1C1C1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs uppercase tracking-widest font-medium">
                Корзина
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="py-3 px-2 border-t border-[#E8E6E1] animate-fadeIn">
            <div className="relative max-w-xl mx-auto flex items-center">
              <Search size={18} className="absolute left-3 text-[#8A8780]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по пальто, платьям, шелку, кашемиру..."
                autoFocus
                className="w-full bg-white border border-[#DDD9D2] pl-10 pr-24 py-2.5 text-sm text-[#1C1C1A] placeholder-[#9C988F] focus:outline-none focus:border-[#1C1C1A] transition-colors rounded-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 text-xs text-[#8A8780] hover:text-black uppercase tracking-wider"
                >
                  Очистить
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1 text-[#8A8780] hover:text-black"
                title="Закрыть"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[112px] bottom-0 bg-[#FAF9F6] border-t border-[#E8E6E1] p-6 z-50 overflow-y-auto animate-fadeIn">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C887E] mb-3 font-semibold">
                Категории
              </p>
              <div className="flex flex-col space-y-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`text-left text-lg font-serif tracking-wide py-1.5 transition-colors flex items-center justify-between ${
                      selectedCategory === cat ? 'text-black font-semibold' : 'text-[#55534E]'
                    }`}
                  >
                    <span>{cat}</span>
                    <ArrowRight size={16} className="opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E6E1] space-y-4">
              {user ? (
                <>
                  <p className="text-xs text-[#706D66]">
                    Вы вошли как <strong className="text-black">{user.name}</strong>
                  </p>
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full py-3 bg-[#1C1C1A] text-[#FAF9F6] text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 rounded-sm"
                    >
                      <Shield size={14} className="text-[#D4AF37]" />
                      Открыть Админ-панель
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenCabinet();
                      }}
                      className="w-full py-3 border border-[#1C1C1A] text-[#1C1C1A] text-xs uppercase tracking-widest font-medium"
                    >
                      Личный кабинет
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3 bg-[#1C1C1A] text-[#FAF9F6] text-xs uppercase tracking-widest font-medium"
                >
                  Войти / Регистрация
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
