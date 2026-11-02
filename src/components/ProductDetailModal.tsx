import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, ChevronDown, ChevronUp, Ruler, Shield, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCheckoutDirect?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCheckoutDirect,
}) => {
  if (!product) return null;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'One Size');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Классический');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string>('composition');

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    if (onOpenCheckoutDirect) {
      onOpenCheckoutDirect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-sm shadow-2xl border border-[#E3DFD5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-black hover:text-white rounded-full transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery */}
          <div className="p-4 sm:p-6 bg-[#FAF9F6] border-b md:border-b-0 md:border-r border-[#EFECE6] flex flex-col">
            <div className="relative aspect-[3/4] bg-[#F2F0EB] overflow-hidden rounded-xs mb-3">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-top"
              />
              {product.isNew && (
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-semibold bg-[#1C1C1A] text-white px-2 py-0.5">
                  Новинка
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 shrink-0 border-2 rounded-xs overflow-hidden transition-all ${
                      activeImageIndex === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center justify-between text-xs text-[#807C73] uppercase tracking-[0.18em] mb-2">
                <span>{product.category}</span>
                <span className="text-[#A39F96]">Арт. {product.id}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl text-[#111111] font-medium leading-tight mb-3">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-medium text-[#111111]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-[#99968F] line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#54524D] leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#736F66] uppercase tracking-wider font-medium">Цвет:</span>
                    <span className="text-[#1C1C1A] font-semibold">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex items-center gap-1.5 p-1 rounded-sm border transition-all ${
                          selectedColor === c.name ? 'border-black bg-[#F5F4F0]' : 'border-transparent hover:border-[#D1CDC3]'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-[#33312E] pr-1.5">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#736F66] uppercase tracking-wider font-medium">Размер:</span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="inline-flex items-center gap-1 text-[#66635C] hover:text-black underline underline-offset-2"
                  >
                    <Ruler size={13} />
                    <span>Таблица размеров</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-12 px-3 py-2 text-xs font-medium border uppercase tracking-wider transition-colors ${
                        selectedSize === sz
                          ? 'border-[#1C1C1A] bg-[#1C1C1A] text-white'
                          : 'border-[#D9D6CE] bg-white text-[#2C2C2A] hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs text-[#736F66] uppercase tracking-wider font-medium">Количество:</span>
                <div className="flex items-center border border-[#DDD9D2] rounded-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm hover:bg-[#F2EFE9] text-[#1C1C1A] transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 text-xs font-medium text-center min-w-8">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-sm hover:bg-[#F2EFE9] text-[#1C1C1A] transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#807C73]">
                  {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Под заказ'}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5 mb-8">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 rounded-xs"
                  >
                    <ShoppingBag size={15} />
                    <span>Добавить в корзину</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 border transition-colors rounded-xs ${
                      isFavorited
                        ? 'border-[#8C2D19] bg-[#8C2D19] text-white'
                        : 'border-[#DDD9D2] text-[#2C2C2A] hover:border-black'
                    }`}
                    title={isFavorited ? 'В избранном' : 'В вишлист'}
                  >
                    <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 border border-[#1C1C1A] text-[#1C1C1A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#F5F4F0] transition-colors rounded-xs"
                >
                  Купить в один клик
                </button>

                {addedToast && (
                  <div className="p-2.5 bg-[#EFECE4] text-[#242321] text-xs flex items-center justify-center gap-2 rounded-xs animate-fadeIn font-medium">
                    <Check size={14} className="text-[#3E7B44]" />
                    <span>Товар добавлен в корзину</span>
                  </div>
                )}
              </div>

              {/* Accordions */}
              <div className="border-t border-[#EFECE6] text-xs divide-y divide-[#EFECE6]">
                <div>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'composition' ? '' : 'composition')}
                    className="w-full py-3 flex items-center justify-between text-left font-medium text-[#1C1C1A]"
                  >
                    <span className="uppercase tracking-wider">Состав и происхождение</span>
                    {openAccordion === 'composition' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openAccordion === 'composition' && (
                    <div className="pb-3 text-[#615E57] space-y-1.5 leading-relaxed font-light">
                      <p><strong>Материал:</strong> {product.composition}</p>
                      <p><strong>Уход:</strong> {product.care}</p>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}
                    className="w-full py-3 flex items-center justify-between text-left font-medium text-[#1C1C1A]"
                  >
                    <span className="uppercase tracking-wider">Доставка и примерка</span>
                    {openAccordion === 'delivery' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openAccordion === 'delivery' && (
                    <div className="pb-3 text-[#615E57] space-y-1 leading-relaxed font-light">
                      <p>• Бесплатная доставка курьером при заказе от 150 000 ₸.</p>
                      <p>• Примерка до 15 минут в присутствии курьера.</p>
                      <p>• Возможность примерки смежных размеров и выкуп только подошедших позиций.</p>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'boutiques' ? '' : 'boutiques')}
                    className="w-full py-3 flex items-center justify-between text-left font-medium text-[#1C1C1A]"
                  >
                    <span className="uppercase tracking-wider">Наличие в бутиках</span>
                    {openAccordion === 'boutiques' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openAccordion === 'boutiques' && (
                    <div className="pb-3 text-[#615E57] space-y-1.5 font-light">
                      <div className="flex justify-between items-center">
                        <span>Москва, Столешников пер., 14</span>
                        <span className="text-[#3E7B44] font-medium">В наличии</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Санкт-Петербург, Невский пр., 48</span>
                        <span className="text-[#3E7B44] font-medium">В наличии</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Sub-view */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>
            <h3 className="font-serif text-xl mb-4 text-[#111111]">Таблица размеров VELORA</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E3DFD5] text-[#807C73]">
                  <th className="py-2">Размер</th>
                  <th className="py-2">RU</th>
                  <th className="py-2">Обхват груди (см)</th>
                  <th className="py-2">Талия (см)</th>
                  <th className="py-2">Бедра (см)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-[#33312E]">
                <tr><td className="py-2 font-medium">XS</td><td>40-42</td><td>82-86</td><td>62-66</td><td>88-92</td></tr>
                <tr><td className="py-2 font-medium">S</td><td>42-44</td><td>86-90</td><td>66-70</td><td>92-96</td></tr>
                <tr><td className="py-2 font-medium">M</td><td>44-46</td><td>90-94</td><td>70-74</td><td>96-100</td></tr>
                <tr><td className="py-2 font-medium">L</td><td>46-48</td><td>94-98</td><td>74-78</td><td>100-104</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-[#8C887E] mt-4 font-light">
              Если ваши параметры находятся между размерами, мы рекомендуем выбрать больший или заказать примерку обоих размеров.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
