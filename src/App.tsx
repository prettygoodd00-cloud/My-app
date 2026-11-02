import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserCabinetModal } from './components/UserCabinetModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Product, Order } from './types';
import { SlidersHorizontal, Sparkles, RefreshCw, X, ArrowUpDown } from 'lucide-react';

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modal open states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const categories = [
    'Все',
    'Верхняя одежда',
    'Платья и костюмы',
    'Трикотаж и кашемир',
    'Кожаные сумки',
    'Аксессуары',
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'Все') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Не удалось загрузить товары');
      const data = await res.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки каталога');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleOrderSuccess = (order: Order) => {
    // Optionally open cabinet or let checkout modal display confirmation
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1A] flex flex-col font-sans selection:bg-[#1C1C1A] selection:text-white">
      {/* Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCabinet={() => setIsCabinetOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenWishlist={() => setIsCabinetOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Section */}
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#E8E6E0] gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#807C73] font-medium mb-1">
                Сезонный каталог
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal">
                {selectedCategory === 'Все' ? 'Полная коллекция' : selectedCategory}
              </h2>
            </div>

            {/* Sort & Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Pills */}
              <div className="hidden lg:flex items-center gap-1.5 p-1 bg-[#F0EDE6] rounded-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#1C1C1A] text-white shadow-xs'
                        : 'text-[#615E58] hover:text-black hover:bg-white/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#DDD9D2] pl-3 pr-8 py-2 text-xs uppercase tracking-wider text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs cursor-pointer"
                >
                  <option value="featured">Рекомендуемые</option>
                  <option value="newest">Сначала новинки</option>
                  <option value="price_asc">Цена: по возрастанию</option>
                  <option value="price_desc">Цена: по убыванию</option>
                </select>
                <ArrowUpDown size={13} className="absolute right-2.5 text-[#736F66] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Search & Filter Indicator */}
          {(searchQuery || selectedCategory !== 'Все') && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#706C64]">
              <span>Фильтры:</span>
              {selectedCategory !== 'Все' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D9D6CE] rounded-xs text-[#1C1C1A]">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Все')} className="hover:text-black">
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D9D6CE] rounded-xs text-[#1C1C1A]">
                  Поиск: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-black">
                    <X size={12} />
                  </button>
                </span>
              )}
              <span className="text-[#8C887E]">
                (найдено: {products.length})
              </span>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw size={24} className="animate-spin text-[#807C73] mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#807C73]">
                Загрузка коллекции VELORA...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-xs text-[#8C2D19]">
              <p>{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 border border-[#8C2D19] uppercase tracking-wider rounded-xs"
              >
                Повторить попытку
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-white border border-[#EAE6DC] rounded-xs p-8 max-w-lg mx-auto">
              <h3 className="font-serif text-2xl text-[#111111] mb-2">Ничего не найдено</h3>
              <p className="text-xs text-[#736F66] mb-6 font-light">
                По вашему запросу не найдено изделий. Попробуйте изменить параметры поиска или сбросить фильтры.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Все');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Editorial Story / Brand Craft Section */}
        <section className="bg-[#1C1C1A] text-[#FAF9F6] py-20 lg:py-28 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] mb-6">
                  <Sparkles size={12} />
                  <span>Ателье и Мастерство</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] mb-6">
                  Искусство безупречного кроя
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-[#CBC7BE] font-light leading-relaxed">
                  <p>
                    В основе философии VELORA лежит отказ от быстрой моды в пользу вечных силуэтов.
                    Каждое пальто создается более 36 часов с использованием до 70 ручных операций: от формования бортовой прокладки конским волосом до шелковых петель ручной обметки.
                  </p>
                  <p>
                    Мы сотрудничаем исключительно с историческими фабриками Северной Италии и пастбищами Внутренней Монголии, гарантируя происхождение и экологическую чистоту каждого метра кашемира и шелка.
                  </p>
                </div>
                <div className="pt-8 flex flex-wrap gap-8 border-t border-white/15 mt-8 text-left">
                  <div>
                    <span className="font-serif text-3xl font-medium text-white block">100%</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#A09D94]">Натуральные волокна</span>
                  </div>
                  <div>
                    <span className="font-serif text-3xl font-medium text-white block">36 ч</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#A09D94]">Ручной работы на пальто</span>
                  </div>
                  <div>
                    <span className="font-serif text-3xl font-medium text-white block">2 бутика</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#A09D94]">Москва &amp; Петербург</span>
                  </div>
                </div>
              </div>

              {/* Visual Lookbook collage */}
              <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85"
                  alt="VELORA Atelier"
                  className="w-full h-full object-cover object-top rounded-xs shadow-2xl opacity-90"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#FAF9F6] text-[#111111] p-6 max-w-xs shadow-xl hidden sm:block border border-[#E3DFD5]">
                  <p className="font-serif text-lg leading-snug mb-1">
                    «Форма следует за тканью, а не за мимолетной модой»
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-[#736F66]">
                    Креативный директор VELORA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCheckoutDirect={() => setIsCheckoutOpen(true)}
      />

      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
      />

      <UserCabinetModal
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        products={products}
        onOpenProductDetail={(p) => setSelectedProduct(p)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
